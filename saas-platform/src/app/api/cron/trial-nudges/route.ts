import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  sendTrialDay7Email,
  sendTrialDay12Email,
  sendTrialExpiredEmail,
} from '@/lib/email/events'

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

  // Get all trialing subscriptions
  const { data: trialingSubs, error } = await supabase
    .from('subscriptions')
    .select(`
      user_id,
      plan_tier,
      trial_end,
      created_at,
      users!inner(email, full_name)
    `)
    .eq('status', 'trialing')
    .not('trial_end', 'is', null)

  if (error) {
    console.error('[CRON:trial-nudges] Failed to fetch subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }

  const now = new Date()
  let sent = 0
  let failed = 0

  for (const sub of trialingSubs ?? []) {
    const trialEnd = new Date(sub.trial_end!)
    const trialStart = new Date(sub.created_at)
    const daysSinceStart = Math.floor(
      (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysUntilEnd = Math.floor(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    const user = sub.users as unknown as { email: string; full_name: string | null }
    const userName = user.full_name ?? 'there'

    // Check expiration FIRST — skip day 7/12 nudges for expired trials
    if (daysUntilEnd <= 0) {
      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('user_id', sub.user_id)
        .eq('status', 'trialing')

      const planName = sub.plan_tier === 'pro' ? 'Pro' : sub.plan_tier === 'starter' ? 'Starter' : 'Business'

      const result = await sendTrialExpiredEmail(user.email, {
        name: userName,
        planName,
      })

      if (result.success) sent++
      else failed++
      continue
    }

    // Day 7 nudge
    if (daysSinceStart === 7) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', sub.user_id)
        .eq('is_primary', true)
        .single()

      let currentScore = 0
      if (business) {
        const { data: latestScan } = await supabase
          .from('scan_results')
          .select('overall_score')
          .eq('user_id', sub.user_id)
          .eq('business_id', business.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        currentScore = latestScan?.overall_score ?? 0
      }

      const { count: contentCount } = await supabase
        .from('content_generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', sub.user_id)

      const result = await sendTrialDay7Email(user.email, {
        name: userName,
        currentScore,
        contentGenerated: contentCount ?? 0,
        daysLeft: daysUntilEnd,
      })

      if (result.success) sent++
      else failed++
    }

    // Day 12 nudge (2 days left)
    if (daysSinceStart === 12) {
      const result = await sendTrialDay12Email(user.email, {
        name: userName,
        daysLeft: daysUntilEnd,
        featuresAtRisk: [
          'AI-powered scan agents',
          'Content generation',
          'Competitor tracking',
          'Weekly ranking reports',
          'Priority recommendations',
        ],
      })

      if (result.success) sent++
      else failed++
    }
  }

  return NextResponse.json({
    sent,
    failed,
    total: (trialingSubs ?? []).length,
  })
}
