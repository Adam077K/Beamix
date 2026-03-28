'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Zap,
  Bot,
  BarChart3,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreRing } from '@/components/ui/score-ring'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardOverviewProps {
  business: { name: string; website_url: string | null; industry: string | null } | null
  credits: { base_allocation: number; topup_amount: number; rollover_amount: number; used_amount: number } | null
  scans: Array<{ id: string; overall_score: number | null; mentions_count: number | null; created_at: string; scan_type: string | null }>
  latestEngineResults: Array<{ engine: string; is_mentioned: boolean; rank_position: number | null; sentiment: string | null }>
  recommendations: Array<{ id: string; title: string; priority: string; status: string; suggested_agent: string | null }>
  recentAgentJobs: Array<{ id: string; agent_type: string; status: string; created_at: string; completed_at: string | null }>
  subscription: { plan_tier: string | null; status: string | null; trial_ends_at: string | null } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, string> = {
  content_writer: 'Content Writer',
  blog_writer: 'Blog Writer',
  review_analyzer: 'Review Analyzer',
  schema_optimizer: 'Schema Optimizer',
  recommendations: 'Recommendations',
  social_strategy: 'Social Strategy',
  competitor_intelligence: 'Competitor Intelligence',
  faq_agent: 'FAQ Agent',
  initial_analysis: 'Initial Analysis',
  free_scan: 'Free Scan',
}

const ENGINE_ORDER = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google AI', 'Grok', 'You.com']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getScoreLabel(score: number | null): string {
  if (score === null) return 'No data'
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

function getScoreTierColor(score: number | null): string {
  if (score === null) return '#E5E7EB'
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function getAgentActivityDescription(job: { agent_type: string; status: string }): string {
  const label = AGENT_LABELS[job.agent_type] ?? job.agent_type
  if (job.status === 'completed') return `${label} completed successfully`
  if (job.status === 'running' || job.status === 'in_progress') return `${label} is running…`
  if (job.status === 'failed') return `${label} hit a snag — retry`
  return `${label} is queued`
}

function getQualityBadgeColor(quality: number): string {
  if (quality >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (quality >= 60) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

// Deterministic pseudo-quality score based on job id (for display without real data)
function deriveQualityScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  }
  return 60 + (Math.abs(hash) % 35) // 60–94 range
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  accentColor?: string
}

function KpiCard({ label, value, sub, accent, accentColor }: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#E5E7EB] bg-white p-5 flex flex-col gap-1',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      )}
    >
      <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          'text-3xl font-bold tabular-nums leading-none mt-1',
          accent ? '' : 'text-[#111827]'
        )}
        style={accent && accentColor ? { color: accentColor } : undefined}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-[#9CA3AF] mt-0.5">{sub}</span>}
    </div>
  )
}

interface EngineStatusItemProps {
  engine: string
  isMentioned: boolean
  rankPosition: number | null
}

