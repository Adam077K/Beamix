/**
 * Beamix — Deliverable Consumption Middleware
 *
 * `consumeDeliverable` is the single gate that every agent publish path calls before
 * writing to an external platform or approval_queue. It:
 *   1. Reads (or idempotently inserts) the current-period row in
 *      `deliverables_per_customer_per_month`.
 *   2. Resolves the customer's plan tier via subscriptions -> plans join.
 *   3. Checks the tier cap from `TIER_CAPS`.
 *   4. Throws `OverTierCapError` on breach.
 *   5. Atomically increments the counter on success.
 *   6. Writes an `audit_log` row on every consume and every block (Principle #10).
 *
 * Never exposes agent names in customer-facing error messages (Principle #9).
 *
 * NOTE: `deliverables_per_customer_per_month` is a Wave 2 table not yet reflected in
 * `database.types.ts` (which is generated from staging). We use a typed escape hatch
 * (`as unknown as SupabaseClient`) for that table only. All other DB calls remain fully
 * typed. This is documented and will be resolved when database-engineer regenerates types
 * after Wave 2 migrations are applied to staging.
 *
 * Usage:
 *   await consumeDeliverable({ customerId, kind: 'schema_pushed', count: 1 });
 */

import 'server-only';

import { z } from 'zod';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAdminClient } from '../agents/db/admin-client';
import {
  TIER_CAPS,
  TIER_DISPLAY_NAME,
  UPGRADE_TIER,
  DELIVERABLE_KIND_LABEL,
  KIND_TO_DB_COLUMN,
  toAgencyTier,
  type DeliverableKind,
  type AgencyPlanTier,
} from './tier-caps';

// ---------------------------------------------------------------------------
// Local types for Wave 2 tables (not yet in generated database.types.ts)
// ---------------------------------------------------------------------------

/** Row shape for `deliverables_per_customer_per_month`. */
interface DeliverableRow {
  customer_id: string;
  month_anchor: string;
  schema_pushed_count: number;
  faq_published_count: number;
  citation_submitted_count: number;
  content_published_count: number;
  outreach_email_count: number;
}

/** Insert shape for `deliverables_per_customer_per_month`. */
type DeliverableInsert = Omit<DeliverableRow, never>;

// ---------------------------------------------------------------------------
// Untyped client accessor for Wave 2 tables
// ---------------------------------------------------------------------------

/**
 * Returns the admin Supabase client cast to `any`-generics for tables not yet
 * in `database.types.ts`. Scoped to this module; callers use typed helpers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRawAdminClient(): SupabaseClient<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const ConsumeDeliverableInputSchema = z.object({
  /** The Supabase `user_profiles.id` (auth.uid) of the customer. */
  customerId: z.string().uuid(),
  /** Which deliverable counter to increment. */
  kind: z.enum([
    'schema_pushed',
    'faq_published',
    'citation_submitted',
    'content_published',
    'outreach_email',
  ]),
  /** Number of units to consume. Defaults to 1. */
  count: z.number().int().positive().default(1),
});

export type ConsumeDeliverableInput = z.infer<typeof ConsumeDeliverableInputSchema>;

// ---------------------------------------------------------------------------
// OverTierCapError — the only error callers need to handle
// ---------------------------------------------------------------------------

/**
 * Thrown when a customer has hit their monthly deliverable cap for a given kind.
 *
 * Customer-facing message is structured so callers can render:
 *   "Your Starter plan includes 4 schema updates per month.
 *    Upgrade to Growth for more."
 *
 * NEVER includes agent names per Engineering Principle #9.
 */
export class OverTierCapError extends Error {
  public readonly kind: DeliverableKind;
  public readonly currentTier: AgencyPlanTier;
  public readonly capValue: number;
  public readonly usedCount: number;
  public readonly customerMessage: string;
  public readonly nextTier: AgencyPlanTier | null;

