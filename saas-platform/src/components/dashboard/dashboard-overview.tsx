'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap,
  Bot,
  BarChart3,
  ArrowRight,
  Globe,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatusDot, type StatusDotStatus } from '@/components/ui/status-dot'
import { TrendBadge } from '@/components/ui/trend-badge'
import { DataTable } from '@/components/ui/data-table'
import { ScoreRing } from '@/components/ui/score-ring'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

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

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT:    '#10B981',
  Gemini:     '#0EA5E9',
  Perplexity: '#8B5CF6',
  Claude:     '#F97316',
  'Google AI': '#FBBF24',
  Grok:       '#EC4899',
  'You.com':  '#06B6D4',
}

const MOCK_COMPETITORS = [
  { name: 'Competitor A', score: 72, position: 1 },
  { name: 'Competitor B', score: 61, position: 2 },
  { name: 'Competitor C', score: 44, position: 4 },
  { name: 'Competitor D', score: 38, position: 5 },
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number | null): string {
  if (score === null) return '#E5E7EB'
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function getAgentStatus(status: string): StatusDotStatus {
  if (status === 'completed') return 'completed'
  if (status === 'running' || status === 'in_progress') return 'running'
  if (status === 'failed') return 'failed'
  return 'pending'
}

function getPriorityStatus(priority: string): StatusDotStatus {
  if (priority === 'critical') return 'failed'
  if (priority === 'high') return 'running'
  if (priority === 'medium') return 'pending'
  return 'idle'
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardOverviewProps {
  businessName: string
  businessUrl: string | null
  score: number | null
  scoreDelta: number | null
  mentionCount: number
  mentionDelta?: number | null
  lastScanned: string | null
  totalCredits: number
  monthlyCredits: number
  enginesMentioning?: number | null
  totalEngines?: number | null
  trendData?: Array<{ score: number }>
  recommendations: Array<{
    id: string
    title: string
    description: string
    priority: string
    recommendation_type: string | null
    status: string
    suggested_agent: string | null
    credits_cost: number | null
  }>
  recentAgents: Array<{
    id: string
    agent_type: string
    status: string
    credits_cost: number
    created_at: string
    completed_at: string | null
  }>
  recentScans: Array<{
    id: string
    overall_score: number | null
    mentions_count: number
    created_at: string
  }>
  engineResults?: Array<{
    engine: string
    is_mentioned: boolean
    rank_position: number | null
    sentiment: string | null
  }>
  sentimentSummary?: {
    positive: number
    neutral: number
    negative: number
  }
  contentStats?: {
    total: number
    published: number
  }
}

// ─── Activity row type ────────────────────────────────────────────────────────

interface ActivityRow {
  id: string
  agent_type: string
  status: string
  credits_cost: number
  created_at: string
}

// ─── Ranking row type ─────────────────────────────────────────────────────────

interface RankingRow {
  position: number
  name: string
  score: string
  numericScore: number
  isUser?: boolean
}

// ─── Engine Performance Bar ───────────────────────────────────────────────────

interface EngineBarProps {
  engine: string
  isMentioned: boolean
  rankPosition: number | null
  color: string
  index: number
}

function EngineBar({ engine, isMentioned, rankPosition, color, index }: EngineBarProps) {
  const [barWidth, setBarWidth] = useState(0)
  const fillPercent = isMentioned ? Math.max(25, 100 - (rankPosition ?? 5) * 15) : 0

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(fillPercent), index * 80 + 150)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillPercent, index])

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-24 shrink-0 truncate text-sm font-medium text-foreground" title={engine}>
        {engine}
      </span>
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          isMentioned ? 'bg-emerald-500' : 'bg-red-400'
        )}
        aria-label={isMentioned ? 'Mentioned' : 'Not mentioned'}
      />
      <div className="relative flex-1 h-2.5 overflow-hidden rounded-full bg-muted/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${barWidth}%`,
            backgroundColor: isMentioned ? color : '#E5E7EB',
            transitionDelay: `${index * 60}ms`,
          }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {isMentioned && rankPosition != null ? `#${rankPosition}` : '—'}
      </span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview({
  businessName,
  score,
  scoreDelta,
  mentionCount,
  mentionDelta,
  lastScanned,
  totalCredits,
  monthlyCredits,
  enginesMentioning,
  totalEngines,
  trendData,
  recommendations,
  recentAgents,
  recentScans,
  engineResults,
  sentimentSummary,
  contentStats,
}: DashboardOverviewProps) {
  const hasData = score !== null
  const creditsUsed = monthlyCredits - totalCredits
  const creditsPercent = monthlyCredits > 0 ? Math.round((creditsUsed / monthlyCredits) * 100) : 0

  const [activitySearch, setActivitySearch] = useState('')

  // Sentiment
  const positive = sentimentSummary?.positive ?? 0
  const neutral = sentimentSummary?.neutral ?? 0
  const negative = sentimentSummary?.negative ?? 0
  const sentimentTotal = positive + neutral + negative
  const positivePct = sentimentTotal > 0 ? Math.round((positive / sentimentTotal) * 100) : 0
  const neutralPct = sentimentTotal > 0 ? Math.round((neutral / sentimentTotal) * 100) : 0
  const negativePct = sentimentTotal > 0 ? Math.round((negative / sentimentTotal) * 100) : 0

  // Chart data (oldest → newest for L→R trend)
  const chartData = recentScans
    .filter((s) => s.overall_score !== null)
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.overall_score as number,
    }))
    .reverse()

  // Top recommendation
  const [topRec, ...restRecs] = recommendations

  // Market position
  const userScore = score ?? 0
  const competitorsAbove = MOCK_COMPETITORS.filter((c) => c.score > userScore).length
  const marketPosition = competitorsAbove + 1

  // Ranking rows
  const rankingRows: RankingRow[] = hasData
    ? [
        {
          position: marketPosition,
          name: businessName || 'You',
          score: score !== null ? `${score}` : '--',
          numericScore: score ?? 0,
          isUser: true,
        },
        ...MOCK_COMPETITORS.map((comp, i) => {
          const rank = i + 1 >= marketPosition ? i + 2 : i + 1
          return {
            position: rank,
            name: comp.name,
            score: `${comp.score}`,
            numericScore: comp.score,
            isUser: false,
          }
        }),
      ].sort((a, b) => a.position - b.position)
    : []

  const rankingColumns: ColumnDef<RankingRow>[] = [
    {
      header: '#',
      accessorKey: 'position',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-muted-foreground text-xs">
          {row.original.position}
        </span>
      ),
    },
    {
      header: 'Business',
      accessorKey: 'name',
      cell: ({ row }) =>
        row.original.isUser ? (
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
            <Badge className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary border-0">
              You
            </Badge>
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">{row.original.name}</span>
        ),
    },
    {
      header: 'Score',
      accessorKey: 'score',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-14 h-1.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full"
              style={{
                width: `${row.original.numericScore}%`,
                backgroundColor: getScoreColor(row.original.numericScore),
              }}
            />
          </div>
          <span className="w-8 text-right font-medium tabular-nums text-foreground text-xs">
            {row.original.score}
          </span>
        </div>
      ),
    },
  ]

  // Activity rows filtered by search
  const activityRows: ActivityRow[] = recentAgents.slice(0, 5)
  const filteredActivity = activitySearch
    ? activityRows.filter((r) =>
        (AGENT_LABELS[r.agent_type] ?? r.agent_type)
          .toLowerCase()
          .includes(activitySearch.toLowerCase())
      )
    : activityRows

  const activityColumns: ColumnDef<ActivityRow>[] = [
    {
      header: 'Type',
      accessorKey: 'agent_type',
      cell: ({ row }) => (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
          <Bot className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </span>
      ),
    },
    {
      header: 'Activity',
      accessorKey: 'agent_type',
      id: 'activity_label',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {AGENT_LABELS[row.original.agent_type] ?? row.original.agent_type}
        </span>
      ),
    },
    {
      header: 'Credits',
      accessorKey: 'credits_cost',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-muted-foreground font-medium">
          {row.original.credits_cost}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const s = getAgentStatus(row.original.status)
        const labels: Record<StatusDotStatus, string> = {
          completed: 'Completed',
          running: 'Running',
          failed: 'Failed',
          pending: 'Pending',
          idle: 'Idle',
        }
        return (
          <span className="flex items-center gap-1.5">
            <StatusDot status={s} size="sm" />
            <span className="text-xs text-muted-foreground">{labels[s]}</span>
          </span>
        )
      },
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {format(new Date(row.original.created_at), 'MMM d')}
        </span>
      ),
    },
  ]

  // Engine list
  const ENGINE_LIST = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google AI', 'Grok', 'You.com']
  const engineMap = new Map((engineResults ?? []).map((r) => [r.engine, r]))

  // Engines active in plan (free plan shows first 3)
  const activeEngines = ENGINE_LIST.slice(0, totalEngines ?? 3)

  // Sparkline
  const sparklineData =
    trendData?.map((d) => d.score) ?? chartData.map((d) => d.score)

  return (
    <div className="space-y-5">

      {/* ── Row 1: Greeting ───────────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}{businessName ? `, ${businessName}` : ''}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Stay on top of your AI visibility, monitor trends, and take action.
        </p>
      </div>

      {/* ── Row 2: Hero Section ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-up [animation-delay:80ms]">

        {/* LEFT col-span-5: Hero Visibility Card */}
        <Card className="lg:col-span-5 rounded-[20px] shadow-[var(--shadow-card)] overflow-hidden">
          <CardContent className="p-6 flex flex-col gap-5 h-full">

            {/* Score section */}
            <div className="flex flex-col gap-1">
              <span className="section-eyebrow">Visibility Score</span>
              <div className="flex items-end gap-4 mt-2">
                <span
                  className="metric-value text-5xl font-bold leading-none"
                  style={{ color: getScoreColor(score) }}
                  aria-label={`Visibility score: ${score ?? 'no data'}`}
                >
                  {score !== null ? score : '--'}
                </span>
                <div className="flex flex-col gap-1 pb-0.5">
                  {scoreDelta != null && (
                    <TrendBadge value={scoreDelta} suffix=" pts" size="sm" />
                  )}
                  <span className="text-xs text-muted-foreground">from last scan</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
                className="rounded-lg bg-primary text-white hover:bg-primary/90 btn-primary-lift"
              >
                <Link href="/dashboard/scan">
                  <Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Run Scan
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-lg border-border hover:bg-muted"
              >
                <Link href="/dashboard/rankings">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  View Rankings
                </Link>
              </Button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* AI Engines sub-cards */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="section-eyebrow">AI Engines</span>
                <span className="text-xs text-muted-foreground">
                  Active{' '}
                  <span className="font-semibold text-foreground">
                    {enginesMentioning ?? 0} of {totalEngines ?? 3}
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeEngines.map((engineName) => {
                  const data = engineMap.get(engineName)
                  const isMentioned = data?.is_mentioned ?? false
                  const rank = data?.rank_position ?? null

                  return (
                    <div
                      key={engineName}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border',
                        isMentioned
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400'
                          : 'bg-muted border-border text-muted-foreground'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full shrink-0',
                          isMentioned ? 'bg-emerald-500' : 'bg-red-400'
                        )}
                        aria-hidden="true"
                      />
                      {engineName}
                      {isMentioned && rank != null && (
                        <span className="font-semibold">#{rank}</span>
                      )}
                      {!isMentioned && <span>—</span>}
                    </div>
                  )
                })}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* CENTER col-span-4: Two stacked accent cards + two small cards */}
        <div className="lg:col-span-4 flex flex-col gap-3">

          {/* Top: Total Mentions — orange accent */}
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-primary/90 to-primary p-5 text-white shadow-[var(--shadow-card)]">
            {/* Background icon decoration */}
            <Globe
              className="absolute right-4 top-4 h-10 w-10 opacity-20"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                Total Mentions
              </span>
              <span className="metric-value text-4xl font-bold text-white leading-none">
                {mentionCount}
              </span>
              {mentionDelta != null && (
                <span className="text-xs font-medium text-white/75">
                  {mentionDelta > 0 ? '+' : ''}{mentionDelta}% this month
                </span>
              )}
            </div>
          </div>

          {/* Bottom: Recommendations */}
          <Card className="rounded-[20px] shadow-[var(--shadow-card)] flex-1">
            <CardContent className="p-5 flex flex-col gap-2">
              <span className="section-eyebrow">Recommendations</span>
              <div className="flex items-end gap-2">
                <span className="metric-value text-4xl font-bold text-foreground leading-none">
                  {recommendations.length}
                </span>
                <span className="text-sm text-muted-foreground pb-0.5">pending actions</span>
              </div>
              {recommendations.some((r) => r.priority === 'critical') && (
                <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {recommendations.filter((r) => r.priority === 'critical').length} critical
                </span>
              )}
            </CardContent>
          </Card>

          {/* Two small cards side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="section-eyebrow">Content</span>
                <span className="metric-value text-2xl font-bold text-foreground leading-none">
                  {contentStats?.total ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  {contentStats?.published ?? 0} published
                </span>
              </CardContent>
            </Card>
            <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
              <CardContent className="p-4 flex flex-col gap-2">
                <span className="section-eyebrow">Credits</span>
                <span className="metric-value text-2xl font-bold text-foreground leading-none">
                  {creditsUsed}/{monthlyCredits}
                </span>
                <Progress
                  value={creditsPercent}
                  className="h-1.5 bg-primary/15 [&>div]:bg-primary"
                  aria-label={`${creditsPercent}% credits used`}
                />
              </CardContent>
            </Card>
          </div>

        </div>

        {/* RIGHT col-span-3: Sentiment Gauge */}
        <Card className="lg:col-span-3 rounded-[20px] shadow-[var(--shadow-card)]">
          <CardContent className="p-5 flex flex-col items-center gap-4 h-full justify-between">
            <div className="w-full flex items-center justify-between">
              <span className="section-eyebrow">Sentiment Balance</span>
              <Link
                href="/dashboard/rankings"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
              >
                Details <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            {/* Ring — using ScoreRing with positive pct as score */}
            <div className="flex flex-col items-center gap-1">
              <ScoreRing
                score={positivePct}
                size="md"
                showLabel={false}
                animate
              />
              <span className="text-sm font-semibold text-foreground">
                {positivePct}%
              </span>
              <span className="text-xs text-muted-foreground">Positive sentiment</span>
            </div>

            {/* Legend */}
            <div className="w-full flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Positive
                </span>
                <span className="tabular-nums font-medium">{positive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden="true" />
                  Neutral
                </span>
                <span className="tabular-nums font-medium">{neutral}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
                  Negative
                </span>
                <span className="tabular-nums font-medium">{negative}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Row 3: Credit Usage + Recent Activity ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up [animation-delay:160ms]">

        {/* Credit Usage */}
        <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Agent Credit Usage</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <span className="metric-value text-3xl font-bold text-foreground">
                  {creditsUsed}
                  <span className="text-lg font-medium text-muted-foreground ml-1">
                    / {monthlyCredits}
                  </span>
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    creditsPercent >= 80 ? 'text-red-500' : 'text-muted-foreground'
                  )}
                >
                  {creditsPercent}%
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-primary/15">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${creditsPercent}%` }}
                  role="progressbar"
                  aria-valuenow={creditsPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${creditsUsed} of ${monthlyCredits} credits used`}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {creditsUsed} of {monthlyCredits} credits used this month
              </span>
            </div>

            {/* Segment breakdown */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/60">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Used</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{creditsUsed}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Remaining</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{totalCredits}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{monthlyCredits}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Search…"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 w-28"
                    aria-label="Search activity"
                  />
                </div>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="Filter activity"
                >
                  <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            {filteredActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <Bot className="h-8 w-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Run your first agent to see results here.</p>
              </div>
            ) : (
              <DataTable
                columns={activityColumns}
                data={filteredActivity}
                emptyMessage="No matching activity."
              />
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Row 4: Engine Performance ────────────────────────────────────────── */}
      <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:240ms]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Engine Performance</CardTitle>
            <Link
              href="/dashboard/rankings"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              Full report <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5 pt-0">
          {activeEngines.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Run a scan to see engine performance.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {activeEngines.map((engine, i) => {
                const data = engineMap.get(engine)
                return (
                  <EngineBar
                    key={engine}
                    engine={engine}
                    isMentioned={data?.is_mentioned ?? false}
                    rankPosition={data?.rank_position ?? null}
                    color={ENGINE_COLORS[engine] ?? '#9CA3AF'}
                    index={i}
                  />
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Row 5: Recommendations + Industry Ranking ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up [animation-delay:320ms]">

        {/* Recommended Actions */}
        <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recommended Actions</CardTitle>
              <Link
                href="/dashboard/recommendations"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5 pt-0 flex flex-col gap-0">
            {recommendations.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/60" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No pending actions — you're all caught up.</p>
              </div>
            ) : (
              [...recommendations].slice(0, 5).map((rec, i) => {
                const isTop = i === 0
                const priorityStatus = getPriorityStatus(rec.priority)
                return (
                  <div
                    key={rec.id}
                    className={cn(
                      'flex items-start gap-3 py-3.5 border-b border-border/50 last:border-0',
                      isTop && 'pb-4'
                    )}
                  >
                    <StatusDot status={priorityStatus} size="md" className="mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-medium text-foreground leading-snug',
                          isTop ? 'text-sm' : 'text-xs'
                        )}
                      >
                        {rec.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                    {rec.suggested_agent && (
                      <Link
                        href={`/dashboard/agents`}
                        className="shrink-0 flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                      >
                        Run Agent <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Industry Ranking */}
        <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Industry Ranking</CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-muted-foreground border-border"
              >
                vs. competitors
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Based on estimated data. Add real competitors in Competitor Intelligence.
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            {rankingRows.length === 0 ? (
              <div className="py-8 text-center px-6">
                <p className="text-sm text-muted-foreground">Run a scan to unlock ranking data.</p>
              </div>
            ) : (
              <DataTable
                columns={rankingColumns}
                data={rankingRows}
                highlightRow={(row) => row.isUser === true}
                emptyMessage="No ranking data available."
              />
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
