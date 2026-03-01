import { z } from 'zod/v4'

const stripeEnvSchema = z.object({
  STRIPE_PRICE_STARTER_MONTHLY: z.string().min(1),
  STRIPE_PRICE_STARTER_YEARLY: z.string().min(1),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
  STRIPE_PRICE_PRO_YEARLY: z.string().min(1),
  STRIPE_PRICE_BUSINESS_MONTHLY: z.string().min(1),
  STRIPE_PRICE_BUSINESS_YEARLY: z.string().min(1),
  STRIPE_PRICE_TOPUP_5: z.string().min(1),
  STRIPE_PRICE_TOPUP_15: z.string().min(1),
})

function getStripePrices() {
  const parsed = stripeEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(
      `Missing Stripe price env vars: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`
    )
  }
  return {
    starter_monthly: parsed.data.STRIPE_PRICE_STARTER_MONTHLY,
    starter_yearly: parsed.data.STRIPE_PRICE_STARTER_YEARLY,
    pro_monthly: parsed.data.STRIPE_PRICE_PRO_MONTHLY,
    pro_yearly: parsed.data.STRIPE_PRICE_PRO_YEARLY,
    business_monthly: parsed.data.STRIPE_PRICE_BUSINESS_MONTHLY,
    business_yearly: parsed.data.STRIPE_PRICE_BUSINESS_YEARLY,
    topup_5: parsed.data.STRIPE_PRICE_TOPUP_5,
    topup_15: parsed.data.STRIPE_PRICE_TOPUP_15,
  } as const
}

export const STRIPE_PRICES = getStripePrices()

export type PlanTier = 'starter' | 'pro' | 'enterprise'
export type BillingPeriod = 'monthly' | 'yearly'
export type TopupSize = 5 | 15

export const PLAN_LIMITS: Record<PlanTier, { queries: number; agent_uses: number; engines: number }> = {
  starter: { queries: 10, agent_uses: 5, engines: 4 },
  pro: { queries: 25, agent_uses: 15, engines: 8 },
  enterprise: { queries: -1, agent_uses: 50, engines: 10 },
}

export const TOPUP_CREDITS: Record<TopupSize, number> = {
  5: 5,
  15: 15,
}
