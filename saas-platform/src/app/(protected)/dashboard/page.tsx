import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all data in parallel (no N+1)
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
      .from('credits')
      .select('total_credits, monthly_allocation')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('scan_results')
      .select('id, overall_score, mention_count, avg_position, scanned_at')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false })
      .limit(5),
    supabase
      .from('recommendations')
      .select('id, title, description, priority, recommendation_type, status, agent_type, credits_cost')
      .eq('user_id', user.id)
      .in('status', ['new', 'in_progress'])
      .order('priority', { ascending: true })
      .limit(5),
    supabase
      .from('agent_executions')
      .select('id, agent_type, status, credits_charged, created_at, completed_at')
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

  return (
    <DashboardOverview
      businessName={business?.name ?? 'My Business'}
      businessUrl={business?.website_url ?? null}
      score={latestScan?.overall_score ?? null}
      scoreDelta={scoreDelta}
      mentionCount={latestScan?.mention_count ?? 0}
      lastScanned={latestScan?.scanned_at ?? null}
      totalCredits={credits?.total_credits ?? 0}
      monthlyCredits={credits?.monthly_allocation ?? 0}
      recommendations={recommendations}
      recentAgents={recentAgents}
      recentScans={scans}
    />
  )
}