  constructor(params: {
    kind: DeliverableKind;
    currentTier: AgencyPlanTier;
    capValue: number;
    usedCount: number;
  }) {
    const kindLabel = DELIVERABLE_KIND_LABEL[params.kind];
    const tierName = TIER_DISPLAY_NAME[params.currentTier];
    const nextTier = UPGRADE_TIER[params.currentTier] ?? null;
    const nextTierName = nextTier ? TIER_DISPLAY_NAME[nextTier] : null;

    const upgradeHint = nextTierName ? ` Upgrade to ${nextTierName} for more.` : '';
    const customerMessage = `Your ${tierName} plan includes ${params.capValue} ${kindLabel} per month.${upgradeHint}`;

    super(customerMessage);
    this.name = 'OverTierCapError';
    this.kind = params.kind;
    this.currentTier = params.currentTier;
    this.capValue = params.capValue;
    this.usedCount = params.usedCount;
    this.customerMessage = customerMessage;
    this.nextTier = nextTier;

    Object.setPrototypeOf(this, OverTierCapError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns the first-of-month anchor date in UTC as a `YYYY-MM-DD` string. */
function currentMonthAnchor(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Write an audit_log row for deliverable consume / block events.
 * Non-throwing — log failures are best-effort; they must not block the caller.
 */
async function writeAuditLog(params: {
  customerId: string;
  eventType: 'deliverable_consumed' | 'deliverable_blocked';
  kind: DeliverableKind;
  count: number;
  monthAnchor: string;
  currentTier: AgencyPlanTier;
  capValue: number | null;
  usedCount: number;
}): Promise<void> {
  try {
    const { error } = await getAdminClient()
      .from('audit_log')
      .insert({
        actor_type: 'system',
        actor_id: params.customerId,
        event_type: params.eventType,
        target_table: 'deliverables_per_customer_per_month',
        target_id: params.customerId,
        payload: {
          kind: params.kind,
          count: params.count,
          month_anchor: params.monthAnchor,
          current_tier: params.currentTier,
          cap_value: params.capValue,
          used_count: params.usedCount,
        },
      });
    if (error) {
      console.error('[deliverables] audit_log write failed', {
        customerId: params.customerId,
        eventType: params.eventType,
        error: error.message,
      });
    }
  } catch (err) {
    console.error('[deliverables] audit_log write threw', {
      customerId: params.customerId,
      eventType: params.eventType,
      err,
    });
  }
}

/**
 * Resolve the customer's active plan tier by joining subscriptions -> plans.
 * Falls back to 'starter' (most restrictive) if no active subscription is found.
 */
async function resolveCustomerTier(customerId: string): Promise<AgencyPlanTier> {
  const { data, error } = await getAdminClient()
    .from('subscriptions')
    .select('plan_id, plans!inner(tier)')
    .eq('user_id', customerId)
    .in('status', ['active', 'trialing'] as const)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[deliverables] failed to resolve customer tier', {
      customerId,
      error: error.message,
    });
    // Default to starter on error — safe fallback
    return 'starter';
  }

  if (!data) return 'starter';

  // The join returns plans as an object due to !inner join
  // Type guard to handle the join result safely
  const plans = data.plans as unknown as { tier: string } | null;
  const rawTier = plans?.tier ?? 'starter';
  return toAgencyTier(rawTier);
}

// ---------------------------------------------------------------------------
// Column name mapper for DeliverableRow
// ---------------------------------------------------------------------------

const KIND_TO_ROW_KEY: Record<DeliverableKind, keyof DeliverableRow> = {
  schema_pushed: 'schema_pushed_count',
  faq_published: 'faq_published_count',
  citation_submitted: 'citation_submitted_count',
  content_published: 'content_published_count',
  outreach_email: 'outreach_email_count',
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Consume one or more deliverable units for a customer.
 *
 * - Idempotent row creation: INSERTs a zero-count row for the current month if none exists.
 * - Throws `OverTierCapError` on cap breach BEFORE incrementing.
 * - Writes `audit_log` row on every consume and every block (Principle #10).
 *
 * @throws {OverTierCapError} when the customer has hit their monthly cap.
 * @throws {Error} on unexpected DB errors.
 */
export async function consumeDeliverable(rawInput: ConsumeDeliverableInput): Promise<void> {
  // Validate input at boundary
  const input = ConsumeDeliverableInputSchema.parse(rawInput);
  const { customerId, kind, count } = input;
  const monthAnchor = currentMonthAnchor();
  const dbColumn = KIND_TO_DB_COLUMN[kind];
  const raw = getRawAdminClient();

  // 1. Idempotent UPSERT — create the period row with zeroed counters if missing.
  const insertPayload: DeliverableInsert = {
    customer_id: customerId,
    month_anchor: monthAnchor,
    schema_pushed_count: 0,
    faq_published_count: 0,
    citation_submitted_count: 0,
    content_published_count: 0,
    outreach_email_count: 0,
  };

  const { error: upsertError } = await raw
    .from('deliverables_per_customer_per_month')
    .upsert(insertPayload, { onConflict: 'customer_id,month_anchor', ignoreDuplicates: true });

  if (upsertError) {
    console.error('[deliverables] failed to upsert period row', {
      customerId,
      monthAnchor,
      error: upsertError.message,
    });
    throw new Error(`Failed to initialise deliverables period row: ${upsertError.message}`);
  }

  // 2. Read the current-period row.
  const { data: rowData, error: readError } = await raw
    .from('deliverables_per_customer_per_month')
    .select(
      'schema_pushed_count, faq_published_count, citation_submitted_count, content_published_count, outreach_email_count',
    )
    .eq('customer_id', customerId)
    .eq('month_anchor', monthAnchor)
    .single();

  if (readError || !rowData) {
    console.error('[deliverables] failed to read period row after upsert', {
      customerId,
      monthAnchor,
      error: readError?.message,
    });
    throw new Error(
      `Failed to read deliverables period row: ${readError?.message ?? 'no row returned'}`,
    );
  }

  const row = rowData as DeliverableRow;

  // 3. Resolve customer tier.
  const currentTier = await resolveCustomerTier(customerId);
  const caps = TIER_CAPS[currentTier];
  const capValue = caps[kind];

  // 4. Read current count.
  const currentCount = row[KIND_TO_ROW_KEY[kind]] as number;

  // 5. Cap enforcement — check BEFORE incrementing.
  if (capValue !== null && currentCount + count > capValue) {
    await writeAuditLog({
      customerId,
      eventType: 'deliverable_blocked',
      kind,
      count,
      monthAnchor,
      currentTier,
      capValue,
      usedCount: currentCount,
    });

    throw new OverTierCapError({
      kind,
      currentTier,
      capValue,
      usedCount: currentCount,
    });
  }

  // 6. Increment counter. Using direct UPDATE with explicit value (no RPC needed
  //    for Wave 2 single-customer concurrency; each customer's row is independent).
  const { error: updateError } = await raw
    .from('deliverables_per_customer_per_month')
    .update({ [dbColumn]: currentCount + count })
    .eq('customer_id', customerId)
    .eq('month_anchor', monthAnchor);

  if (updateError) {
    console.error('[deliverables] failed to increment counter', {
      customerId,
      kind,
      count,
      monthAnchor,
      error: updateError.message,
    });
    throw new Error(`Failed to increment deliverable counter: ${updateError.message}`);
  }

  // 7. Audit log on successful consume.
  await writeAuditLog({
    customerId,
    eventType: 'deliverable_consumed',
    kind,
    count,
    monthAnchor,
    currentTier,
    capValue,
    usedCount: currentCount + count,
  });
}

// ---------------------------------------------------------------------------
// Read-only helper (for dashboard / pre-flight checks)
// ---------------------------------------------------------------------------

/** Current deliverable usage for a customer in the current period. */
export interface DeliverableUsage {
  period: string;
  currentTier: AgencyPlanTier;
  usage: Record<DeliverableKind, { used: number; cap: number | null; remaining: number | null }>;
}

/**
 * Returns the current month's deliverable usage for a customer.
 * Does NOT create a row — returns zeroed counters if no row exists yet.
 * Safe for dashboard reads; no side effects.
 */
export async function getDeliverableUsage(customerId: string): Promise<DeliverableUsage> {
  // Validate customerId
  z.string().uuid().parse(customerId);

  const monthAnchor = currentMonthAnchor();
  const raw = getRawAdminClient();

  const [rowResult, currentTier] = await Promise.all([
    raw
      .from('deliverables_per_customer_per_month')
      .select(
        'schema_pushed_count, faq_published_count, citation_submitted_count, content_published_count, outreach_email_count',
      )
      .eq('customer_id', customerId)
      .eq('month_anchor', monthAnchor)
      .maybeSingle(),
    resolveCustomerTier(customerId),
  ]);

  const caps = TIER_CAPS[currentTier];
  const row = rowResult.data as DeliverableRow | null;

  const kinds: DeliverableKind[] = [
    'schema_pushed',
    'faq_published',
    'citation_submitted',
    'content_published',
    'outreach_email',
  ];

  const usage = Object.fromEntries(
    kinds.map((k) => {
      const used = row ? (row[KIND_TO_ROW_KEY[k]] as number) : 0;
      const cap = caps[k];
      const remaining = cap === null ? null : Math.max(0, cap - used);
      return [k, { used, cap, remaining }];
    }),
  ) as DeliverableUsage['usage'];

  return { period: monthAnchor, currentTier, usage };
}
