import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all dashboard data in parallel (no N+1)
  const [
    businessResult,
    subscriptionResult,
    creditsResult,
    latestScanResult,
    recommendationsResult,
    recentAgentsResult,
    queriesResult,
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, website_url, industry, location')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan_tier, status, trial_ends_at, current_period_end')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('credit_pools')
      .select('base_allocation, topup_amount, rollover_amount, used_amount')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('scans')
      .select('id, overall_score, mentions_count, created_at, scan_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('recommendations')
      .select('id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('priority', { ascending: true })
      .limit(10),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, credits_cost, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('tracked_queries')
      .select('id, query_text, priority, is_active, last_scanned_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(20),
  ])

  const business = businessResult.data
  const subscription = subscriptionResult.data
  const credits = creditsResult.data
  const scans = latestScanResult.data ?? []
  const recommendations = recommendationsResult.data ?? []
  const recentAgents = recentAgentsResult.data ?? []
  const queries = queriesResult.data ?? []

  // Compute hero metric
  const latestScan = scans[0] ?? null
  const previousScan = scans[1] ?? null
  const scoreDelta = latestScan && previousScan && latestScan.overall_score !== null && previousScan.overall_score !== null
    ? latestScan.overall_score - previousScan.overall_score
    : null

  // Trial days
  let trialDaysLeft: number | null = null
  if (subscription?.status === 'trialing' && subscription.trial_ends_at) {
    const diff = new Date(subscription.trial_ends_at).getTime() - Date.now()
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return NextResponse.json({
    business,
    subscription: subscription ? {
      plan_tier: subscription.plan_tier,
      status: subscription.status,
      trial_days_left: trialDaysLeft,
    } : null,
    credits: credits ? {
      total: credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount,
      monthly: credits.base_allocation,
      rollover: credits.rollover_amount,
      bonus: credits.topup_amount,
    } : null,
    hero: {
      score: latestScan?.overall_score ?? null,
      delta: scoreDelta,
      mention_count: latestScan?.mentions_count ?? 0,
      last_scanned: latestScan?.created_at ?? null,
    },
    recommendations,
    recent_agents: recentAgents,
    queries,
    scans,
  })
}
