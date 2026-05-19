import { createClient } from '@/lib/supabase/server'
import { agentTypeLabel, agentOutcomeCta } from '@/constants/agents'
import { HomeClientV2 } from '@/components/home/HomeClientV2'
import type { HomeV2Props } from '@/components/home/HomeClientV2'
import type { KpiStripData } from '@/components/home/KpiStripNew'
import type { EngineCell } from '@/components/home/EngineBreakdownGrid'
import type { NextStepItem } from '@/components/home/NextStepsSection'
import type { RoadmapAction } from '@/components/home/RoadmapTab'
import type { ActivityEvent } from '@/components/home/ActivityFeedNew'
import type { Database } from '@/lib/types/database.types'

type ScanRow = Database['public']['Tables']['scans']['Row']
type ScanEngineRow = Database['public']['Tables']['scan_engine_results']['Row']
type SuggestionRow = Database['public']['Tables']['suggestions']['Row']
type ContentItemRow = Database['public']['Tables']['content_items']['Row']
type CreditPoolRow = Database['public']['Tables']['credit_pools']['Row']
type AutomationConfigRow = Database['public']['Tables']['automation_configs']['Row']
type AgentJobRow = Database['public']['Tables']['agent_jobs']['Row']
type BusinessRow = Database['public']['Tables']['businesses']['Row']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveVerdict(score: number): KpiStripData['verdict'] {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'yesterday'
  return `${diffD} days ago`
}

