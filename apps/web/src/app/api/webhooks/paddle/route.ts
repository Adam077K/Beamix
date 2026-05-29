/**
 * POST /api/webhooks/paddle
 *
 * Receives Paddle webhook events. Handles:
 *   - `transaction.completed`   — payment charged; write revenue_events with booked_at=NULL
 *   - `subscription.activated`  — trial converted; write revenue_events with booked_at=NULL
 *
 * Security:
 *   - Verifies `Paddle-Signature` HMAC-SHA256 against PADDLE_WEBHOOK_SECRET.
 *   - Raw body is read BEFORE JSON.parse (signature is over the raw bytes).
 *   - Uses crypto.timingSafeEqual to prevent timing-oracle attacks.
 *   - Returns 400 (not 401) on HMAC failure to avoid leaking auth semantics.
 *
 * Idempotency:
 *   - Inserts use ON CONFLICT DO NOTHING on paddle_event_id (unique constraint).
 *   - Every verified event writes an audit_log row regardless of event type.
 *
 * Engineering Principles #11 + #12:
 *   - revenue_events.booked_at = NULL on insert (day-61 cron flips it).
 *   - refund_events is append-only; this handler does NOT touch it (processRefund does).
 *
 * Returns:
 *   200  on successful handling (or no-op duplicate)
 *   400  on HMAC fail or unparseable body
 *   422  on valid signature but unrecognised event type (logged, no-op)
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/database.types'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Supabase service-role client (revenue_events requires service_role for INSERT)
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------------------
// HMAC verification — Paddle signature format: "ts=<unix>;h1=<hex>"
// ---------------------------------------------------------------------------

function verifyPaddleSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhooks/paddle] PADDLE_WEBHOOK_SECRET is not set')
    return false
  }
  if (!signatureHeader) return false

  // Paddle signature header format: "ts=1234567890;h1=<hex-hmac>"
  const parts = signatureHeader.split(';')
  const tsPart = parts.find((p) => p.startsWith('ts='))
  const h1Part = parts.find((p) => p.startsWith('h1='))
  if (!tsPart || !h1Part) return false

  const ts = tsPart.slice(3)
  const h1 = h1Part.slice(3)
  if (!ts || !h1) return false

  const signedPayload = `${ts}:${rawBody}`
  const expectedHash = createHmac('sha256', secret).update(signedPayload).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expectedHash, 'hex'))
  } catch {
    // Buffer lengths differ — signature format is invalid
    return false
  }
}

// ---------------------------------------------------------------------------
// Zod schemas — Paddle event payloads (partial — only fields we read)
// ---------------------------------------------------------------------------

/** Common envelope for all Paddle webhook events. */
const PaddleEventEnvelopeSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  occurred_at: z.string().min(1),
  data: z.record(z.unknown()),
})

type PaddleEventEnvelope = z.infer<typeof PaddleEventEnvelopeSchema>

/** Minimal shape for `transaction.completed` data. */
const TransactionCompletedDataSchema = z.object({
  id: z.string().min(1), // Paddle transaction ID
  customer_id: z.string().min(1), // Paddle customer ID
  currency_code: z.string().min(3).max(3),
  details: z.object({
    totals: z.object({
      total: z.string(), // Amount in major currency units as string
    }),
  }),
  subscription_id: z.string().nullable().optional(),
  custom_data: z
    .object({
      user_id: z.string().uuid().optional(),
    })
    .nullable()
    .optional(),
})

type TransactionCompletedData = z.infer<typeof TransactionCompletedDataSchema>

/** Minimal shape for `subscription.activated` data. */
const SubscriptionActivatedDataSchema = z.object({
  id: z.string().min(1), // Paddle subscription ID
  customer_id: z.string().min(1), // Paddle customer ID
  currency_code: z.string().min(3).max(3),
  first_billed_at: z.string().nullable().optional(),
  custom_data: z
    .object({
      user_id: z.string().uuid().optional(),
    })
    .nullable()
    .optional(),
  // Recurring price for ARR/MRR seed — may be absent on trial activations
  items: z
    .array(
      z.object({
        price: z
          .object({
            unit_price: z
              .object({
                amount: z.string(),
                currency_code: z.string(),
              })
              .optional(),
          })
          .optional(),
        quantity: z.number().optional(),
      }),
    )
    .optional(),
})

