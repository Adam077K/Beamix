import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

// ── MOCK DATA (remove after demo) ──────────────────────────────────────────
const USE_MOCK_DATA = false

const MOCK_SCANS = [
  { id: 's1', overall_score: 58, mentions_count: 3, created_at: new Date(Date.now() - 0 * 86400000).toISOString() },
  { id: 's2', overall_score: 52, mentions_count: 3, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 's3', overall_score: 47, mentions_count: 2, created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 's4', overall_score: 41, mentions_count: 2, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 's5', overall_score: 35, mentions_count: 1, created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
]

const MOCK_RECOMMENDATIONS = [
  {
    id: 'r1',
    title: 'Write a blog post about insurance AI trends',
    description: 'ChatGPT and Gemini frequently cite blog content when answering insurance queries. A well-structured post could get you mentioned.',
    priority: 'critical',
    recommendation_type: 'content',
    status: 'pending',
    suggested_agent: 'blog_writer',
    credits_cost: 1,
  },
  {
    id: 'r2',
    title: 'Add FAQ schema to your services page',
    description: 'Your services page lacks structured data. Adding FAQ schema increases the chance of AI engines parsing your content correctly.',
    priority: 'high',
    recommendation_type: 'technical',
    status: 'pending',
    suggested_agent: 'schema_optimizer',
    credits_cost: 1,
  },
  {
    id: 'r3',
    title: 'Optimize your homepage copy for AI citations',
    description: 'Your homepage copy uses generic language. Rewriting with specific claims and data points improves AI mention probability.',
    priority: 'high',
    recommendation_type: 'content',
    status: 'pending',
    suggested_agent: 'content_writer',
    credits_cost: 1,
  },
  {
    id: 'r4',
    title: 'Respond to 12 pending Google reviews',
    description: 'AI engines factor in review sentiment and recency. Responding to reviews signals active business presence.',
    priority: 'medium',
    recommendation_type: 'reputation',
    status: 'pending',
    suggested_agent: 'review_analyzer',
    credits_cost: 1,
  },
  {
    id: 'r5',
    title: 'Create a competitor comparison page',
    description: 'Pages that directly compare your services to competitors rank well in AI search for "best X in Y" queries.',
    priority: 'medium',
    recommendation_type: 'content',
    status: 'pending',
    suggested_agent: 'content_writer',
    credits_cost: 1,
  },
]

const MOCK_AGENTS = [
  { id: 'a1', agent_type: 'blog_writer', status: 'completed', credits_cost: 1, created_at: new Date(Date.now() - 2 * 3600000).toISOString(), completed_at: new Date(Date.now() - 1.5 * 3600000).toISOString() },
  { id: 'a2', agent_type: 'schema_optimizer', status: 'completed', credits_cost: 1, created_at: new Date(Date.now() - 24 * 3600000).toISOString(), completed_at: new Date(Date.now() - 23 * 3600000).toISOString() },
  { id: 'a3', agent_type: 'content_writer', status: 'running', credits_cost: 1, created_at: new Date(Date.now() - 0.5 * 3600000).toISOString(), completed_at: null },
  { id: 'a4', agent_type: 'competitor_intelligence', status: 'completed', credits_cost: 1, created_at: new Date(Date.now() - 48 * 3600000).toISOString(), completed_at: new Date(Date.now() - 47 * 3600000).toISOString() },
  { id: 'a5', agent_type: 'faq_agent', status: 'completed', credits_cost: 1, created_at: new Date(Date.now() - 72 * 3600000).toISOString(), completed_at: new Date(Date.now() - 71 * 3600000).toISOString() },
]
// ── END MOCK DATA ──────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  if (USE_MOCK_DATA) {
    // Fetch only business name from DB, use mock for everything else
    const { data: business } = await supabase
      .from('businesses')
      .select('name, website_url')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    return (
      <DashboardOverview
        businessName={business?.name ?? 'Starter Insurance'}
        businessUrl={business?.website_url ?? 'https://starter-insurance.co.il'}
        score={58}
        scoreDelta={6}
        mentionCount={3}
        lastScanned={new Date(Date.now() - 3600000).toISOString()}
        totalCredits={8}
        monthlyCredits={15}
        recommendations={MOCK_RECOMMENDATIONS}
        recentAgents={MOCK_AGENTS}
        recentScans={MOCK_SCANS}
      />
    )
  }

  // Real data path — fetch all parallel queries
  const [
    businessResult,
    creditsResult,
    latestScansResult,
    recommendationsResult,
    recentAgentsResult,
    contentItemsResult,
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
    supabase
      .from('content_items')
      .select('id, status')
      .eq('user_id', user.id),
  ])

  const business = businessResult.data
  const credits = creditsResult.data
  const scans = latestScansResult.data ?? []
  const recommendations = recommendationsResult.data ?? []
  const recentAgents = recentAgentsResult.data ?? []
  const contentItems = contentItemsResult.data ?? []

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

  // Content stats
  const contentStats = {
    total: contentItems.length,
    published: contentItems.filter((c) => c.status === 'published').length,
  }

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
