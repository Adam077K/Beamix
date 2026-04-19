/**
 * POST /api/webhooks/paddle
 *
 * Receives and processes Paddle webhook events.
 * Verifies HMAC signature before processing.
 *
 * Handled events:
 * - subscription.created  → upsert subscriptions row + fire Inngest activation event
 * - subscription.updated  → upsert subscriptions row
 * - subscription.canceled → mark subscription canceled
 * - transaction.payment_failed → insert notification for user
 */

import { NextResponse } from 'next/server'
import { Paddle, EventName } from '@paddle/paddle-node-sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { inngest } from '@/inngest/client'

const paddle = new Paddle(process.env['PADDLE_API_KEY'] ?? '')
const webhookSecret = process.env['PADDLE_WEBHOOK_SECRET'] ?? ''

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature') ?? ''
  const raw = await req.text()

  let event
  try {
    event = await paddle.webhooks.unmarshal(raw, webhookSecret, signature)
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE', message: 'Paddle webhook verification failed' } },
      { status: 401 },
    )
  }

  if (!event) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated: {
      const sub = event.data as {
        id: string
        customerId: string
        status: string
        customData?: { user_id?: string }
        items?: Array<{ price?: { id?: string } }>
        currentBillingPeriod?: { endsAt?: string }
      }
      const userId = sub.customData?.user_id
      if (!userId) break

      const priceId = sub.items?.[0]?.price?.id
      const planTier = resolvePlanTier(priceId)

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan_tier: planTier,
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customerId,
          status: sub.status,
          current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

      if (event.eventType === EventName.SubscriptionCreated && planTier) {
        await inngest.send({
          name: 'paddle.subscription.activated',
          data: {
            subscriptionId: sub.id,
            userId,
            planTier,
            priceId: priceId ?? '',
            activatedAt: new Date().toISOString(),
          },
        })
      }
      break
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data as { id: string }
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('paddle_subscription_id', sub.id)
      break
    }

    case EventName.TransactionPaymentFailed: {
      const tx = event.data as {
        id: string
        customData?: { user_id?: string }
      }
      const userId = tx.customData?.user_id
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'payment_failed',
          title: 'Payment failed',
          body: "We couldn't process your payment. Update your billing details to keep your plan active.",
          action_url: '/settings?tab=billing',
          payload: { transactionId: tx.id },
        })
      }
      break
    }

    // TransactionCompleted — let subscription.updated handle subscription state
    default:
      break
  }

  return NextResponse.json({ ok: true })
}

function resolvePlanTier(
  priceId: string | undefined,
): 'discover' | 'build' | 'scale' | null {
  if (!priceId) return null
  if (
    priceId === process.env['PADDLE_PRICE_DISCOVER_MONTHLY'] ||
    priceId === process.env['PADDLE_PRICE_DISCOVER_ANNUAL']
  )
    return 'discover'
  if (
    priceId === process.env['PADDLE_PRICE_BUILD_MONTHLY'] ||
    priceId === process.env['PADDLE_PRICE_BUILD_ANNUAL']
  )
    return 'build'
  if (
    priceId === process.env['PADDLE_PRICE_SCALE_MONTHLY'] ||
    priceId === process.env['PADDLE_PRICE_SCALE_ANNUAL']
  )
    return 'scale'
  return null
}
