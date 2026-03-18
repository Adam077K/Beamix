import { paddle } from './client'
import { PADDLE_PRICES } from './config'
import type { PlanTier } from '@/lib/types'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Looks up the paddle_customer_id on the subscriptions table.
 * If none exists, creates a Paddle customer and stores the ID.
 *
 * Paddle customers are created via the Paddle API (server-side).
 * The customer ID is then stored in Supabase for future lookups.
 */
export async function getOrCreatePaddleCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = await createServiceClient()

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('paddle_customer_id')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch subscription: ${error.message}`)
  }

  if (subscription?.paddle_customer_id) {
    return subscription.paddle_customer_id
  }

  // Create customer in Paddle
  const customer = await paddle.customers.create({
    email,
    customData: { supabase_user_id: userId },
  })

  if (subscription) {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ paddle_customer_id: customer.id })
      .eq('user_id', userId)

    if (updateError) {
      throw new Error(`Failed to store paddle_customer_id: ${updateError.message}`)
    }
  } else {
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        paddle_customer_id: customer.id,
        plan_tier: null,
        status: 'trialing',
      })

    if (insertError) {
      throw new Error(`Failed to create subscription record: ${insertError.message}`)
    }
  }

  return customer.id
}

/**
 * Maps a Paddle price ID back to a plan tier.
 * Returns null if the price ID is not recognized (e.g. a top-up).
 */
export function getPlanFromPriceId(priceId: string): PlanTier | null {
  const priceToTier: Record<string, PlanTier> = {
    [PADDLE_PRICES.starter_monthly]: 'starter',
    [PADDLE_PRICES.starter_yearly]: 'starter',
    [PADDLE_PRICES.pro_monthly]: 'pro',
    [PADDLE_PRICES.pro_yearly]: 'pro',
    [PADDLE_PRICES.business_monthly]: 'business',
    [PADDLE_PRICES.business_yearly]: 'business',
  }

  return priceToTier[priceId] ?? null
}

/**
 * Gets the top-up credit amount from a price ID.
 * Returns null if the price ID is not a top-up.
 */
export function getTopupAmountFromPriceId(priceId: string): number | null {
  const priceToAmount: Record<string, number> = {
    [PADDLE_PRICES.topup_5]: 5,
    [PADDLE_PRICES.topup_15]: 15,
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

  // Fetch the user's plan to pass to the RPC
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_tier')
    .eq('user_id', userId)
    .single()

  const { error } = await supabase.rpc('allocate_monthly_credits', {
    p_user_id: userId,
    p_plan_id: sub?.plan_tier ?? 'starter',
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
    .from('credit_pools')
    .select('id, topup_amount, base_allocation, rollover_amount, used_amount')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch credits: ${fetchError.message}`)
  }

  const newTopup = (credits?.topup_amount ?? 0) + amount
  const newTotal = (credits?.base_allocation ?? 0) + newTopup + (credits?.rollover_amount ?? 0) - (credits?.used_amount ?? 0)

  const { error: updateError } = await supabase
    .from('credit_pools')
    .update({ topup_amount: newTopup })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to update credits: ${updateError.message}`)
  }

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    pool_id: credits!.id,
    pool_type: 'topup' as const,
    transaction_type: 'topup' as const,
    amount,
    balance_after: newTotal,
    description: `Top-up: ${amount} agent uses purchased`,
  })
}