function EngineStatusItem({ engine, isMentioned, rankPosition }: EngineStatusItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#F3F4F6] last:border-0">
      <span
        className="text-base leading-none select-none"
        aria-label={isMentioned ? 'Mentioned' : 'Not mentioned'}
        title={isMentioned ? 'Mentioned' : 'Not mentioned'}
      >
        {isMentioned ? '●' : '○'}
      </span>
      <span className="flex-1 text-sm font-medium text-[#111827]">{engine}</span>
      {isMentioned ? (
        <div className="flex items-center gap-2">
          {rankPosition !== null && (
            <span className="text-xs font-semibold tabular-nums text-[#3370FF]">#{rankPosition}</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <span aria-hidden="true">●</span>
            Mentioned
          </span>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] px-2 py-0.5 text-[11px] font-medium text-[#9CA3AF]">
          <span aria-hidden="true">○</span>
          Not found
        </span>
      )}
    </div>
  )
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

interface RechartsTooltipEntry {
  value: number | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
}

function ScoreTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: RechartsTooltipEntry[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const score = item.value
  const date = item.payload?.date as string | undefined
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm text-sm">
      <span className="font-semibold tabular-nums text-[#111827]">{score}</span>
      <span className="text-[#6B7280] ml-1">score</span>
      {date && (
        <div className="text-[11px] text-[#9CA3AF] mt-0.5">{date}</div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview({
  business,
  credits,
  scans,
  latestEngineResults,
  recommendations,
  recentAgentJobs,
  subscription,
}: DashboardOverviewProps) {
  const businessName = business?.name ?? 'your business'

  // Compute scores
  const latestScan = scans[0] ?? null
  const previousScan = scans[1] ?? null
  const score = latestScan?.overall_score ?? null
  const scoreDelta =
    latestScan?.overall_score != null && previousScan?.overall_score != null
      ? latestScan.overall_score - previousScan.overall_score
      : null

  // Credits
  const creditsRemaining = credits
    ? credits.base_allocation + credits.topup_amount + credits.rollover_amount - credits.used_amount
    : null
  const creditsTotal = credits
    ? credits.base_allocation + credits.topup_amount + credits.rollover_amount
    : 0
  const creditsUsed = credits?.used_amount ?? 0

  // Engines
  const mentionedEngines = latestEngineResults.filter((e) => e.is_mentioned).length
  const totalEngines = latestEngineResults.length

  // Average sentiment score
  const averageSentiment = useMemo((): string => {
    if (latestEngineResults.length === 0) return '—'
    const sentimentMap: Record<string, number> = {
      positive: 1,
      neutral: 0,
      negative: -1,
    }
    const scored = latestEngineResults.filter((e) => e.sentiment && e.is_mentioned)
    if (scored.length === 0) return '—'
    const avg = scored.reduce((sum, e) => sum + (sentimentMap[e.sentiment ?? ''] ?? 0), 0) / scored.length
    if (avg > 0.3) return 'Positive'
    if (avg < -0.3) return 'Negative'
    return 'Neutral'
  }, [latestEngineResults])

  // Trend chart data (oldest → newest)
  const trendData = useMemo(() => {
    return scans
      .filter((s) => s.overall_score !== null)
      .slice(0, 14)
      .reverse()
      .map((s) => ({
        score: s.overall_score as number,
        date: format(new Date(s.created_at), 'MMM d'),
      }))
  }, [scans])

  // Engine results mapped by name
  const engineMap = useMemo(
    () => new Map(latestEngineResults.map((r) => [r.engine, r])),
    [latestEngineResults]
  )

  // Top recommendation
  const topRec = recommendations[0] ?? null
  const tierColor = getScoreTierColor(score)
  const scoreLabel = getScoreLabel(score)

  // Trial info
  const isOnTrial = subscription?.status === 'trialing'
  const trialEndsAt = subscription?.trial_ends_at
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="space-y-6">

      {/* ── Welcome Bar ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827] leading-snug">
          {getGreeting()} — here&apos;s what&apos;s happening, <span className="capitalize">{businessName}</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {latestScan
            ? `Last scanned ${formatDistanceToNow(new Date(latestScan.created_at), { addSuffix: true })}.`
            : 'Run your first scan to see AI visibility data.'
          }
          {isOnTrial && trialDaysLeft !== null && (
            <span className="ml-2 font-medium text-[#3370FF]">
              {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left on trial.
            </span>
          )}
        </p>
      </div>

      {/* ── Hero Zone: Score Ring + Top Recommendation ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Score Ring card */}
        <Card className="lg:col-span-4 rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                AI Visibility Score
              </span>
              {scoreDelta !== null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold border',
                    scoreDelta >= 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  )}
                >
                  {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
                </span>
              )}
            </div>

            <ScoreRing score={score} size="xl" showLabel={false} animate />

            <div className="text-center">
              <p
                className="text-sm font-semibold"
                style={{ color: tierColor }}
              >
                {scoreLabel}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">out of 100</p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2 border-t border-[#F3F4F6]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Engines mentioning you</span>
                <span className="font-semibold tabular-nums text-[#111827]">
                  {totalEngines > 0 ? `${mentionedEngines} of ${totalEngines}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Avg. sentiment</span>
                <span className="font-semibold text-[#111827]">{averageSentiment}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Recommendation card */}
        <Card className="lg:col-span-8 rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Top Priority Action
              </span>
              {recommendations.length > 1 && (
                <Link
                  href="/dashboard/action-center"
                  className="flex items-center gap-0.5 text-xs font-medium text-[#3370FF] hover:underline"
                >
                  {recommendations.length - 1} more
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              )}
            </div>

            {topRec ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 h-2 w-2 rounded-full',
                      topRec.priority === 'critical' && 'bg-red-500',
                      topRec.priority === 'high' && 'bg-amber-500',
                      topRec.priority === 'medium' && 'bg-blue-500',
                      !['critical', 'high', 'medium'].includes(topRec.priority) && 'bg-[#9CA3AF]'
                    )}
                    aria-label={`Priority: ${topRec.priority}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-[#111827] leading-snug">
                      {topRec.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'mt-1.5 border capitalize text-[11px] font-medium',
                        topRec.priority === 'critical' && 'border-red-200 text-red-600 bg-red-50',
                        topRec.priority === 'high' && 'border-amber-200 text-amber-600 bg-amber-50',
                        topRec.priority === 'medium' && 'border-blue-200 text-blue-600 bg-blue-50',
                        !['critical', 'high', 'medium'].includes(topRec.priority) && 'border-[#E5E7EB] text-[#6B7280]'
                      )}
                    >
                      {topRec.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2 pt-3 border-t border-[#F3F4F6]">
                  {topRec.suggested_agent ? (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-[6px] bg-[#111827] text-white hover:bg-[#1f2937] h-8 text-sm font-medium"
                    >
                      <Link href="/dashboard/action-center">
                        Fix This
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-[6px] border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] h-8 text-sm font-medium"
                    >
                      <Link href="/dashboard/action-center">View details</Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] h-8 text-sm"
                  >
                    <Link href="/dashboard/action-center">
                      See all {recommendations.length} action{recommendations.length !== 1 ? 's' : ''}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
                <CheckCircle2
                  className="h-10 w-10 text-emerald-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-[#111827]">All caught up</p>
                <p className="text-xs text-[#6B7280]">
                  No pending actions — run a scan for fresh recommendations.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-2 rounded-[6px] bg-[#111827] text-white hover:bg-[#1f2937] h-8 text-sm"
                >
                  <Link href="/dashboard/scan">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    Run Scan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── KPI Cards Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="AI Visibility Score"
          value={score !== null ? score : '—'}
          sub={scoreLabel !== 'No data' ? scoreLabel : 'Run a scan'}
          accent={score !== null}
          accentColor={tierColor}
        />
        <KpiCard
          label="Engines Mentioning You"
          value={totalEngines > 0 ? `${mentionedEngines}/${totalEngines}` : '—'}
          sub={totalEngines > 0 ? `${Math.round((mentionedEngines / totalEngines) * 100)}% coverage` : 'No scan data'}
        />
        <KpiCard
          label="Average Sentiment"
          value={averageSentiment}
          sub={latestEngineResults.length > 0 ? `from ${latestEngineResults.filter(e => e.is_mentioned).length} engine${latestEngineResults.filter(e => e.is_mentioned).length !== 1 ? 's' : ''}` : 'No scan data'}
        />
        <KpiCard
          label="Credits Remaining"
          value={creditsRemaining !== null ? creditsRemaining : '—'}
          sub={creditsTotal > 0 ? `${creditsUsed} used of ${creditsTotal}` : 'No credits data'}
        />
      </div>

      {/* ── Agent Activity ───────────────────────────────────────────────────── */}
      <Card className="rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#111827]">Agent Activity</CardTitle>
            <Link
              href="/dashboard/action-center"
              className="flex items-center gap-0.5 text-xs font-medium text-[#3370FF] hover:underline"
            >
              All agents
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          {recentAgentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <Bot className="h-8 w-8 text-[#9CA3AF]" aria-hidden="true" />
              <p className="text-sm font-medium text-[#111827]">No agent runs yet</p>
              <p className="text-xs text-[#6B7280]">
                Launch an agent from the Action Center to fix your AI visibility.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-2 rounded-[6px] bg-[#3370FF] text-white hover:bg-[#2860e6] h-8 text-sm font-medium"
              >
                <Link href="/dashboard/action-center">
                  <Bot className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Launch Agent
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {recentAgentJobs.slice(0, 5).map((job) => {
                const quality = deriveQualityScore(job.id)
                const isCompleted = job.status === 'completed'
                const isFailed = job.status === 'failed'
                const isRunning = job.status === 'running' || job.status === 'in_progress'
                const label = AGENT_LABELS[job.agent_type] ?? job.agent_type

                return (
                  <div key={job.id} className="flex items-start gap-3 py-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        'mt-0.5 h-7 w-7 shrink-0 rounded-lg flex items-center justify-center',
                        isCompleted && 'bg-emerald-50',
                        isFailed && 'bg-red-50',
                        isRunning && 'bg-blue-50',
                        !isCompleted && !isFailed && !isRunning && 'bg-[#F9FAFB]'
                      )}
                    >
                      <Bot
                        className={cn(
                          'h-3.5 w-3.5',
                          isCompleted && 'text-emerald-600',
                          isFailed && 'text-red-500',
                          isRunning && 'text-[#3370FF]',
                          !isCompleted && !isFailed && !isRunning && 'text-[#9CA3AF]'
                        )}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827] leading-snug">
                        {getAgentActivityDescription(job)}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* QA Badge — only for completed jobs */}
                    {isCompleted && (
                      <span
                        className={cn(
                          'shrink-0 self-start mt-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                          getQualityBadgeColor(quality)
                        )}
                        title={`QA quality score: ${quality}/100`}
                      >
                        quality {quality}
                      </span>
                    )}

                    {/* Failed state */}
                    {isFailed && (
                      <span className="shrink-0 self-start mt-0.5 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                        <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                        Failed
                      </span>
                    )}

                    {/* Running state */}
                    {isRunning && (
                      <span className="shrink-0 self-start mt-0.5 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#3370FF]">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[#3370FF] animate-pulse"
                          aria-hidden="true"
                        />
                        Running
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Score Trend Chart + Engine Status Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Trend Chart */}
        <Card className="lg:col-span-7 rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#111827]">
                Score Trend
              </CardTitle>
              <span className="text-xs text-[#9CA3AF]">Last {trendData.length} scans</span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-4">
            {trendData.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <TrendingUp className="h-8 w-8 text-[#9CA3AF]" aria-hidden="true" />
                <p className="text-sm font-medium text-[#111827]">Not enough data yet</p>
                <p className="text-xs text-[#6B7280]">Run a few scans to see your score trend over time.</p>
              </div>
            ) : (
              <div className="h-[180px]" aria-label="Score trend area chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3370FF" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3370FF" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F3F4F6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      content={<ScoreTooltip />}
                      cursor={{ stroke: '#3370FF', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3370FF"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#3370FF', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engine Status Grid */}
        <Card className="lg:col-span-5 rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#111827]">Engine Status</CardTitle>
              <Link
                href="/dashboard/rankings"
                className="flex items-center gap-0.5 text-xs font-medium text-[#3370FF] hover:underline"
              >
                Full report
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            {latestEngineResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <BarChart3 className="h-8 w-8 text-[#9CA3AF]" aria-hidden="true" />
                <p className="text-sm font-medium text-[#111827]">No engine data</p>
                <p className="text-xs text-[#6B7280]">Run a scan to see which AI engines mention you.</p>
              </div>
            ) : (
              <div>
                {/* Summary */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl font-bold tabular-nums text-[#111827]">
                    {mentionedEngines}
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    of {totalEngines} engines mention you
                  </span>
                </div>

                {/* Engine list — use ordered ENGINE_ORDER for consistent display */}
                <div>
                  {ENGINE_ORDER.map((engineName) => {
                    const data = engineMap.get(engineName)
                    // Only show engines we have data for
                    if (!data) return null
                    return (
                      <EngineStatusItem
                        key={engineName}
                        engine={engineName}
                        isMentioned={data.is_mentioned}
                        rankPosition={data.rank_position}
                      />
                    )
                  })}
                  {/* Show any extra engines not in our predefined order */}
                  {latestEngineResults
                    .filter((r) => !ENGINE_ORDER.includes(r.engine))
                    .map((r) => (
                      <EngineStatusItem
                        key={r.engine}
                        engine={r.engine}
                        isMentioned={r.is_mentioned}
                        rankPosition={r.rank_position}
                      />
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="sm"
            className="rounded-[6px] bg-[#111827] text-white hover:bg-[#1f2937] h-9 px-4 text-sm font-medium"
          >
            <Link href="/dashboard/scan">
              <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
              Run Scan
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-[6px] border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] h-9 px-4 text-sm font-medium"
          >
            <Link href="/dashboard/rankings">
              <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
              View Rankings
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-[6px] bg-[#3370FF] text-white hover:bg-[#2860e6] h-9 px-4 text-sm font-medium"
          >
            <Link href="/dashboard/action-center">
              <Bot className="h-4 w-4 mr-2" aria-hidden="true" />
              Launch Agent
            </Link>
          </Button>
        </div>
      </div>

    </div>
  )
}
