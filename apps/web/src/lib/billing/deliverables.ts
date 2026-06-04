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
import { inngest } from '../../inngest/client';
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
 *
 * NOTE: `consume_deliverable` RPC is typed in `database.types.ts` and is called
 * via `getAdminClient()` (fully typed). Only `deliverables_per_customer_per_month`
 * table reads/upserts use this raw client (Wave 2 table not yet in generated types).
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
 * - For capped tiers: uses the atomic `consume_deliverable` DB RPC to eliminate the
 *   read-modify-write race. The RPC does a conditional UPDATE...RETURNING in one
 *   transaction — two concurrent calls both reading used=cap-1 cannot both succeed.
 * - For unlimited tiers (capValue === null, i.e. Professional): falls back to a simple
 *   read-increment-write because there is no cap to bypass. Race risk only matters when
 *   a cap can be breached.
 * - Throws `OverTierCapError` on cap breach.
 * - Writes `audit_log` row on every consume and every block (Principle #10).
 *
 * NOTE: For `count > 1` on capped tiers, the RPC is called `count` times sequentially.
 * Each call is individually atomic; the combined sequence is not. The current product
 * only ever passes `count: 1` from agent publish paths, so this is safe for the MVP.
 *
 * @throws {OverTierCapError} when the customer has hit their monthly cap.
 * @throws {Error} on unexpected DB errors.
 */
export async function consumeDeliverable(rawInput: ConsumeDeliverableInput): Promise<void> {
  // Validate input at boundary
  const input = ConsumeDeliverableInputSchema.parse(rawInput);
  const { customerId, kind, count } = input;
  const monthAnchor = currentMonthAnchor();
  const raw = getRawAdminClient();
  const dbColumn = KIND_TO_DB_COLUMN[kind];

  // 1. Resolve customer tier (cheap read — only the increment must be atomic).
  const currentTier = await resolveCustomerTier(customerId);
  const caps = TIER_CAPS[currentTier];
  const capValue = caps[kind];

  // 2. Idempotent UPSERT — create the period row with zeroed counters if missing.
  //    Required before both the unlimited read-write path and the capped RPC path
  //    (RPC returns null when row is missing, so we guarantee the row exists first).
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

  // 3. Unlimited tier (capValue === null → Professional): no cap to enforce, no RPC needed.
  if (capValue === null) {
    // Read current count then write new value. Race is acceptable here: there is no
    // cap ceiling to bypass, so over-counting is not a money-leak risk.
    const { data: rowData, error: readError } = await raw
      .from('deliverables_per_customer_per_month')
      .select(dbColumn)
      .eq('customer_id', customerId)
      .eq('month_anchor', monthAnchor)
      .single();

    if (readError || !rowData) {
      console.error('[deliverables] failed to read period row (unlimited tier)', {
        customerId,
        monthAnchor,
        error: readError?.message,
      });
      throw new Error(
        `Failed to read deliverables period row: ${readError?.message ?? 'no row returned'}`,
      );
    }

    const currentCount = ((rowData as unknown as Record<string, number>)[dbColumn] ?? 0);

    const { error: incError } = await raw
      .from('deliverables_per_customer_per_month')
      .update({ [dbColumn]: currentCount + count })
      .eq('customer_id', customerId)
      .eq('month_anchor', monthAnchor);

    if (incError) {
      console.error('[deliverables] failed to increment counter (unlimited tier)', {
        customerId,
        kind,
        count,
        monthAnchor,
        error: incError.message,
      });
      throw new Error(`Failed to increment deliverable counter: ${incError.message}`);
    }

    await writeAuditLog({
      customerId,
      eventType: 'deliverable_consumed',
      kind,
      count,
      monthAnchor,
      currentTier,
      capValue: null,
      usedCount: currentCount + count,
    });
    return;
  }

  // 4. Capped tier: atomic conditional increment via RPC.
  //    The RPC returns the new count on success, or null when current >= p_cap.
  //    Because we upserted the row above, null here means over-cap (not missing row).
  let newCount: number | null = null;

  for (let i = 0; i < count; i++) {
    const { data: rpcResult, error: rpcError } = await getAdminClient().rpc(
      'consume_deliverable',
      {
        p_customer_id: customerId,
        p_month_anchor: monthAnchor,
        p_kind: kind,
        p_cap: capValue,
      },
    );

    if (rpcError) {
      console.error('[deliverables] consume_deliverable RPC failed', {
        customerId,
        kind,
        monthAnchor,
        capValue,
        iteration: i,
        error: rpcError.message,
      });
      throw new Error(`consume_deliverable RPC error: ${rpcError.message}`);
    }

    if (rpcResult === null || rpcResult === undefined) {
      // RPC returned null → over-cap. Row exists (upserted above).
      // Read current count for audit log and error message.
      const { data: currentRow } = await raw
        .from('deliverables_per_customer_per_month')
        .select(dbColumn)
        .eq('customer_id', customerId)
        .eq('month_anchor', monthAnchor)
        .single();

      const usedCount = currentRow
        ? ((currentRow as unknown as Record<string, number>)[dbColumn] ?? 0)
        : 0;

      await writeAuditLog({
        customerId,
        eventType: 'deliverable_blocked',
        kind,
        count,
        monthAnchor,
        currentTier,
        capValue,
        usedCount,
      });

      // Fire-and-forget nudge event. At-least-once is fine (a nudge, not a ledger write).
      // Cap enforcement NEVER depends on this emit — the throw below is unconditional.
      inngest
        .send({
          name: 'deliverables.over_cap',
          data: {
            customerId,
            kind,
            currentCount: usedCount,
            cap: capValue,
            occurredAt: new Date().toISOString(),
          },
        })
        .catch((e: unknown) => {
          console.error('[deliverables] over_cap emit failed', {
            customerId,
            kind,
            error: e instanceof Error ? e.message : String(e),
          });
        });

      throw new OverTierCapError({
        kind,
        currentTier,
        capValue,
        usedCount,
      });
    }

    newCount = rpcResult as number;
  }

  // 5. Audit log on successful consume.
  await writeAuditLog({
    customerId,
    eventType: 'deliverable_consumed',
    kind,
    count,
    monthAnchor,
    currentTier,
    capValue,
    usedCount: newCount ?? capValue,
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
