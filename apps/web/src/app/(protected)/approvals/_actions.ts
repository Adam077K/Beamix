/**
 * Approval Queue — Server Actions
 *
 * approveApprovalItem(id) — sets state to 'approved'
 * rejectApprovalItem(id)  — sets state to 'rejected'
 *
 * Both actions:
 *   1. Verify session user via user cookie client (Supabase getUser — server-validated,
 *      not cookie-only). This is the ONLY use of the user client here.
 *   2. Perform the UPDATE via the service-role admin client with explicit
 *      `.eq('customer_id', userId)` authorization scoping, because approval_queue
 *      RLS is read-only for customers (Pattern A: only a SELECT policy for
 *      customer_id = auth.uid(); no UPDATE policy exists). Using the anon/user
 *      client for the UPDATE would silently match 0 rows for everyone.
 *   3. Fire Inngest event (approval.approved / approval.rejected)
 *   4. Write audit_log row (also uses admin client — consistent)
 *
 * Note: approval_queue is not yet in database.types.ts (schema drift). The admin
 * client for approval_queue operations uses a raw (un-generic) client so TypeScript
 * does not reject the table name. The audit_log client retains the Database generic.
 *
 * Return shape: { ok: true } | { ok: false, error: string }
 */

'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { inngest } from '@/inngest/client'
import type { Database } from '@/lib/db/database.types'

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const ApprovalIdSchema = z.string().uuid('Approval ID must be a valid UUID')

// ---------------------------------------------------------------------------
// Action result type
// ---------------------------------------------------------------------------

export type ApprovalActionResult = { ok: true } | { ok: false; error: string }

// ---------------------------------------------------------------------------
// Local type — approval_queue row shape (not yet in database.types.ts)
// ---------------------------------------------------------------------------

interface ApprovalQueueRow {
  id: string
  kind: string
  customer_id: string
}

// ---------------------------------------------------------------------------
// Supabase clients
// ---------------------------------------------------------------------------

/** Cookie-based client — uses the authenticated user's session (for getUser only). */
async function getUserClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Action — cookie writes may fail in some edge cases; not an error
          }
        },
      },
    }
  )
}

/**
 * Raw (un-generic) service-role client for approval_queue operations.
 * approval_queue is not yet in database.types.ts; using the typed Database generic
 * would produce TS2769 (unknown table). We use the un-generic client and cast results
 * to the local ApprovalQueueRow type.
 */
function getApprovalQueueClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[approvals/_actions] Missing Supabase service-role env vars')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Typed service-role client for audit_log writes (uses Database generic). */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[approvals/_actions] Missing Supabase service-role env vars')
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// Shared action logic
// ---------------------------------------------------------------------------

async function performStateTransition(
  id: string,
  newState: 'approved' | 'rejected'
): Promise<ApprovalActionResult> {
  // Validate input at the boundary
  const parsed = ApprovalIdSchema.safeParse(id)
  if (!parsed.success) {
    return { ok: false, error: `Invalid approval ID: ${parsed.error.errors[0]?.message ?? 'unknown'}` }
  }

  const supabase = await getUserClient()

  // Server-validated user (not just cookie) — prevents session-fixation attacks
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Not authenticated' }
  }

  const userId = user.id

  // UPDATE via service-role admin client with explicit ownership scoping.
  // approval_queue RLS is Pattern A (read-only for customers: SELECT only, no UPDATE policy).
  // Using the user-client anon key for UPDATE would silently return 0 rows for everyone.
  // We enforce authorization here with .eq('customer_id', userId) instead.
  const aqClient = getApprovalQueueClient()
  const now = new Date().toISOString()
  const { data: updatedRaw, error: updateError } = await aqClient
    .from('approval_queue')
    .update({ state: newState, acted_at: now })
    .eq('id', parsed.data)
    .eq('customer_id', userId) // Explicit ownership scoping — replaces broken RLS reliance
    .eq('state', 'pending') // Only transition from pending
    .select('id, kind, customer_id')
    .maybeSingle() // 0 rows must not throw

  if (updateError) {
    console.error('[approvals/_actions] DB update failed', {
      id: parsed.data,
      newState,
      userId,
      code: (updateError as { code?: string }).code,
      message: updateError.message,
    })
    return { ok: false, error: 'Failed to update approval status' }
  }

  if (!updatedRaw) {
    // Row not found, not owned by this user, or already actioned
    return {
      ok: false,
      error: 'Approval item not found or already actioned',
    }
  }

  const updated = updatedRaw as ApprovalQueueRow

  // Fire Inngest event — non-blocking; if this fails we log but still return ok
  const inngestEventName =
    newState === 'approved' ? 'approval.approved' : 'approval.rejected'

  try {
    await inngest.send({
      name: inngestEventName as 'approval.approved' | 'approval.rejected',
      data: {
        approvalId: updated.id,
        kind: updated.kind,
        customerId: updated.customer_id,
        actedAt: now,
      },
    })
  } catch (err) {
    // Log but do NOT fail the action — Inngest dispatch failure is non-critical here
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[approvals/_actions] Inngest dispatch failed', {
      event: inngestEventName,
      approvalId: updated.id,
      message,
    })
  }

  // Write audit_log — typed admin client (audit_log IS in database.types.ts)
  try {
    const admin = getAdminClient()
    await admin.from('audit_log').insert({
      actor_id: userId,
      actor_type: 'user',
      event_type: `approval.${newState}`,
      target_id: updated.id,
      target_table: 'approval_queue',
      payload: {
        approval_id: updated.id,
        kind: updated.kind,
        new_state: newState,
        acted_at: now,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Deliberate non-fatal-but-logged choice (Principle #10): audit log failure must never
    // block a real approval, but the structured payload must be alertable in production.
    console.error('[approvals/_actions] audit_log write failed', {
      event_type: `approval.${newState}`,
      approvalId: updated.id,
      customerId: updated.customer_id,
      message,
    })
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// Exported Server Actions
// ---------------------------------------------------------------------------

/**
 * Marks an approval queue item as 'approved'.
 * Fires `approval.approved` Inngest event + writes audit_log.
 */
export async function approveApprovalItem(id: string): Promise<ApprovalActionResult> {
  return performStateTransition(id, 'approved')
}

/**
 * Marks an approval queue item as 'rejected'.
 * Fires `approval.rejected` Inngest event + writes audit_log.
 */
export async function rejectApprovalItem(id: string): Promise<ApprovalActionResult> {
  return performStateTransition(id, 'rejected')
}
