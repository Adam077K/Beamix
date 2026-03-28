import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all dashboard data in parallel
  const [
    businessResult,
    creditsResult,
    latestScansResult,
    recommendationsResult,
    recentAgentJobsResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('name, website_url, industry')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('credit_pools')
      .select('base_allocation, used_amount, rollover_amount, topup_amount')
      .eq('user_id', user.id)
      .order('period_end', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('scans')
      .select('id, overall_score, mentions_count, created_at, scan_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('recommendations')
      .select('id, title, priority, status, suggested_agent')
      .eq('user_id', user.id)
      .in('status', ['new', 'in_progress'])
      .order('priority', { ascending: true })
      .limit(10),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('subscriptions')
      .select('plan_tier, status, trial_ends_at')
      .eq('user_id', user.id)
      .single(),
  ])

  const business = businessResult.data ?? null
  const credits = creditsResult.data ?? null
  const scans = latestScansResult.data ?? []
  const recommendations = recommendationsResult.data ?? []
  const recentAgentJobs = recentAgentJobsResult.data ?? []
  const subscription = subscriptionResult.data ?? null

  // Fetch engine results for the latest scan
  const latestScan = scans[0] ?? null
  let latestEngineResults: Array<{
    engine: string
    is_mentioned: boolean
    rank_position: number | null
    sentiment: string | null
  }> = []

  if (latestScan?.id) {
    const { data: engineData } = await supabase
      .from('scan_engine_results')
      .select('engine, is_mentioned, rank_position, sentiment')
      .eq('scan_id', latestScan.id)

    latestEngineResults = engineData ?? []
  }

  return (
    <DashboardOverview
      business={business}
      credits={credits}
      scans={scans}
      latestEngineResults={latestEngineResults}
      recommendations={recommendations}
      recentAgentJobs={recentAgentJobs}
      subscription={subscription}
    />
  )
}
