/**
 * POST /api/onboarding/complete
 *
 * Marks the authenticated user's onboarding as complete.
 * Uses UPSERT on user_profiles so a missing row (common for new signups
 * before the DB trigger fires) doesn't silently 0-row and leave the
 * user in an infinite redirect loop.
 *
 * Body: { businessName?: string; scanId?: string }
 * Response: { ok: true }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
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

  let body: { businessName?: string; scanId?: string } = {}
  try {
    body = await req.json()
  } catch {
    // body is optional — proceed with empty object
  }

  const now = new Date().toISOString()

  // UPSERT user_profiles — prevents infinite redirect when trigger hasn't fired
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        onboarding_completed_at: now,
        ...(body.scanId ? { onboarding_scan_id: body.scanId } : {}),
        updated_at: now,
      } as never,
      { onConflict: 'id' },
    )

  if (profileError) {
    console.error('[onboarding/complete] profile upsert failed:', profileError)
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to mark onboarding complete' } },
      { status: 500 },
    )
  }

  // UPSERT businesses row if a business name was provided
  if (body.businessName) {
    const { error: bizError } = await supabase
      .from('businesses')
      .upsert(
        {
          user_id: user.id,
          name: body.businessName,
          created_at: now,
          updated_at: now,
        } as never,
        { onConflict: 'user_id' },
      )

    if (bizError) {
      // Non-fatal — log and continue; onboarding is still marked complete
      console.error('[onboarding/complete] business upsert failed:', bizError)
    }
  }

  return NextResponse.json({ ok: true })
}
