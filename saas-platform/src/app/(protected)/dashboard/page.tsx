import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Real data path — fetch all parallel queries
  const [
    businessResult,
    creditsResult,
    latestScansResult,
    recommendationsResult,
    recentAgentsResult,
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, website_url, industry, location')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('credit_pools')
      .select('base_allocation, rollover_amount, topup_amount, used_amount')
      .eq('user_id', user.id)
      .eq('pool_type', 'agent')
      .single(),
    supabase
      .from('scans')
      .select('id, overall_score, mentions_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('recommendations')
      .select('id, title, description, priority, recommendation_type, status, suggested_agent, credits_cost')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('priority', { ascending: true })
      .limit(5),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, credits_cost, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const business = businessResult.data
  const credits = creditsResult.data
  const scans = latestScansResult.data ?? []
  const recommendations = recommendationsResult.data ?? []
  const recentAgents = recentAgentsResult.data ?? []
  const latestScan = scans[0] ?? null
  const previousScan = scans[1] ?? null

  const scoreDelta =
    latestScan?.overall_score !== null &&
    latestScan?.overall_score !== undefined &&
    previousScan?.overall_score !== null &&
    previousScan?.overall_score !== undefined
      ? latestScan.overall_score - previousScan.overall_score
      : null

  const mentionDelta =
    latestScan !== null && previousScan !== null
      ? latestScan.mentions_count - previousScan.mentions_count
      : null

  // Fetch engine results for the latest scan
  let enginesMentioning: number | null = null
  let totalEngines: number | null = null

  if (latestScan?.id) {
    const { data: engineData } = await supabase
      .from('scan_engine_results')
      .select('is_mentioned')
      .eq('scan_id', latestScan.id)

    if (engineData) {
      totalEngines = engineData.length
      enginesMentioning = engineData.filter((r) => r.is_mentioned).length
    }
  }

  // Build trend data from scans (oldest → newest) for sparklines
  const trendData = scans
    .filter((s) => s.overall_score !== null)
    .map((s) => ({ score: s.overall_score as number }))
    .reverse()

  return (
    <DashboardOverview
      businessName={business?.name ?? 'My Business'}
      businessUrl={business?.website_url ?? null}
      score={latestScan?.overall_score ?? null}
      scoreDelta={scoreDelta}
      mentionCount={latestScan?.mentions_count ?? 0}
      mentionDelta={mentionDelta}
      lastScanned={latestScan?.created_at ?? null}
      totalCredits={credits ? (credits.base_allocation + credits.rollover_amount + credits.topup_amount - credits.used_amount) : 0}
      monthlyCredits={credits?.base_allocation ?? 0}
      enginesMentioning={enginesMentioning}
      totalEngines={totalEngines}
      trendData={trendData}
      recommendations={recommendations}
      recentAgents={recentAgents}
      recentScans={scans}
    />
  )
}
