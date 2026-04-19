/**
 * POST /api/billing/portal
 *
 * Creates a Paddle customer portal session and returns the portal URL.
 * The frontend redirects the user to this URL to manage their subscription.
 *
 * Response: { portalUrl: string }
 */

import { NextResponse } from 'next/server'
import { Paddle } from '@paddle/paddle-node-sdk'
import { createClient } from '@/lib/supabase/server'

const paddle = new Paddle(process.env['PADDLE_API_KEY'] ?? '')

export async function POST() {
  // 1. Verify auth
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

  // 2. Look up Paddle customer ID from subscriptions table
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('paddle_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const customerId = sub?.paddle_customer_id
  if (!customerId) {
    return NextResponse.json(
      { error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' } },
      { status: 404 },
    )
  }

  // 3. Create Paddle portal session
  try {
    const session = await paddle.customerPortalSessions.create(customerId, [])
    return NextResponse.json({ portalUrl: session.urls.general.overview })
  } catch {
    return NextResponse.json(
      { error: { code: 'PORTAL_ERROR', message: 'Failed to create billing portal session' } },
      { status: 502 },
    )
  }
}
