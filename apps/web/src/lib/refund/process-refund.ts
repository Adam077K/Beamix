/**
 * processRefund — append-only refund flow
 *
 * Engineering Principle #12: refund_events is APPEND-ONLY. This is the ONLY
 * place that inserts into refund_events. No UPDATE/DELETE ever.
 *
 * Flow:
 *   1. Resolve subscription + user info from Supabase.
 *   2. INSERT refund_events row (append-only).
 *   3. Cancel subscription via Paddle REST API (POST /subscriptions/:id/cancel).
 *   4. Send refund-confirmation email via Resend.
 *   5. Write audit_log row.
 *
 * Idempotency:
 *   - refund_events has UNIQUE(subscription_id, reason) — NOT enforced here
 *     because multiple refund attempts for the same sub (e.g. partial + full)
 *     should each create a row. The caller is responsible for idempotency at
 *     the API layer.
 *   - Paddle cancel is idempotent on their side (cancelling a cancelled sub → 409).
 *
 * Returns RefundResult. On partial failure (email send failed, audit failed)
 * the refund is still considered successful — those failures are logged and
 * non-blocking.
 */

import 'server-only'

import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/database.types'
import { sendEmail } from '@/lib/email/client'
import { RefundConfirmationEmail } from './refund-confirmation-email'

// ---------------------------------------------------------------------------
// Types & schemas
// ---------------------------------------------------------------------------

export const ProcessRefundInputSchema = z.object({
  subscriptionId: z.string().min(1, 'subscriptionId is required'),
  reason: z.string().min(1, 'reason is required').max(500, 'reason too long'),
})

export type ProcessRefundInput = z.infer<typeof ProcessRefundInputSchema>

export type RefundResult =
  | {
      ok: true
      refundEventId: string
      paddleCancelled: boolean
      emailSent: boolean
    }
  | {
      ok: false
      error: string
      code: 'VALIDATION_ERROR' | 'SUBSCRIPTION_NOT_FOUND' | 'INSERT_FAILED' | 'PADDLE_ERROR'
    }

// ---------------------------------------------------------------------------
// Supabase service-role client
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('[processRefund] Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('[processRefund] Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------------------
// Paddle REST helper — cancel subscription
// ---------------------------------------------------------------------------

type PaddleCancelResult = { ok: true } | { ok: false; error: string; status: number }

async function cancelPaddleSubscription(
  paddleSubscriptionId: string,
): Promise<PaddleCancelResult> {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) {
    console.error('[processRefund] PADDLE_API_KEY is not set')
    return { ok: false, error: 'PADDLE_API_KEY not configured', status: 500 }
  }

  // Paddle Cancel endpoint: POST /subscriptions/{subscription_id}/cancel
  // https://developer.paddle.com/api-reference/subscriptions/cancel-subscription
  const url = `https://api.paddle.com/subscriptions/${encodeURIComponent(paddleSubscriptionId)}/cancel`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // effective_from: 'immediately' triggers refund credit note on Paddle's side
      body: JSON.stringify({ effective_from: 'immediately' }),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed'
    console.error('[processRefund] Paddle API network error', { paddleSubscriptionId, message })
    return { ok: false, error: message, status: 503 }
  }

  if (response.ok) {
    return { ok: true }
  }

  // 409 = already cancelled — treat as success
  if (response.status === 409) {
    console.info('[processRefund] Paddle subscription already cancelled', {
      paddleSubscriptionId,
    })
    return { ok: true }
  }

  let body = ''
  try {
    body = await response.text()
  } catch {
    // ignore parse failure
  }

  console.error('[processRefund] Paddle cancel failed', {
    paddleSubscriptionId,
    status: response.status,
    body,
  })
  return { ok: false, error: `Paddle returned ${response.status}: ${body}`, status: response.status }
}

// ---------------------------------------------------------------------------
// Audit log helper
// ---------------------------------------------------------------------------

