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
    contentStatsResult,
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, website_url, industry, location')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single(),
    supabase
      .from('credit_pools')
      .select('base_allocation, used_amount, held_amount, rollover_amount, topup_amount, pool_type')
      .eq('user_id', user.id)
      .order('period_end', { ascending: false })
      .limit(1)
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
      .in('status', ['new', 'in_progress'])
      .order('priority', { ascending: true })
      .limit(5),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, credits_cost, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('content_items')
      .select('id, agent_type')
      .eq('user_id', user.id),
  ])

  const business = businessResult.data
  const credits = creditsResult.data
  const scans = latestScansResult.data ?? []
  const recommendations = recommendationsResult.data ?? []
  const recentAgents = recentAgentsResult.data ?? []
  const contentItems = contentStatsResult.data ?? []
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

  // Fetch engine results for the latest scan — full columns
  let enginesMentioning: number | null = null
  let totalEngines: number | null = null
  let engineResults: Array<{
    engine: string
    is_mentioned: boolean
    rank_position: number | null
    sentiment: string | null
  }> = []
  let sentimentSummary: { positive: number; neutral: number; negative: number } | undefined

  if (latestScan?.id) {
    const { data: engineData } = await supabase
      .from('scan_engine_results')
      .select('engine, is_mentioned, rank_position, sentiment')
      .eq('scan_id', latestScan.id)

    if (engineData && engineData.length > 0) {
      engineResults = engineData.map((r) => ({
        engine: r.engine,
        is_mentioned: r.is_mentioned,
        rank_position: r.rank_position,
        sentiment: r.sentiment,
      }))
      totalEngines = engineData.length
      enginesMentioning = engineData.filter((r) => r.is_mentioned).length

      // Compute sentiment summary from engine results
      const positive = engineData.filter((r) => r.sentiment === 'positive').length
      const negative = engineData.filter((r) => r.sentiment === 'negative').length
      const neutral = engineData.filter(
        (r) => r.is_mentioned && r.sentiment !== 'positive' && r.sentiment !== 'negative'
      ).length
      sentimentSummary = { positive, neutral, negative }
    }
  }

  // Content stats
  const contentStats = {
    total: contentItems.length,
    published: contentItems.length, // all items are considered published
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
      totalCredits={
        credits
          ? credits.base_allocation +
            credits.rollover_amount +
            credits.topup_amount -
            credits.used_amount -
            (credits.held_amount ?? 0)
          : 0
      }
      monthlyCredits={credits?.base_allocation ?? 0}
      usedCredits={credits?.used_amount ?? 0}
      enginesMentioning={enginesMentioning}
      totalEngines={totalEngines}
      trendData={trendData}
      recommendations={recommendations}
      recentAgents={recentAgents}
      recentScans={scans}
      engineResults={engineResults}
      sentimentSummary={sentimentSummary}
      contentStats={contentStats}
    />
  )
}
