import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_PRICES } from '@/lib/stripe/config'
import { getOrCreateStripeCustomer } from '@/lib/stripe/helpers'
import { createClient } from '@/lib/supabase/server'

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
    if (topupSize === 5) return STRIPE_PRICES.topup_5
    if (topupSize === 15) return STRIPE_PRICES.topup_15
    throw new Error('Invalid topup size')
  }

  const key = `${planTier}_${billingPeriod}` as keyof typeof STRIPE_PRICES
  const priceId = STRIPE_PRICES[key]
  if (!priceId) {
    throw new Error(`No price found for ${key}`)
  }
  return priceId
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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
    const customerId = await getOrCreateStripeCustomer(user.id, user.email ?? '')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (data.type === 'subscription') {
      const priceId = getPriceId('subscription', data.plan_tier, data.billing_period)

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard/settings?tab=billing&success=true`,
        cancel_url: `${appUrl}/pricing`,
        subscription_data: {
          metadata: {
            supabase_user_id: user.id,
            plan_tier: data.plan_tier,
          },
          trial_period_days: 14,
        },
        metadata: {
          supabase_user_id: user.id,
          type: 'subscription',
        },
      })

      return NextResponse.json({ url: session.url })
    }

    // Top-up (one-time payment)
    const priceId = getPriceId('topup', undefined, undefined, data.topup_size)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings?tab=billing&topup=success`,
      cancel_url: `${appUrl}/dashboard/settings?tab=billing`,
      metadata: {
        supabase_user_id: user.id,
        type: 'topup',
        topup_size: String(data.topup_size),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
