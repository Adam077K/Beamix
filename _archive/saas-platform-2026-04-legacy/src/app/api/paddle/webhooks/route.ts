import { NextRequest, NextResponse } from 'next/server'
import {
  EventName,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type SubscriptionCanceledEvent,
  type TransactionCompletedEvent,
} from '@paddle/paddle-node-sdk'
import { paddle } from '@/lib/paddle/client'
import {
  getPlanFromPriceId,
  allocateMonthlyCredits,
  addTopupCredits,
  getTopupAmountFromPriceId,
} from '@/lib/paddle/helpers'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/paddle/webhooks
 *
 * Paddle sends webhook notifications for billing events.
 * This handler verifies the signature and processes each event type.
 *
 * Paddle sends HMAC-signed webhook events.
 * Events use Paddle's naming (subscription.created, transaction.completed, etc.)
 * Paddle handles tax, currency conversion, and payouts -- we just track subscription state
 */

export async function POST(request: NextRequest) {
  // Read the raw request body as text (not JSON). Paddle's SDK signature
  // verification (paddle.webhooks.unmarshal) requires the exact raw string
  // to compute the HMAC digest. Using request.json() would re-serialize
  // the body, potentially altering whitespace/ordering and breaking verification.
  const body = await request.text()
  const signature = request.headers.get('paddle-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing paddle-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Paddle Webhook] PADDLE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Verify webhook signature using Paddle SDK
  let event: Awaited<ReturnType<typeof paddle.webhooks.unmarshal>>
  try {
    event = await paddle.webhooks.unmarshal(body, webhookSecret, signature)
  } catch (err) {
    console.error('[Paddle Webhook] Signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (!event) {
    return NextResponse.json(
      { error: 'Could not parse webhook event' },
      { status: 400 }
    )
  }

  const supabase = await createServiceClient()

  try {
    switch (event.eventType) {
      case EventName.SubscriptionCreated: {
        await handleSubscriptionCreated(
          event as SubscriptionCreatedEvent,
          supabase
        )
        break
      }

      case EventName.SubscriptionUpdated: {
        await handleSubscriptionUpdated(
          event as SubscriptionUpdatedEvent,
          supabase
        )
        break
      }

      case EventName.SubscriptionCanceled: {
        await handleSubscriptionCanceled(
          event as SubscriptionCanceledEvent,
          supabase
        )
        break
      }

      case EventName.TransactionCompleted: {
        await handleTransactionCompleted(
          event as TransactionCompletedEvent,
          supabase
        )
        break
      }

      default:
        // Log unhandled events for debugging but return 200
        console.log(`[Paddle Webhook] Unhandled event type: ${event.eventType}`)
        break
    }
  } catch (error) {
    console.error(
      `[Paddle Webhook] Handler error for ${event.eventType}:`,
      error
    )
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

type SupabaseServiceClient = Awaited<ReturnType<typeof createServiceClient>>

/**
 * Handle subscription.created
 * Fired when a new subscription is created (after successful payment).
 */
async function handleSubscriptionCreated(
  event: SubscriptionCreatedEvent,
  supabase: SupabaseServiceClient
) {
  const subscription = event.data
  const customData = subscription.customData as Record<string, string> | null
  const userId = customData?.supabase_user_id
  if (!userId) return

  const priceId = subscription.items?.[0]?.price?.id
  if (!priceId) return

  const planTier = getPlanFromPriceId(priceId)
  if (!planTier) return

  const { error } = await supabase
    .from('subscriptions')
    .update({
      paddle_subscription_id: subscription.id,
      plan_tier: planTier,
      status: subscription.status === 'trialing' ? 'trialing' : 'active',
      current_period_start: subscription.currentBillingPeriod?.startsAt ?? null,
      current_period_end: subscription.currentBillingPeriod?.endsAt ?? null,
      trial_ends_at: subscription.scheduledChange?.effectiveAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  await allocateMonthlyCredits(userId)
}

/**
 * Handle subscription.updated
 * Fired when a subscription is modified (plan change, payment method update, etc.).
 */
async function handleSubscriptionUpdated(
  event: SubscriptionUpdatedEvent,
  supabase: SupabaseServiceClient
) {
  const subscription = event.data
  const priceId = subscription.items?.[0]?.price?.id
  if (!priceId) return

  const planTier = getPlanFromPriceId(priceId)

  // Map Paddle status to our status
  type SubStatus = 'active' | 'trialing' | 'past_due' | 'cancelled'
  const statusMap: Record<string, SubStatus> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    cancelled: 'cancelled',
    paused: 'cancelled', // Paddle uses "paused" -- we treat as cancelled
  }
  const mappedStatus: SubStatus = statusMap[subscription.status] ?? 'active'

  const updateData: {
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    trial_ends_at: string | null
    status: SubStatus
    plan_tier?: 'starter' | 'pro' | 'business'
    updated_at: string
  } = {
    current_period_start: subscription.currentBillingPeriod?.startsAt ?? null,
    current_period_end: subscription.currentBillingPeriod?.endsAt ?? null,
    cancel_at_period_end: subscription.scheduledChange?.action === 'cancel',
    trial_ends_at: subscription.scheduledChange?.effectiveAt ?? null,
    status: mappedStatus,
    updated_at: new Date().toISOString(),
  }

  if (planTier) {
    updateData.plan_tier = planTier
  }

  await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('paddle_subscription_id', subscription.id)
}

/**
 * Handle subscription.canceled
 * Fired when a subscription is canceled.
 */
async function handleSubscriptionCanceled(
  event: SubscriptionCanceledEvent,
  supabase: SupabaseServiceClient
) {
  const subscription = event.data

  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      paddle_subscription_id: null,
      plan_tier: null,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscription.id)
}

/**
 * Handle transaction.completed
 * Fired when any transaction completes (subscriptions or one-time purchases).
 * We use this primarily for top-up purchases.
 */
async function handleTransactionCompleted(
  event: TransactionCompletedEvent,
  supabase: SupabaseServiceClient
) {
  const transaction = event.data
  const customData = transaction.customData as Record<string, string> | null

  if (!customData) return

  const userId = customData.supabase_user_id
  if (!userId) return

  // Handle top-up purchases
  if (customData.type === 'topup') {
    const priceId = transaction.items?.[0]?.price?.id
    if (!priceId) return

    const topupAmount = getTopupAmountFromPriceId(priceId)
    if (topupAmount && topupAmount > 0) {
      await addTopupCredits(userId, topupAmount)
    }
    return
  }

  // For subscription transactions, the subscription.created/updated webhooks handle it.
  // But if this is a renewal payment, allocate monthly credits.
  if (transaction.subscriptionId) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('paddle_subscription_id', transaction.subscriptionId)
      .single()

    if (sub) {
      // Update status to active (in case it was past_due)
      await supabase
        .from('subscriptions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('paddle_subscription_id', transaction.subscriptionId)

      // Allocate monthly credits on each successful payment
      await allocateMonthlyCredits(sub.user_id)
    }
  }
}
