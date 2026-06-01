/**
 * Weekly context builder for the customer-success agent.
 *
 * Queries `approval_queue` to populate the three buckets the LLM uses:
 *   - wins    — items approved in the last 7 days (cap 5)
 *   - queued  — items currently pending (cap 5)
 *   - concerns — items rejected in the last 7 days (cap 5)
 *
 * Source table: approval_queue
 *   - customer_id  uuid  FK → user_profiles(id)
 *   - state        approval_state enum ('pending' | 'approved' | 'rejected' | 'expired' | 'published')
 *   - kind         approval_kind enum ('content_publish' | 'email_as_them' | 'outreach' | 'schema_push' | 'listing_update' | 'citation_submit')
 *   - resource     jsonb (may contain a 'title' field)
 *   - acted_at     timestamptz (set when state transitions to approved/rejected)
 *   - created_at   timestamptz (when the row was inserted)
 *
 * The 7-day window uses `acted_at` for approved/rejected rows (that is when the event
 * happened relative to the customer) and `created_at` for pending rows (most recently
 * added work). Rows lacking acted_at for non-pending states are excluded from windowed
 * buckets to avoid floating stale items.
 *
 * NOTE: approval_queue is not yet in database.types.ts (Wave 2 schema drift).
 * We use a typed local interface and cast the client to avoid TS2769. This matches
 * the pattern in send-approval-pending-email.ts and digest-builder.ts.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CustomerSuccessInput } from './index';

// ---------------------------------------------------------------------------
// Local types — mirrors approval_queue columns we select
// ---------------------------------------------------------------------------

interface ApprovalQueueRow {
  id: string;
  kind: string;
  state: string;
  resource: Record<string, unknown> | null;
  acted_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Human-readable description per approval kind
// Kind → concise label suitable for LLM bullet points. No agent names per Principle #9.
// ---------------------------------------------------------------------------

const KIND_LABEL: Record<string, string> = {
  content_publish: 'content piece',
  email_as_them: 'outreach email',
  outreach: 'outreach action',
  schema_push: 'schema update',
  listing_update: 'listing update',
  citation_submit: 'citation submission',
};

function describeRow(row: ApprovalQueueRow): string {
  const kindLabel = KIND_LABEL[row.kind] ?? row.kind;
  const title =
    row.resource !== null &&
    typeof row.resource === 'object' &&
    typeof row.resource['title'] === 'string'
      ? row.resource['title']
      : null;
  return title ? `${kindLabel}: "${title}"` : kindLabel;
}

// ---------------------------------------------------------------------------
// Cap constant — matches the brief spec
// ---------------------------------------------------------------------------

const BUCKET_CAP = 5;

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Build the `weeklyContext` for `CustomerSuccessInput` by querying `approval_queue`.
 *
 * @param customerId - user_profiles.id (auth uid) of the customer.
 * @param supabase   - Supabase client with service-role access (approval_queue is service-role-only).
 * @returns          Populated weeklyContext — arrays may be empty; never undefined.
 */
export async function buildWeeklyContext(
  customerId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
): Promise<CustomerSuccessInput['weeklyContext']> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Wins: approved in the last 7 days ─────────────────────────────────────
  // `acted_at` is set when state transitions to 'approved'.
  const { data: approvedRows, error: approvedError } = await supabase
    .from('approval_queue')
    .select('id, kind, state, resource, acted_at, created_at')
    .eq('customer_id', customerId)
    .eq('state', 'approved')
    .gte('acted_at', sevenDaysAgo)
    .order('acted_at', { ascending: false })
    .limit(BUCKET_CAP);

  if (approvedError) {
    console.error('[weekly-context] approval_queue wins query failed', {
      customerId,
      error: approvedError.message,
    });
  }

  // ── Queued: currently pending ─────────────────────────────────────────────
  const { data: pendingRows, error: pendingError } = await supabase
    .from('approval_queue')
    .select('id, kind, state, resource, acted_at, created_at')
    .eq('customer_id', customerId)
    .eq('state', 'pending')
    .order('created_at', { ascending: false })
    .limit(BUCKET_CAP);

  if (pendingError) {
    console.error('[weekly-context] approval_queue queued query failed', {
      customerId,
      error: pendingError.message,
    });
  }

  // ── Concerns: rejected in the last 7 days ─────────────────────────────────
  // `acted_at` is set when state transitions to 'rejected'.
  const { data: rejectedRows, error: rejectedError } = await supabase
    .from('approval_queue')
    .select('id, kind, state, resource, acted_at, created_at')
    .eq('customer_id', customerId)
    .eq('state', 'rejected')
    .gte('acted_at', sevenDaysAgo)
    .order('acted_at', { ascending: false })
    .limit(BUCKET_CAP);

  if (rejectedError) {
    console.error('[weekly-context] approval_queue concerns query failed', {
      customerId,
      error: rejectedError.message,
    });
  }

  const wins = ((approvedRows ?? []) as ApprovalQueueRow[]).map(describeRow);
  const queued = ((pendingRows ?? []) as ApprovalQueueRow[]).map(describeRow);
  const concerns = ((rejectedRows ?? []) as ApprovalQueueRow[]).map(describeRow);

  return { wins, queued, concerns };
}
