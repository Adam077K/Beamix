import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  }
  return _stripe
}

// Re-export for backwards compat
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    try {
      const stripeInstance = getStripe()
      return (stripeInstance as unknown as Record<string | symbol, unknown>)[prop]
    } catch (err) {
      throw new Error(
        `Stripe not configured: ${err instanceof Error ? err.message : 'Missing STRIPE_SECRET_KEY'}`
      )
    }
  },
})
