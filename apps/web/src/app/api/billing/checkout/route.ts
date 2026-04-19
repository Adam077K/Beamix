/**
 * POST /api/billing/checkout
 *
 * Returns the data needed for the frontend to open a Paddle.js overlay checkout.
 * Paddle's JS SDK handles the actual checkout UI — the server resolves the
 * authenticated user and returns priceId + customer metadata so the client
 * can pre-fill the checkout session.
 *
 * Body: { priceId: string; successUrl?: string }
 * Response: { priceId, customerEmail, customData, successUrl }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CheckoutRequestSchema } from '@/lib/types/api'

export async function POST(req: Request) {
  // 1. Validate request body
  const body: unknown = await req.json().catch(() => null)
  const parsed = CheckoutRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid checkout payload',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    )
  }

  // 2. Verify auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } },
      { status: 401 },
    )
  }

  // 3. Return checkout metadata — Paddle.js on the client opens the overlay
  return NextResponse.json({
    priceId: parsed.data.priceId,
    customerEmail: user.email,
    customData: { user_id: user.id },
    successUrl: parsed.data.successUrl ?? '/onboarding/post-payment',
  })
}
