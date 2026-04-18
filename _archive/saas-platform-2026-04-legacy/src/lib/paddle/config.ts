import { z } from 'zod'
import type { PlanTier } from '@/lib/types'

/**
 * Paddle price/product IDs.
 *
 * In Paddle Billing, you create Products and Prices in the Paddle dashboard.
 * Each price has a unique ID (e.g., pri_01abc...) that you reference here.
 *
 * Paddle handles tax calculation, currency conversion, and checkout overlay
 * automatically -- no need to store per-currency prices.
 */

const paddleEnvSchema = z.object({
  PADDLE_PRICE_STARTER_MONTHLY: z.string().min(1),
  PADDLE_PRICE_STARTER_YEARLY: z.string().min(1),
  PADDLE_PRICE_PRO_MONTHLY: z.string().min(1),
  PADDLE_PRICE_PRO_YEARLY: z.string().min(1),
  PADDLE_PRICE_BUSINESS_MONTHLY: z.string().min(1),
  PADDLE_PRICE_BUSINESS_YEARLY: z.string().min(1),
  PADDLE_PRICE_TOPUP_5: z.string().min(1),
  PADDLE_PRICE_TOPUP_15: z.string().min(1),
})

function getPaddlePrices() {
  const parsed = paddleEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(
      `Missing Paddle price env vars: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`
    )
  }
  return {
    starter_monthly: parsed.data.PADDLE_PRICE_STARTER_MONTHLY,
    starter_yearly: parsed.data.PADDLE_PRICE_STARTER_YEARLY,
    pro_monthly: parsed.data.PADDLE_PRICE_PRO_MONTHLY,
    pro_yearly: parsed.data.PADDLE_PRICE_PRO_YEARLY,
    business_monthly: parsed.data.PADDLE_PRICE_BUSINESS_MONTHLY,
    business_yearly: parsed.data.PADDLE_PRICE_BUSINESS_YEARLY,
    topup_5: parsed.data.PADDLE_PRICE_TOPUP_5,
    topup_15: parsed.data.PADDLE_PRICE_TOPUP_15,
  } as const
}

let _prices: ReturnType<typeof getPaddlePrices> | null = null

export function getPaddlePrices_() {
  if (!_prices) _prices = getPaddlePrices()
  return _prices
}

export const PADDLE_PRICES = new Proxy({} as ReturnType<typeof getPaddlePrices>, {
  get(_target, prop: string) {
    return getPaddlePrices_()[prop as keyof ReturnType<typeof getPaddlePrices>]
  },
})

export type BillingPeriod = 'monthly' | 'yearly'
export type TopupSize = 5 | 15

export const PLAN_LIMITS: Record<
  Exclude<PlanTier, 'free'>,
  { queries: number; agent_uses: number; engines: number }
> = {
  starter: { queries: 10, agent_uses: 5, engines: 4 },
  pro: { queries: 25, agent_uses: 15, engines: 8 },
  business: { queries: -1, agent_uses: 50, engines: 10 },
}

export const TOPUP_CREDITS: Record<TopupSize, number> = {
  5: 5,
  15: 15,
}