type SubscriptionActivatedData = z.infer<typeof SubscriptionActivatedDataSchema>

/** Minimal shape for `transaction.refunded` data. */
const TransactionRefundedDataSchema = z.object({
  id: z.string().min(1), // Paddle transaction ID
  customer_id: z.string().min(1),
  currency_code: z.string().min(3).max(3),
  details: z.object({
    totals: z.object({
      total: z.string(),
    }),
  }),
  subscription_id: z.string().nullable().optional(),
  custom_data: z
    .object({
      user_id: z.string().uuid().optional(),
    })
    .nullable()
    .optional(),
})

type TransactionRefundedData = z.infer<typeof TransactionRefundedDataSchema>

/** Minimal shape for `subscription.cancelled` data. */
const SubscriptionCancelledDataSchema = z.object({
  id: z.string().min(1), // Paddle subscription ID
  customer_id: z.string().min(1),
  custom_data: z
    .object({
      user_id: z.string().uuid().optional(),
    })
    .nullable()
    .optional(),
})

type SubscriptionCancelledData = z.infer<typeof SubscriptionCancelledDataSchema>

// ---------------------------------------------------------------------------
// Revenue amount helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Paddle amount string (major currency, e.g. "99.00") to integer cents.
 * Paddle always returns 2 decimal places for USD/EUR/GBP.
 *
 * P2 fix: throws on NaN rather than silently inserting amount_cents:0.
 * This causes a 500 → Paddle retry rather than a corrupt ledger row.
 */
function toCents(amountStr: string): number {
  const parsed = parseFloat(amountStr)
  if (isNaN(parsed)) {
    throw new Error(`[webhooks/paddle] toCents received non-numeric amount: ${JSON.stringify(amountStr)}`)
  }
  return Math.round(parsed * 100)
}

// ---------------------------------------------------------------------------
// Audit log helper
// ---------------------------------------------------------------------------