function formatNextRun(iso: string | null): string {
  if (!iso) return 'Not scheduled'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  if (diffMs < 0) return 'Overdue'
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return 'Less than 1h'
  if (diffH < 24) return `In ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Tomorrow'
  return `In ${diffD} days`
}

// ─── Page (server component) ──────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Middleware should redirect, but guard here
    return <HomeClientV2 {...buildEmptyProps()} />
  }

  const userId = user.id

  // 2. Get primary business
  let business: BusinessRow | null = null
  try {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle()
    business = (data as BusinessRow | null) ?? null
  } catch {
    business = null
  }

  const businessId: string | null = business?.id ?? null

  // 3. Parallel data fetch — all keyed on businessId
  const [
    scansResult,
    engineResultsResult,
    suggestionsResult,
    inboxResult,
    creditPoolResult,
    automationResult,
    agentJobsResult,
    contentDoneResult,
  ] = await Promise.allSettled([
    // Latest 8 scans (sparkline + latest scan)
    businessId
      ? supabase
          .from('scans')
          .select('id, overall_score, created_at, status, engines_scanned, mentions_count')
          .eq('business_id', businessId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [], error: null }),

    // Engine results for latest scan — fetched after we know latest scan id below
    // Placeholder — resolved after scans
    Promise.resolve({ data: [] as ScanEngineRow[], error: null }),

    // Top 3 pending suggestions
    businessId
      ? supabase
          .from('suggestions')
          .select('id, title, description, impact, estimated_runs, agent_type')
          .eq('business_id', businessId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [], error: null }),

    // Inbox preview: draft or in_review content_items
    businessId
      ? supabase
          .from('content_items')
          .select('id, title, agent_type, created_at, status')
          .eq('business_id', businessId)
          .in('status', ['draft', 'in_review'])
          .order('created_at', { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [], error: null }),

    // Credit pool
    supabase
      .from('credit_pools')
      .select('base_allocation, rollover_amount, topup_amount, used_amount, period_end')
      .eq('user_id', userId)
      .eq('pool_type', 'monthly')
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Next automation run
    businessId
      ? supabase
          .from('automation_configs')
          .select('next_run_at')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .is('paused_at', null)
          .order('next_run_at', { ascending: true })
          .limit(1)
      : Promise.resolve({ data: [], error: null }),

    // In-progress agent jobs for RoadmapTab
    businessId
      ? supabase
          .from('agent_jobs')
          .select('id, agent_type, status, created_at')
          .eq('business_id', businessId)
          .in('status', ['running', 'pending'])
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),

    // Completed content items for RoadmapTab
    businessId
      ? supabase
          .from('content_items')
          .select('id, title, agent_type, created_at, status')
          .eq('business_id', businessId)
          .in('status', ['approved', 'published'])
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
  ])

  const scans: ScanRow[] =
    scansResult.status === 'fulfilled' && scansResult.value.data
      ? (scansResult.value.data as ScanRow[])
      : []

  const suggestions: SuggestionRow[] =
    suggestionsResult.status === 'fulfilled' && suggestionsResult.value.data
      ? (suggestionsResult.value.data as SuggestionRow[])
      : []

  const inboxItems: ContentItemRow[] =
    inboxResult.status === 'fulfilled' && inboxResult.value.data
      ? (inboxResult.value.data as ContentItemRow[])
      : []

  const creditPool: CreditPoolRow | null =
    creditPoolResult.status === 'fulfilled' &&
    (creditPoolResult.value as { data: CreditPoolRow | null }).data
      ? (creditPoolResult.value as { data: CreditPoolRow | null }).data
      : null

  const automationRows: AutomationConfigRow[] =
    automationResult.status === 'fulfilled' && automationResult.value.data
      ? (automationResult.value.data as AutomationConfigRow[])
      : []

  const agentJobs: AgentJobRow[] =
    agentJobsResult.status === 'fulfilled' && agentJobsResult.value.data
      ? (agentJobsResult.value.data as AgentJobRow[])
      : []

  const completedContent: ContentItemRow[] =
    contentDoneResult.status === 'fulfilled' && contentDoneResult.value.data
      ? (contentDoneResult.value.data as ContentItemRow[])
      : []

  // 4. Fetch engine results for the latest scan (sequential — depends on scans)
  let engineResults: ScanEngineRow[] = []
  if (scans.length > 0 && scans[0]) {
    try {
      const { data } = await supabase
        .from('scan_engine_results')
        .select('engine, is_mentioned, rank_position, sentiment_score, queries_checked, queries_mentioned')
        .eq('scan_id', scans[0].id)
      engineResults = (data as ScanEngineRow[]) ?? []
    } catch {
      engineResults = []
    }
  }

  // 5. Derive KPI data
  const latestScan = scans[0] ?? null
  const prevScan = scans[1] ?? null

  const score = latestScan?.overall_score ?? 0
  const prevScore = prevScan?.overall_score ?? score
  const scoreDelta = score - prevScore

  // Credit totals
  const creditsUsed = creditPool?.used_amount ?? 0
  const creditsCap =
    creditPool
      ? (creditPool.base_allocation + creditPool.rollover_amount + creditPool.topup_amount)
      : 90

  // Days until credit pool reset
  const creditsResetDays = creditPool?.period_end
    ? Math.max(0, Math.ceil((new Date(creditPool.period_end).getTime() - Date.now()) / 86_400_000))
    : 30

  // Citations: use mentions_count from scans table
  const citationsThisMonth = latestScan?.mentions_count ?? 0
  const citationsLastMonth = prevScan?.mentions_count ?? 0

  const kpi: KpiStripData = {
    score,
    scoreDelta,
    verdict: deriveVerdict(score),
    verdictSubtitle: score === 0
      ? 'Run your first scan to see your AI visibility score.'
      : `Cited in ${latestScan?.engines_scanned?.length ?? 0} AI engines. See below for details.`,
    citationsThisMonth,
    citationsLastMonth,
    impressionsAdded: Math.max(0, citationsThisMonth - citationsLastMonth),
    creditsUsed,
    creditsCap,
    creditsResetDays,
  }

  // 6. Engine breakdown — compute real per-engine mention rates across all scans
  // and a 7-bucket sparkline from the most-recent 8 scans, chronological.
  const scanIdsChronological = [...scans].reverse().map((s) => s.id) // oldest → newest
  const recentScanIds = scanIdsChronological.slice(-8)
  const recentScanIndex = new Map(recentScanIds.map((id, i) => [id, i]))

  const engineStats = new Map<
    string,
    {
      mentionedCount: number
      totalCount: number
      recentMentioned: number[] // length = recentScanIds.length
      recentTotal: number[]
    }
  >()

  for (const row of engineResults) {
    if (!row.engine) continue
    let s = engineStats.get(row.engine)
    if (!s) {
      s = {
        mentionedCount: 0,
        totalCount: 0,
        recentMentioned: new Array(recentScanIds.length).fill(0),
        recentTotal: new Array(recentScanIds.length).fill(0),
      }
      engineStats.set(row.engine, s)
    }
    s.totalCount++
    if (row.is_mentioned) s.mentionedCount++

    const recentIdx = row.scan_id ? recentScanIndex.get(row.scan_id) : undefined
    if (recentIdx != null) {
      s.recentTotal[recentIdx]++
      if (row.is_mentioned) s.recentMentioned[recentIdx]++
    }
  }

  const engines: EngineCell[] = Array.from(engineStats.entries()).map(([engine, s]) => {
    const mentionRate = s.totalCount > 0 ? Math.round((s.mentionedCount / s.totalCount) * 100) : 0
    // Sparkline = per-scan mention rate over the last 8 scans
    const sparkline = s.recentTotal.map((total, i) =>
      total > 0 ? Math.round((s.recentMentioned[i] / total) * 100) : 0,
    )
    // Weekly delta = most-recent-bucket rate minus one-bucket-prior rate (whole percentage points)
    const weeklyDelta =
      sparkline.length >= 2 ? sparkline[sparkline.length - 1] - sparkline[sparkline.length - 2] : 0
    return {
      engine,
      mentionRate,
      weeklyDelta,
      sparkline,
    }
  })

  // 7. Sparkline for score (8 weeks, chronological)
  const sparklineScores = [...scans]
    .reverse()
    .map((s) => s.overall_score ?? 0)

  // 8. Next steps from suggestions
  const nextSteps: NextStepItem[] = suggestions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    impact: (s.impact as 'high' | 'medium' | 'low') ?? 'medium',
    estimatedRuns: s.estimated_runs,
    // Outcome-first CTA (e.g. "Draft FAQ schema") — the agent name is shown
    // as secondary text in the card, so the button surfaces the *result*, not
    // the tool. Audit finding from 5 board members.
    actionLabel: agentOutcomeCta(s.agent_type),
  }))

  // 9. Inbox preview
  const inboxPreview = inboxItems.map((item) => ({
    id: item.id,
    title: item.title,
    agentLabel: agentTypeLabel(item.agent_type),
    ageLabel: relativeTime(item.created_at),
  }))

  // 10. Automation status
  const nextRunIso = automationRows[0]?.next_run_at ?? null
  const automation = {
    nextRun: formatNextRun(nextRunIso),
    creditsUsed,
    creditsCap,
  }

  // 11. Activity feed — derive from agent jobs + scans
  const activityFeed: ActivityEvent[] = []

  if (latestScan) {
    activityFeed.push({
      id: `scan-${latestScan.id}`,
      type: 'scan_complete',
      message: `Scan completed — score ${score}`,
      relativeTime: relativeTime(latestScan.created_at),
    })
  }

  for (const job of agentJobs.slice(0, 3)) {
    activityFeed.push({
      id: `job-${job.id}`,
      type: 'agent_run',
      message: `${agentTypeLabel(job.agent_type)} ${job.status === 'running' ? 'is running' : 'queued'}`,
      relativeTime: relativeTime(job.created_at),
    })
  }

  // 12. RoadmapTab actions
  const roadmapActions: RoadmapAction[] = [
    // Completed: approved/published content items
    ...completedContent.map((item) => ({
      id: `done-${item.id}`,
      label: item.title,
      status: 'completed' as const,
      dateLabel: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    // In Progress: running/pending agent jobs
    ...agentJobs.map((job) => ({
      id: `job-${job.id}`,
      label: `${agentTypeLabel(job.agent_type)} — ${job.status}`,
      status: 'in_progress' as const,
      inboxHref: '/inbox',
    })),
    // Up Next: pending suggestions
    ...suggestions.map((s, i) => ({
      id: `sug-${s.id}`,
      label: s.title,
      status: 'up_next' as const,
      upNextIndex: i + 1,
      note: s.impact ? `Impact: ${s.impact}` : undefined,
    })),
  ]

  const props: HomeV2Props = {
    businessName: business?.name,
    kpi,
    engines,
    nextSteps,
    roadmapActions,
    activityFeed,
    inboxPreview,
    automation,
  }

  return <HomeClientV2 {...props} />
}

// ─── Empty state props (no user / no data) ────────────────────────────────────

function buildEmptyProps(): HomeV2Props {
  return {
    kpi: {
      score: 0,
      scoreDelta: 0,
      verdict: 'Critical',
      verdictSubtitle: 'Run your first scan to see your AI visibility score.',
      citationsThisMonth: 0,
      citationsLastMonth: 0,
      impressionsAdded: 0,
      creditsUsed: 0,
      creditsCap: 90,
      creditsResetDays: 30,
    },
    engines: [],
    nextSteps: [],
    roadmapActions: [],
    activityFeed: [],
    inboxPreview: [],
    automation: { nextRun: 'Not scheduled', creditsUsed: 0, creditsCap: 90 },
  }
}
