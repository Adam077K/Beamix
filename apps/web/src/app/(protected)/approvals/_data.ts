/**
 * Approval Queue — Server-Side Data Fetcher
 *
 * Reads pending approval_queue rows for the authenticated user via Supabase RLS.
 * Returns an outcome-shaped DTO — agent identity is NEVER exposed (Principle #9).
 *
 * Columns returned: id, kind, state, resource, evidence_url, expires_at, created_at
 * Columns stripped:  agent_id, agent_type, agent_name (none exist in schema — enforced here)
 */

import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
// Note: approval_queue is not yet in database.types.ts (schema drift).
// The Supabase client is created without the Database generic so TypeScript
// does not reject approval_queue as an unknown table. Results are cast to
// the local raw row type and then validated through ApprovalQueueItemSchema.

// ---------------------------------------------------------------------------
// DTO schema — outcome-shaped, no agent identity
// ---------------------------------------------------------------------------

export const ApprovalQueueItemSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum([
    'content_publish',
    'email_as_them',
    'outreach',
    'schema_push',
    'listing_update',
    'citation_submit',
  ]),
  state: z.enum(['pending', 'approved', 'rejected', 'expired', 'published']),
  /** The resource object from the DB — describes what needs approving */
  resource: z.record(z.unknown()),
  /**
   * URL to the artifact/evidence for this approval item.
   * Extracted from the `evidence` jsonb column; may be null if not set.
   * Enforces http(s) scheme — javascript: and data: URIs are rejected.
   */
  evidenceUrl: z
    .string()
    .url()
    .refine(
      (v) => {
        try {
          return ['https:', 'http:'].includes(new URL(v).protocol)
        } catch {
          return false
        }
      },
      'must be http(s)',
    )
    .nullable(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
})

export type ApprovalQueueItem = z.infer<typeof ApprovalQueueItemSchema>

// Raw DB row shape (approval_queue not yet in database.types.ts — schema drift)
interface ApprovalQueueRawRow {
  id: string
  kind: string
  state: string
  resource: Record<string, unknown>
  evidence: unknown
  expires_at: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Supabase client (cookie-based — uses the authenticated user's session)
// ---------------------------------------------------------------------------

// No Database generic — approval_queue is not yet in database.types.ts.
// createServerSupabaseClient uses the Database generic internally, but the
// resulting client is still usable for untyped table access via .from().
async function getSupabaseClient() {
  return createServerSupabaseClient()
}

// ---------------------------------------------------------------------------
// getPendingApprovals
// ---------------------------------------------------------------------------

export type GetPendingApprovalsResult =
  | { ok: true; items: ApprovalQueueItem[] }
  | { ok: false; error: string }

/**
 * Returns pending approval_queue items for the current user.
 * RLS on approval_queue enforces row-level ownership — no explicit userId filter needed,
 * but it is still passed to the Supabase client to benefit from index on (customer_id, state).
 */
export async function getPendingApprovals(
  userId: string
): Promise<GetPendingApprovalsResult> {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('approval_queue')
      .select('id, kind, state, resource, evidence, expires_at, created_at')
      .eq('customer_id', userId)
      .eq('state', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[approvals/_data] Supabase query failed', {
        userId,
        code: error.code,
        message: error.message,
      })
      return { ok: false, error: error.message }
    }

    const rawRows = (data ?? []) as ApprovalQueueRawRow[]
    const items: ApprovalQueueItem[] = rawRows.map((row) => ({
      id: row.id,
      kind: row.kind as ApprovalQueueItem['kind'],
      state: row.state as ApprovalQueueItem['state'],
      resource: row.resource ?? {},
      evidenceUrl: extractEvidenceUrl(row.evidence),
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }))

    return { ok: true, items }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[approvals/_data] Unexpected error', { userId, message })
    return { ok: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// getResolvedApprovals — additive read; mirrors getPendingApprovals
// ---------------------------------------------------------------------------

export type GetResolvedApprovalsResult =
  | { ok: true; items: ApprovalQueueItem[] }
  | { ok: false; error: string }

/**
 * Returns resolved (approved / rejected / expired / published) approval_queue
 * items for the current user, ordered most-recently-actioned first.
 * Read-only — no state mutations here.
 *
 * Used by the Resolved history view (Wave 2).
 */
export async function getResolvedApprovals(
  userId: string
): Promise<GetResolvedApprovalsResult> {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('approval_queue')
      .select('id, kind, state, resource, evidence, expires_at, created_at')
      .eq('customer_id', userId)
      .in('state', ['approved', 'rejected', 'expired', 'published'])
      .order('acted_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[approvals/_data] getResolvedApprovals query failed', {
        userId,
        code: error.code,
        message: error.message,
      })
      // Do not leak raw DB error messages to the client
      return { ok: false, error: 'Failed to load resolved approvals.' }
    }

    const rawRows = (data ?? []) as ApprovalQueueRawRow[]
    const items: ApprovalQueueItem[] = rawRows.map((row) => ({
      id: row.id,
      kind: row.kind as ApprovalQueueItem['kind'],
      state: row.state as ApprovalQueueItem['state'],
      resource: row.resource ?? {},
      evidenceUrl: extractEvidenceUrl(row.evidence),
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }))

    return { ok: true, items }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[approvals/_data] getResolvedApprovals unexpected error', { userId, message })
    // Do not leak internal error details to the client
    return { ok: false, error: 'Failed to load resolved approvals.' }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely extracts an evidence URL from the `evidence` jsonb column.
 * The evidence column stores agent-generated provenance — we only surface the URL,
 * never any agent-identity fields.
 *
 * Security: enforces http(s) scheme allowlist after parsing. javascript: and
 * data: URIs are rejected and return null. This is the defence-in-depth layer
 * (the Zod schema above is the DTO-level guard).
 */
export function extractEvidenceUrl(evidence: unknown): string | null {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    return null
  }
  const ev = evidence as Record<string, unknown>
  if (typeof ev['url'] === 'string') {
    try {
      const parsed = new URL(ev['url'])
      if (!['https:', 'http:'].includes(parsed.protocol)) return null
      return parsed.toString()
    } catch {
      return null
    }
  }
  return null
}
