import { stripe } from './client'
import { STRIPE_PRICES, PLAN_LIMITS } from './config'
import type { PlanTier } from './config'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Looks up the stripe_customer_id on the subscriptions table.
 * If none exists, creates a Stripe customer and stores the ID.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = await createServiceClient()

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch subscription: ${error.message}`)
  }

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  if (subscription) {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId)

    if (updateError) {
      throw new Error(`Failed to store stripe_customer_id: ${updateError.message}`)
    }
  } else {
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_customer_id: customer.id,
        plan_tier: 'free',
        status: 'trialing',
      })

    if (insertError) {
      throw new Error(`Failed to create subscription record: ${insertError.message}`)
    }
  }

  return customer.id
}

/**
 * Maps a Stripe price ID back to a plan tier.
 * Returns null if the price ID is not recognized (e.g. a top-up).
 */
export function getPlanFromPriceId(priceId: string): PlanTier | null {
  const priceToTier: Record<string, PlanTier> = {
    [STRIPE_PRICES.starter_monthly]: 'starter',
    [STRIPE_PRICES.starter_yearly]: 'starter',
    [STRIPE_PRICES.pro_monthly]: 'pro',
    [STRIPE_PRICES.pro_yearly]: 'pro',
    [STRIPE_PRICES.business_monthly]: 'enterprise',
    [STRIPE_PRICES.business_yearly]: 'enterprise',
  }

  return priceToTier[priceId] ?? null
}

/**
 * Gets the top-up credit amount from a price ID.
 * Returns null if the price ID is not a top-up.
 */
export function getTopupAmountFromPriceId(priceId: string): number | null {
  const priceToAmount: Record<string, number> = {
    [STRIPE_PRICES.topup_5]: 5,
    [STRIPE_PRICES.topup_15]: 15,
  }

  return priceToAmount[priceId] ?? null
}

/**
 * Allocates monthly credits for a user based on their plan tier.
 * Uses the DB function `allocate_monthly_credits` which handles
 * rollover calculation and resets the credit balance.
 */
export async function allocateMonthlyCredits(userId: string): Promise<void> {
  const supabase = await createServiceClient()

  const { error } = await supabase.rpc('allocate_monthly_credits', {
    p_user_id: userId,
  })

  if (error) {
    throw new Error(`Failed to allocate monthly credits: ${error.message}`)
  }
}

/**
 * Adds top-up credits to a user's bonus_credits balance.
 */
export async function addTopupCredits(userId: string, amount: number): Promise<void> {
  const supabase = await createServiceClient()

  const { data: credits, error: fetchError } = await supabase
    .from('credits')
    .select('bonus_credits, total_credits')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch credits: ${fetchError.message}`)
  }

  const newBonus = (credits?.bonus_credits ?? 0) + amount
  const newTotal = (credits?.total_credits ?? 0) + amount

  const { error: updateError } = await supabase
    .from('credits')
    .update({
      bonus_credits: newBonus,
      total_credits: newTotal,
    })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to update credits: ${updateError.message}`)
  }

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    transaction_type: 'bonus',
    amount,
    balance_after: newTotal,
    description: `Top-up: ${amount} agent uses purchased`,
    metadata: {},
  })
}
