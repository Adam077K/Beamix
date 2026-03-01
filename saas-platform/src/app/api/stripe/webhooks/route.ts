import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import {
  getPlanFromPriceId,
  allocateMonthlyCredits,
  addTopupCredits,
} from '@/lib/stripe/helpers'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object, supabase)
        break
      }

      case 'invoice.paid': {
        await handleInvoicePaid(event.data.object, supabase)
        break
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object, supabase)
        break
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object, supabase)
        break
      }

      default:
        break
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Handler error'
    console.error(`Webhook handler error for ${event.type}:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

type SupabaseServiceClient = Awaited<ReturnType<typeof createServiceClient>>

/**
 * Extract period dates from a subscription's first item.
 * In Stripe API clover, current_period_start/end live on SubscriptionItem.
 */
function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0]
  return {
    periodStart: firstItem
      ? new Date(firstItem.current_period_start * 1000).toISOString()
      : null,
    periodEnd: firstItem
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null,
  }
}

/**
 * Extract the subscription ID from an invoice's parent field.
 * In Stripe API clover, invoice.subscription was replaced by invoice.parent.subscription_details.
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details
  if (!subDetails) return null

  return typeof subDetails.subscription === 'string'
    ? subDetails.subscription
    : subDetails.subscription.id
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: SupabaseServiceClient
) {
  const userId = session.metadata?.supabase_user_id
  if (!userId) return

  const checkoutType = session.metadata?.type

  if (checkoutType === 'topup') {
    const topupSize = Number(session.metadata?.topup_size)
    if (topupSize > 0) {
      await addTopupCredits(userId, topupSize)
    }
    return
  }

  // Subscription checkout
  if (session.subscription) {
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0]?.price?.id

    if (!priceId) return

    const planTier = getPlanFromPriceId(priceId)
    if (!planTier) return

    const { periodStart, periodEnd } = getSubscriptionPeriod(subscription)

    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscriptionId,
        plan_tier: planTier,
        status: subscription.status === 'trialing' ? 'trialing' : 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`)
    }

    await allocateMonthlyCredits(userId)
  }
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: SupabaseServiceClient
) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice)
  if (!subscriptionId) return

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!sub) return

  // Update subscription status to active (in case it was past_due)
  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('stripe_subscription_id', subscriptionId)

  // Allocate monthly credits on each successful payment
  await allocateMonthlyCredits(sub.user_id)
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: SupabaseServiceClient
) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice)
  if (!subscriptionId) return

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseServiceClient
) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      stripe_subscription_id: null,
      plan_tier: 'free',
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: SupabaseServiceClient
) {
  const priceId = subscription.items.data[0]?.price?.id
  if (!priceId) return

  const planTier = getPlanFromPriceId(priceId)
  const { periodStart, periodEnd } = getSubscriptionPeriod(subscription)

  const updateData: Record<string, unknown> = {
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  }

  if (planTier) {
    updateData.plan_tier = planTier
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
  }
  updateData.status = statusMap[subscription.status] ?? 'active'

  await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)
}
