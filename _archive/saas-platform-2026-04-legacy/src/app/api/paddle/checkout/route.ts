import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { paddle } from '@/lib/paddle/client'
import { PADDLE_PRICES } from '@/lib/paddle/config'
import { getOrCreatePaddleCustomer } from '@/lib/paddle/helpers'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/paddle/checkout
 *
 * Paddle Billing uses a client-side overlay (Paddle.js) for checkout.
 * This endpoint returns the transaction details needed to open the overlay,
 * OR creates a server-side transaction and returns the checkout URL.
 *
 * For subscriptions: returns { client_token, transaction_id } to open Paddle.js overlay
 * For top-ups: returns { client_token, transaction_id } for one-time purchase
 */

const checkoutSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('subscription'),
    plan_tier: z.enum(['starter', 'pro', 'business']),
    billing_period: z.enum(['monthly', 'yearly']),
  }),
  z.object({
    type: z.literal('topup'),
    topup_size: z.enum(['5', '15']).transform(Number),
  }),
])

function getPriceId(
  type: 'subscription' | 'topup',
  planTier?: string,
  billingPeriod?: string,
  topupSize?: number
): string {
  if (type === 'topup') {
    if (topupSize === 5) return PADDLE_PRICES.topup_5
    if (topupSize === 15) return PADDLE_PRICES.topup_15
    throw new Error('Invalid topup size')
  }

  const key = `${planTier}_${billingPeriod}` as keyof typeof PADDLE_PRICES
  const priceId = PADDLE_PRICES[key]
  if (!priceId) {
    throw new Error(`No price found for ${key}`)
  }
  return priceId
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    const customerId = await getOrCreatePaddleCustomer(user.id, user.email ?? '')

    if (data.type === 'subscription') {
      const priceId = getPriceId('subscription', data.plan_tier, data.billing_period)

      // Create a Paddle transaction for the subscription
      const transaction = await paddle.transactions.create({
        items: [{ priceId, quantity: 1 }],
        customerId,
        customData: {
          supabase_user_id: user.id,
          type: 'subscription',
          plan_tier: data.plan_tier,
        },
      })

      return NextResponse.json({
        transaction_id: transaction.id,
        // The frontend uses Paddle.js Checkout.open({ transactionId }) to open overlay
      })
    }

    // Top-up (one-time payment)
    const priceId = getPriceId('topup', undefined, undefined, data.topup_size)

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerId,
      customData: {
        supabase_user_id: user.id,
        type: 'topup',
        topup_size: String(data.topup_size),
      },
    })

    return NextResponse.json({
      transaction_id: transaction.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[Paddle Checkout] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
