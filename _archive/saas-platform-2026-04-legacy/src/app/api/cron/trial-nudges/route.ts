import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON:trial-nudges] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Get all trialing subscriptions (LEFT join — no !inner so orphaned users aren't excluded)
  const { data: trialingSubs, error } = await supabase
    .from('subscriptions')
    .select('user_id, trial_ends_at')
    .eq('status', 'trialing')
    .not('trial_ends_at', 'is', null)

  if (error) {
    console.error('[CRON:trial-nudges] Failed to fetch subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }

  const now = new Date()
  let expired = 0

  for (const sub of trialingSubs ?? []) {
    const trialEnd = new Date(sub.trial_ends_at!)
    const daysUntilEnd = Math.floor(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Mark expired trials as cancelled
    if (daysUntilEnd <= 0) {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', sub.user_id)
        .eq('status', 'trialing')

      expired++
    }
  }

  return NextResponse.json({
    expired,
    total: (trialingSubs ?? []).length,
  })
}
