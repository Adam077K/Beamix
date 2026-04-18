/**
 * Paddle Billing API client (server-side).
 *
 * Uses @paddle/paddle-node-sdk for server operations:
 * - Creating transactions (checkout)
 * - Managing subscriptions
 * - Verifying webhooks
 *
 * The client-side overlay (Paddle.js) is loaded via <Script> in the root layout.
 */

import { Paddle, Environment } from '@paddle/paddle-node-sdk'

let _paddle: Paddle | null = null

export function getPaddle(): Paddle {
  if (!_paddle) {
    if (!process.env.PADDLE_API_KEY) {
      throw new Error('PADDLE_API_KEY is not set')
    }

    const environment =
      process.env.PADDLE_ENVIRONMENT === 'production'
        ? Environment.production
        : Environment.sandbox

    _paddle = new Paddle(process.env.PADDLE_API_KEY, {
      environment,
    })
  }
  return _paddle
}

// Re-export as a lazy proxy so imports don't crash at build time
export const paddle = new Proxy({} as Paddle, {
  get(_target, prop) {
    try {
      const instance = getPaddle()
      return (instance as unknown as Record<string | symbol, unknown>)[prop]
    } catch (err) {
      throw new Error(
        `Paddle not configured: ${err instanceof Error ? err.message : 'Missing PADDLE_API_KEY'}`
      )
    }
  },
})