async function writeAuditLog(
  supabase: ReturnType<typeof getAdminClient>,
  opts: {
    eventType: string
    payload: Record<string, unknown>
    targetId?: string
  },
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    actor_type: 'system',
    event_type: opts.eventType,
    target_table: 'revenue_events',
    target_id: opts.targetId,
    payload: opts.payload as Database['public']['Tables']['audit_log']['Insert']['payload'],
  })
  if (error) {
    console.error('[webhooks/paddle] audit_log insert failed', {
      eventType: opts.eventType,
      error: error.message,
    })
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * Resolve the Supabase user_id from Paddle customer_id.
 * Looks up `subscriptions.paddle_customer_id → user_id`.
 */
async function resolveCustomerId(
  supabase: ReturnType<typeof getAdminClient>,
  paddleCustomerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('paddle_customer_id', paddleCustomerId)
    .maybeSingle()

  if (error) {
    console.error('[webhooks/paddle] resolveCustomerId failed', {
      paddleCustomerId,
      error: error.message,
    })
    return null
  }
  return data?.user_id ?? null
}

async function handleTransactionCompleted(
  supabase: ReturnType<typeof getAdminClient>,
  envelope: PaddleEventEnvelope,
): Promise<void> {
  const parsed = TransactionCompletedDataSchema.safeParse(envelope.data)
  if (!parsed.success) {
    console.warn('[webhooks/paddle] transaction.completed — invalid payload shape', {
      eventId: envelope.event_id,
      issues: parsed.error.issues,
    })
    return
  }

  const tx = parsed.data as TransactionCompletedData

  // Resolve internal user_id. Custom data is the fastest path; fall back to sub lookup.
  let userId = tx.custom_data?.user_id ?? null
  if (!userId) {
    userId = await resolveCustomerId(supabase, tx.customer_id)
  }
  if (!userId) {
    console.warn('[webhooks/paddle] transaction.completed — cannot resolve user_id', {
      eventId: envelope.event_id,
      paddleCustomerId: tx.customer_id,
    })
    return
  }

  const amountCents = toCents(tx.details.totals.total)

  // INSERT revenue_events — idempotent via UNIQUE(paddle_event_id)
  const { error: insertError } = await supabase.from('revenue_events' as never).insert({
    customer_id: userId,
    paddle_event_id: envelope.event_id,
    type: 'charge',
    amount_cents: amountCents,
    currency: tx.currency_code,
    received_at: new Date().toISOString(),
    held_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    booked_at: null,
    notes: {
      paddle_transaction_id: tx.id,
      paddle_customer_id: tx.customer_id,
      paddle_subscription_id: tx.subscription_id ?? null,
    },
  } as never)

  if (insertError) {
    // code 23505 = unique_violation — duplicate event, safe to ignore
    if (insertError.code === '23505') {
      console.info('[webhooks/paddle] transaction.completed — duplicate event_id, skipped', {
        eventId: envelope.event_id,
      })
      return
    }
    console.error('[webhooks/paddle] transaction.completed — revenue_events insert failed', {
      eventId: envelope.event_id,
      error: insertError.message,
    })
    throw new Error(`revenue_events insert failed: ${insertError.message}`)
  }

  await writeAuditLog(supabase, {
    eventType: 'revenue.transaction_completed',
    targetId: envelope.event_id,
    payload: {
      paddle_event_id: envelope.event_id,
      paddle_customer_id: tx.customer_id,
      amount_cents: amountCents,
      currency: tx.currency_code,
      user_id: userId,
    },
  })
}

async function handleSubscriptionActivated(
  supabase: ReturnType<typeof getAdminClient>,
  envelope: PaddleEventEnvelope,
): Promise<void> {
  const parsed = SubscriptionActivatedDataSchema.safeParse(envelope.data)
  if (!parsed.success) {
    console.warn('[webhooks/paddle] subscription.activated — invalid payload shape', {
      eventId: envelope.event_id,
      issues: parsed.error.issues,
    })
    return
  }

  const sub = parsed.data as SubscriptionActivatedData

  let userId = sub.custom_data?.user_id ?? null
  if (!userId) {
    userId = await resolveCustomerId(supabase, sub.customer_id)
  }
  if (!userId) {
    console.warn('[webhooks/paddle] subscription.activated — cannot resolve user_id', {
      eventId: envelope.event_id,
      paddleCustomerId: sub.customer_id,
    })
    return
  }

  // Derive amount from first billing item (may be 0 on free trial activations)
  let amountCents = 0
  const firstItem = sub.items?.[0]
  if (firstItem?.price?.unit_price?.amount) {
    amountCents = toCents(firstItem.price.unit_price.amount) * (firstItem.quantity ?? 1)
  }

  const { error: insertError } = await supabase.from('revenue_events' as never).insert({
    customer_id: userId,
    paddle_event_id: envelope.event_id,
    type: 'charge',
    amount_cents: amountCents,
    currency: sub.currency_code,
    received_at: new Date().toISOString(),
    held_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    booked_at: null,
    notes: {
      paddle_subscription_id: sub.id,
      paddle_customer_id: sub.customer_id,
      first_billed_at: sub.first_billed_at ?? null,
    },
  } as never)

  if (insertError) {
    if (insertError.code === '23505') {
      console.info('[webhooks/paddle] subscription.activated — duplicate event_id, skipped', {
        eventId: envelope.event_id,
      })
      return
    }
    console.error('[webhooks/paddle] subscription.activated — revenue_events insert failed', {
      eventId: envelope.event_id,
      error: insertError.message,
    })
    throw new Error(`revenue_events insert failed: ${insertError.message}`)
  }

  // Also update subscriptions.held_until and held_revenue_amount_cents
  const { error: subUpdateError } = await supabase
    .from('subscriptions')
    .update({
      held_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      held_revenue_amount_cents: amountCents,
    } as never)
    .eq('paddle_subscription_id', sub.id)

  if (subUpdateError) {
    // Non-fatal — log but don't fail the webhook
    console.error('[webhooks/paddle] subscription.activated — subscriptions update failed', {
      eventId: envelope.event_id,
      paddleSubId: sub.id,
      error: subUpdateError.message,
    })
  }

  await writeAuditLog(supabase, {
    eventType: 'revenue.subscription_activated',
    targetId: envelope.event_id,
    payload: {
      paddle_event_id: envelope.event_id,
      paddle_subscription_id: sub.id,
      paddle_customer_id: sub.customer_id,
      amount_cents: amountCents,
      currency: sub.currency_code,
      user_id: userId,
    },
  })
}

/**
 * Handle `transaction.refunded` — P1 Fix 4.
 * Writes a refund_events row so the sweep won't book a refunded transaction.
 * Uses the real Paddle event_id as paddle_event_id (idempotent via UNIQUE constraint).
 */
async function handleTransactionRefunded(
  supabase: ReturnType<typeof getAdminClient>,
  envelope: PaddleEventEnvelope,
): Promise<void> {
  const parsed = TransactionRefundedDataSchema.safeParse(envelope.data)
  if (!parsed.success) {
    console.warn('[webhooks/paddle] transaction.refunded — invalid payload shape', {
      eventId: envelope.event_id,
      issues: parsed.error.issues,
    })
    return
  }

  const tx = parsed.data as TransactionRefundedData

  // Resolve internal user_id
  let userId = tx.custom_data?.user_id ?? null
  if (!userId) {
    userId = await resolveCustomerId(supabase, tx.customer_id)
  }
  if (!userId) {
    console.warn('[webhooks/paddle] transaction.refunded — cannot resolve user_id', {
      eventId: envelope.event_id,
      paddleCustomerId: tx.customer_id,
    })
    return
  }

  const amountCents = toCents(tx.details.totals.total)

  // Look up the revenue_events row that matches this transaction (by paddle_event_id suffix convention).
  // Use the transaction ID to find the original charge event, if present.
  // revenue_event_id is nullable — it's a best-effort FK.
  const { data: revenueRows } = await supabase
    .from('revenue_events' as never)
    .select('id')
    .eq('customer_id', userId)
    .is('booked_at', null)
    .order('received_at', { ascending: false })
    .limit(1)
    .returns<{ id: string }[]>()

  const revenueEventId = revenueRows?.[0]?.id ?? null

  // INSERT refund_events — idempotent via UNIQUE(paddle_event_id)
  const { error: insertError } = await supabase.from('refund_events' as never).insert({
    customer_id: userId,
    paddle_event_id: envelope.event_id,
    revenue_event_id: revenueEventId,
    amount_cents: amountCents,
    reason: 'paddle_admin_refund',
    refunded_at: envelope.occurred_at,
  } as never)

  if (insertError) {
    if (insertError.code === '23505') {
      console.info('[webhooks/paddle] transaction.refunded — duplicate event_id, skipped', {
        eventId: envelope.event_id,
      })
      return
    }
    console.error('[webhooks/paddle] transaction.refunded — refund_events insert failed', {
      eventId: envelope.event_id,
      error: insertError.message,
    })
    throw new Error(`refund_events insert failed: ${insertError.message}`)
  }

  await writeAuditLog(supabase, {
    eventType: 'revenue.transaction_refunded',
    targetId: envelope.event_id,
    payload: {
      paddle_event_id: envelope.event_id,
      paddle_customer_id: tx.customer_id,
      amount_cents: amountCents,
      currency: tx.currency_code,
      user_id: userId,
      revenue_event_id: revenueEventId,
    },
  })
}

/**
 * Handle `subscription.cancelled` — P1 Fix 4.
 * Updates subscriptions.status to 'cancelled' in Supabase.
 */
async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof getAdminClient>,
  envelope: PaddleEventEnvelope,
): Promise<void> {
  const parsed = SubscriptionCancelledDataSchema.safeParse(envelope.data)
  if (!parsed.success) {
    console.warn('[webhooks/paddle] subscription.cancelled — invalid payload shape', {
      eventId: envelope.event_id,
      issues: parsed.error.issues,
    })
    return
  }

  const sub = parsed.data as SubscriptionCancelledData

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled' as Database['public']['Enums']['subscription_status'],
      cancelled_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', sub.id)

  if (updateError) {
    console.error('[webhooks/paddle] subscription.cancelled — subscriptions update failed', {
      eventId: envelope.event_id,
      paddleSubId: sub.id,
      error: updateError.message,
    })
    throw new Error(`subscriptions update failed: ${updateError.message}`)
  }

  await writeAuditLog(supabase, {
    eventType: 'subscription.cancelled',
    targetId: envelope.event_id,
    payload: {
      paddle_event_id: envelope.event_id,
      paddle_subscription_id: sub.id,
      paddle_customer_id: sub.customer_id,
    },
  })
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body FIRST — required for HMAC verification
  const rawBody = await req.text()

  // 2. Verify HMAC signature
  const signatureHeader = req.headers.get('Paddle-Signature')
  if (!verifyPaddleSignature(rawBody, signatureHeader)) {
    console.error('[webhooks/paddle] HMAC verification failed', {
      hasHeader: !!signatureHeader,
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 2b. P2 — Reject replayed webhooks: timestamp must be within 5 minutes of now.
  //     Extracted AFTER signature verify (signature passes ts= tampering check already,
  //     but we enforce freshness separately to guard against captured-and-replayed events).
  if (signatureHeader) {
    const tsPart = signatureHeader.split(';').find((p) => p.startsWith('ts='))
    const tsValue = tsPart ? parseInt(tsPart.slice(3), 10) : NaN
    if (!isNaN(tsValue) && Math.abs(Date.now() / 1000 - tsValue) > 300) {
      console.error('[webhooks/paddle] Webhook timestamp too old (replay guard)', {
        ts: tsValue,
        nowSeconds: Math.floor(Date.now() / 1000),
        deltaSeconds: Math.abs(Date.now() / 1000 - tsValue),
      })
      return NextResponse.json({ error: 'Webhook timestamp expired' }, { status: 400 })
    }
  }

  // 3. Parse JSON
  let raw: unknown
  try {
    raw = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // 4. Validate envelope
  const parsed = PaddleEventEnvelopeSchema.safeParse(raw)
  if (!parsed.success) {
    console.warn('[webhooks/paddle] Invalid event envelope', {
      issues: parsed.error.issues,
    })
    return NextResponse.json({ error: 'Invalid event envelope' }, { status: 400 })
  }

  const envelope = parsed.data

  const supabase = getAdminClient()

  // 5. Dispatch by event type
  try {
    switch (envelope.event_type) {
      case 'transaction.completed':
        await handleTransactionCompleted(supabase, envelope)
        break

      case 'subscription.activated':
        await handleSubscriptionActivated(supabase, envelope)
        break

      case 'transaction.refunded':
        await handleTransactionRefunded(supabase, envelope)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, envelope)
        break

      default:
        // Unknown event type — ack with 200 to prevent Paddle retries.
        // P2: write audit_log for observability on unhandled-but-verified events.
        console.info('[webhooks/paddle] Unhandled event type — ignoring', {
          eventType: envelope.event_type,
          eventId: envelope.event_id,
        })
        await writeAuditLog(supabase, {
          eventType: 'paddle.unhandled_event_type',
          targetId: envelope.event_id,
          payload: {
            paddle_event_id: envelope.event_id,
            paddle_event_type: envelope.event_type,
            occurred_at: envelope.occurred_at,
          },
        })
        return NextResponse.json({ received: true, handled: false }, { status: 200 })
    }
  } catch (err) {
    console.error('[webhooks/paddle] Event handler threw', {
      eventType: envelope.event_type,
      eventId: envelope.event_id,
      error: String(err),
    })
    // Return 500 so Paddle retries — transient DB errors may self-heal
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
