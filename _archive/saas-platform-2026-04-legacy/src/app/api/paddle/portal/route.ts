import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/paddle/portal
 *
 * Paddle billing management endpoint.
 * Paddle provides:
 * 1. Cancel/pause subscription via API
 * 2. Update payment method via update transaction
 *
 * This endpoint generates a Paddle "update payment method" URL
 * using the subscription's update transaction, or returns
 * the subscription management data for the frontend to display.
 */

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()

    // Get the user's Paddle subscription
    const { data: subscription, error: subError } = await serviceClient
      .from('subscriptions')
      .select('paddle_subscription_id, paddle_customer_id, plan_tier, status')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Return subscription management data
    // The frontend handles update payment method via Paddle.js Retain
    // and cancel/downgrade via dedicated API calls
    return NextResponse.json({
      subscription_id: subscription.paddle_subscription_id,
      customer_id: subscription.paddle_customer_id,
      plan_tier: subscription.plan_tier,
      status: subscription.status,
      // Frontend uses Paddle.js to open update payment method overlay:
      // Paddle.Checkout.open({ transactionId: update_transaction_id })
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[Paddle Portal] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