async function writeAuditLog(
  supabase: ReturnType<typeof getAdminClient>,
  opts: {
    userId: string
    refundEventId: string
    subscriptionId: string
    reason: string
    paddleCancelled: boolean
  },
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    actor_type: 'system',
    actor_id: opts.userId,
    event_type: 'refund.processed',
    target_table: 'refund_events',
    target_id: opts.refundEventId,
    payload: {
      refund_event_id: opts.refundEventId,
      subscription_id: opts.subscriptionId,
      user_id: opts.userId,
      reason: opts.reason,
      paddle_cancelled: opts.paddleCancelled,
    },
  })

  if (error) {
    console.error('[processRefund] audit_log insert failed', {
      refundEventId: opts.refundEventId,
      error: error.message,
    })
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function processRefund(input: ProcessRefundInput): Promise<RefundResult> {
  // 1. Validate input
  const parsed = ProcessRefundInputSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(', ')
    return { ok: false, error: message, code: 'VALIDATION_ERROR' }
  }

  const { subscriptionId, reason } = parsed.data
  const supabase = getAdminClient()

  // 2. Resolve subscription — need paddle_subscription_id and user email
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('id, user_id, paddle_subscription_id, status')
    .eq('id', subscriptionId)
    .maybeSingle()

  if (subError) {
    console.error('[processRefund] Subscription lookup failed', {
      subscriptionId,
      error: subError.message,
    })
    return { ok: false, error: `Subscription lookup failed: ${subError.message}`, code: 'SUBSCRIPTION_NOT_FOUND' }
  }

  if (!sub) {
    console.warn('[processRefund] Subscription not found', { subscriptionId })
    return { ok: false, error: 'Subscription not found', code: 'SUBSCRIPTION_NOT_FOUND' }
  }

  // Resolve user email for confirmation email
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', sub.user_id)
    .maybeSingle()

  // 3. INSERT refund_events (append-only — no UPDATE/DELETE, Principle #12)
  const { data: refundRow, error: insertError } = await supabase
    .from('refund_events' as never)
    .insert({
      customer_id: sub.user_id,
      subscription_id: subscriptionId,
      paddle_subscription_id: sub.paddle_subscription_id ?? null,
      reason,
      refunded_at: new Date().toISOString(),
      status: 'pending',
    } as never)
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string; code: string } | null }

  if (insertError || !refundRow) {
    console.error('[processRefund] refund_events insert failed', {
      subscriptionId,
      error: insertError?.message,
    })
    return {
      ok: false,
      error: `refund_events insert failed: ${insertError?.message ?? 'no data returned'}`,
      code: 'INSERT_FAILED',
    }
  }

  const refundEventId = refundRow.id

  // 4. Cancel on Paddle (non-blocking — a failed Paddle cancel doesn't reverse the refund_events row)
  let paddleCancelled = false
  if (sub.paddle_subscription_id) {
    const paddleResult = await cancelPaddleSubscription(sub.paddle_subscription_id)
    if (paddleResult.ok) {
      paddleCancelled = true

      // Update subscription status to cancelled in Supabase
      const { error: statusError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled' as Database['public']['Enums']['subscription_status'],
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (statusError) {
        console.error('[processRefund] subscription status update failed', {
          subscriptionId,
          error: statusError.message,
        })
        // Non-fatal — webhook will sync status eventually
      }
    } else {
      console.error('[processRefund] Paddle cancel failed — refund row written but sub not cancelled', {
        subscriptionId,
        refundEventId,
        paddleError: paddleResult.error,
      })
    }
  } else {
    console.warn('[processRefund] No paddle_subscription_id — skipping Paddle cancel', {
      subscriptionId,
    })
  }

  // 5. Send confirmation email (non-blocking)
  let emailSent = false
  if (profile?.email) {
    const emailResult = await sendEmail({
      to: profile.email,
      subject: 'Your Beamix subscription has been cancelled',
      react: RefundConfirmationEmail({
        firstName: profile.full_name ?? 'there',
      }),
    })
    emailSent = emailResult.ok
    if (!emailResult.ok) {
      console.error('[processRefund] Refund confirmation email failed', {
        refundEventId,
        error: emailResult.error,
      })
    }
  } else {
    console.warn('[processRefund] No user email found — skipping confirmation email', {
      subscriptionId,
    })
  }

  // 6. Write audit_log
  await writeAuditLog(supabase, {
    userId: sub.user_id,
    refundEventId,
    subscriptionId,
    reason,
    paddleCancelled,
  })

  return { ok: true, refundEventId, paddleCancelled, emailSent }
}
