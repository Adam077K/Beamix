'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  ScanSearch,
  Search,
  TrendingUp,
  Activity,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { ChartCard } from '@/components/ui/chart-card'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { StatusDot } from '@/components/ui/status-dot'
import { ScoreRing } from '@/components/ui/score-ring'
import { TrendBadge } from '@/components/ui/trend-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  CHART_COLORS,
  DEFAULT_XAXIS_PROPS,
  DEFAULT_YAXIS_PROPS,
  DEFAULT_GRID_PROPS,
  CHART_MARGINS,
  CHART_ANIMATION,
} from '@/lib/chart-theme'
import { formatDistanceToNow, format } from 'date-fns'
import type { LlmProvider } from '@/constants/engines'
import { PROVIDER_LABELS } from '@/constants/engines'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

// ─── Types ────────────────────────────────────────────────────────────────────

type MentionSentiment = 'positive' | 'neutral' | 'negative'

interface RankingsViewProps {
  scans: Array<{
    id: string
    overall_score: number | null
    mentions_count: number
    created_at: string
    scan_type: string
  }>
  latestDetails: Array<{
    id: string
    scan_id: string
    engine: string
    is_mentioned: boolean
    rank_position: number | null
    sentiment: MentionSentiment | null
  }>
  queries: Array<{
    id: string
    query_text: string
    priority: string
    is_active: boolean
    last_scanned_at: string | null
  }>
}

// ─── Engine bar colors ────────────────────────────────────────────────────────

const ENGINE_BAR_COLORS: Record<string, string> = {
  chatgpt: '#10B981',
  gemini: '#0EA5E9',
  perplexity: '#8B5CF6',
  claude: '#FF3C00',
  google_ai_overviews: '#FBBF24',
}

function getEngineBarColor(engine: string): string {
  return ENGINE_BAR_COLORS[engine] ?? '#6B7280'
}

function rankToBarScore(rank: number | null): number {
  if (!rank || rank <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((1 / rank) * 100)))
}

function getScoreColor(score: number | null): string {
  if (score === null) return '#E5E7EB'
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

// ─── Sentiment badge ──────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: MentionSentiment | null }) {
  if (!sentiment) return <span className="text-muted-foreground text-sm">—</span>

  const config = {
    positive: { label: 'Positive', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    neutral:  { label: 'Neutral',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
    negative: { label: 'Negative', className: 'bg-red-50 text-red-700 border-red-200' },
  }[sentiment]

  return (
    <Badge variant="outline" className={cn('text-xs capitalize', config.className)}>
      {config.label}
    </Badge>
  )
}

// ─── Animated engine performance bar ─────────────────────────────────────────

interface EnginePerformanceBarProps {
  engine: string
  label: string
  isMentioned: boolean
  rankPosition: number | null
  sentiment: MentionSentiment | null
  color: string
  index: number
}

function EnginePerformanceBar({
  engine,
  label,
  isMentioned,
  rankPosition,
  sentiment,
  color,
  index,
}: EnginePerformanceBarProps) {
  const [barWidth, setBarWidth] = useState(0)
  const fillPercent = isMentioned
    ? rankPosition
      ? rankToBarScore(rankPosition)
      : 60
    : 0

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(fillPercent), index * 80 + 200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillPercent, index])

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0">
      {/* Engine name + dot */}
      <div className="flex items-center gap-2 w-32 shrink-0">
        <span
          className={cn('h-2 w-2 rounded-full shrink-0', isMentioned ? 'bg-emerald-500' : 'bg-red-400')}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-foreground truncate">{label}</span>
      </div>

      {/* Mention status */}
      <div className="w-28 shrink-0">
        <span
          className={cn(
            'text-xs font-medium',
            isMentioned ? 'text-emerald-600' : 'text-red-500'
          )}
        >
          {isMentioned ? 'Mentioned' : 'Not found'}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 min-w-0">
        <div
          className="relative h-2.5 overflow-hidden rounded-full bg-muted/60"
          role="meter"
          aria-valuenow={barWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} score`}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${barWidth}%`,
              backgroundColor: isMentioned ? color : '#E5E7EB',
              transitionDelay: `${index * 60}ms`,
            }}
          />
        </div>
      </div>

      {/* Sentiment */}
      <div className="w-24 shrink-0 text-right">
        <SentimentBadge sentiment={sentiment} />
      </div>

      {/* Position */}
      <div className="w-10 shrink-0 text-right">
        <span className="text-sm font-mono tabular-nums text-muted-foreground">
          {isMentioned && rankPosition != null ? `#${rankPosition}` : '—'}
        </span>
      </div>
    </div>
  )
}

// ─── Engine row types for DataTable ──────────────────────────────────────────

interface EngineRow {
  id: string
  engine: string
  label: string
  is_mentioned: boolean
  rank_position: number | null
  sentiment: MentionSentiment | null
}

// ─── Query row types for DataTable ────────────────────────────────────────────

interface QueryRow {
  id: string
  query_text: string
  priority: string
  is_active: boolean
  last_scanned_at: string | null
}

const queryColumns: ColumnDef<QueryRow>[] = [
  {
    accessorKey: 'query_text',
    header: 'Query',
    cell: ({ row }) => {
      const priority = row.original.priority
      const dotStatus =
        priority === 'high'   ? 'running'   :
        priority === 'medium' ? 'pending'   :
        'idle'

      return (
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={dotStatus} size="sm" />
          <span className="truncate text-sm text-foreground">{row.original.query_text}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const p = row.original.priority
      const cls =
        p === 'high'   ? 'bg-red-50 text-red-700 border-red-200' :
        p === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-muted text-muted-foreground border-border'
      return (
        <Badge variant="outline" className={cn('text-xs capitalize', cls)}>
          {p}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <StatusDot status={row.original.is_active ? 'completed' : 'idle'} size="sm" />
        <span className="text-xs text-muted-foreground">
          {row.original.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'last_scanned_at',
    header: 'Last Scanned',
    meta: { align: 'right' },
    cell: ({ row }) => {
      const ts = row.original.last_scanned_at
      if (!ts) return <span className="text-muted-foreground text-sm">Never</span>
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDistanceToNow(new Date(ts), { addSuffix: true })}
        </span>
      )
    },
  },
]

// ─── Scan history row for DataTable ──────────────────────────────────────────

interface ScanHistoryRow {
  id: string
  date: string
  score: number | null
  mentions: number
  delta: number | null
}

const scanHistoryColumns: ColumnDef<ScanHistoryRow>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-foreground font-medium">{row.original.date}</span>
    ),
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.original.score
      const color = getScoreColor(score)
      return (
        <span className="font-mono font-bold tabular-nums text-sm" style={{ color }}>
          {score ?? '—'}
        </span>
      )
    },
  },
  {
    accessorKey: 'mentions',
    header: 'Mentions',
    meta: { align: 'center' },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums text-center block">
        {row.original.mentions}
      </span>
    ),
  },
  {
    accessorKey: 'delta',
    header: 'Change',
    meta: { align: 'right' },
    cell: ({ row }) => {
      const delta = row.original.delta
      if (delta === null) return <span className="text-muted-foreground text-sm">—</span>
      return (
        <div className="flex justify-end">
          <TrendBadge value={delta} suffix=" pts" size="sm" />
        </div>
      )
    },
  },
]

// ─── RankingsView ─────────────────────────────────────────────────────────────

export function RankingsView({ scans, latestDetails, queries }: RankingsViewProps) {
  const latestScan = scans[0] ?? null
  const hasData = latestScan !== null

  // ── Derived stats ─────────────────────────────────────────────────────────
  const mentionedEngines = latestDetails.filter((d) => d.is_mentioned)
  const mentionedEngineLabels = mentionedEngines.map(
    (d) => PROVIDER_LABELS[d.engine as LlmProvider] ?? d.engine,
  )

  const scoreVal = latestScan?.overall_score ?? null
  const scoreColor = getScoreColor(scoreVal)

  const scoreTrend =
    scans.length >= 2 && scans[0].overall_score !== null && scans[1].overall_score !== null
      ? scans[0].overall_score - scans[1].overall_score
      : null

  const avgPosition =
    mentionedEngines.filter((e) => e.rank_position !== null).length > 0
      ? Math.round(
          mentionedEngines
            .filter((e) => e.rank_position !== null)
            .reduce((sum, e) => sum + (e.rank_position ?? 0), 0) /
          mentionedEngines.filter((e) => e.rank_position !== null).length
        )
      : null

  // ── Sentiment summary ─────────────────────────────────────────────────────
  const positiveCount = latestDetails.filter((d) => d.sentiment === 'positive').length
  const neutralCount  = latestDetails.filter((d) => d.sentiment === 'neutral').length
  const negativeCount = latestDetails.filter((d) => d.sentiment === 'negative').length
  const sentimentTotal = positiveCount + neutralCount + negativeCount
  const positivePct = sentimentTotal > 0 ? Math.round((positiveCount / sentimentTotal) * 100) : 0

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = scans
    .slice()
    .reverse()
    .map((s) => ({
      date: format(new Date(s.created_at), 'MMM d'),
      score: s.overall_score ?? 0,
      mentions: s.mentions_count,
    }))

  // ── Donut chart data ──────────────────────────────────────────────────────
  const mentionedCount = latestDetails.filter((d) => d.is_mentioned).length
  const notMentionedCount = latestDetails.length - mentionedCount
  const donutData = [
    { name: 'Mentioned', value: mentionedCount, color: '#10B981' },
    { name: 'Not Mentioned', value: notMentionedCount, color: '#E5E7EB' },
  ]

  // ── Engine rows ───────────────────────────────────────────────────────────
  const engineRows: EngineRow[] = latestDetails.map((d) => ({
    id: d.id,
    engine: d.engine,
    label: PROVIDER_LABELS[d.engine as LlmProvider] ?? d.engine,
    is_mentioned: d.is_mentioned,
    rank_position: d.rank_position,
    sentiment: d.sentiment,
  }))

  // ── Query rows ────────────────────────────────────────────────────────────
  const queryRows: QueryRow[] = queries.map((q) => ({
    id: q.id,
    query_text: q.query_text,
    priority: q.priority,
    is_active: q.is_active,
    last_scanned_at: q.last_scanned_at,
  }))

  // ── Scan history rows ─────────────────────────────────────────────────────
  const scanHistoryRows: ScanHistoryRow[] = scans.slice(0, 10).map((s, i) => ({
    id: s.id,
    date: format(new Date(s.created_at), 'MMM d, yyyy'),
    score: s.overall_score,
    mentions: s.mentions_count,
    delta:
      i < scans.length - 1 && s.overall_score !== null && scans[i + 1].overall_score !== null
        ? s.overall_score - (scans[i + 1].overall_score ?? 0)
        : null,
  }))

  // ── Period selector state ─────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState('All')
  const periodOptions = ['All', '30d', '7d']

  // ── Last scanned label ────────────────────────────────────────────────────
  const lastScannedLabel = latestScan
    ? formatDistanceToNow(new Date(latestScan.created_at), { addSuffix: true })
    : null

  return (
    <div className="space-y-5">

      {/* ── Row 1: Page header ──────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Rankings &amp; Visibility
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track how your business appears across AI search engines.
        </p>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!hasData && (
        <div className="animate-fade-up [animation-delay:80ms]">
          <Card className="rounded-[20px] shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <EmptyState
                icon={ScanSearch}
                title="No rankings data yet"
                description="Run your first scan to see your AI visibility score across ChatGPT, Gemini, Perplexity, and more."
                action={{
                  label: 'Run your first scan',
                  onClick: () => { window.location.href = '/scan' },
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Row 2: Hero Section ──────────────────────────────────────────────── */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-up [animation-delay:80ms]">

          {/* LEFT col-span-4: Large Visibility Score */}
          <Card className="lg:col-span-4 rounded-[20px] shadow-[var(--shadow-card)]">
            <CardContent className="p-6 flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between">
                <span className="section-eyebrow">Visibility Score</span>
                {scoreTrend !== null && (
                  <TrendBadge value={scoreTrend} suffix=" pts" size="sm" />
                )}
              </div>

              <div className="flex flex-col items-center gap-3 py-4">
                <ScoreRing score={scoreVal} size="lg" showLabel={false} animate />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                </div>
              </div>

              {lastScannedLabel && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Last scanned {lastScannedLabel}</span>
                </div>
              )}

              <Button asChild size="sm" className="w-full rounded-lg bg-primary text-white hover:bg-primary/90 btn-primary-lift">
                <Link href="/scan">
                  <Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Rescan Now
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* CENTER col-span-4: Engines Mentioning + Average Position */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Engines Mentioning */}
            <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-primary/90 to-primary p-5 text-white shadow-[var(--shadow-card)] flex-1">
              <BarChart3 className="absolute right-4 top-4 h-10 w-10 opacity-20" aria-hidden="true" />
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                  Engines Mentioning
                </span>
                <div className="flex items-end gap-2">
                  <span className="metric-value text-5xl font-bold text-white leading-none">
                    {mentionedEngines.length}
                  </span>
                  <span className="text-xl font-medium text-white/60 pb-0.5">
                    / {latestDetails.length}
                  </span>
                </div>
                {mentionedEngineLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {mentionedEngineLabels.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                {mentionedEngineLabels.length === 0 && (
                  <p className="text-sm text-white/60">No engines mention you yet</p>
                )}
              </div>
            </div>

            {/* Average Position */}
            <Card className="rounded-[20px] shadow-[var(--shadow-card)] flex-1">
              <CardContent className="p-5 flex flex-col gap-2">
                <span className="section-eyebrow">Average Position</span>
                <div className="flex items-end gap-2">
                  <span className="metric-value text-5xl font-bold text-foreground leading-none">
                    {avgPosition !== null ? `#${avgPosition}` : '—'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {avgPosition !== null
                    ? `Across ${mentionedEngines.filter((e) => e.rank_position !== null).length} engines`
                    : 'No position data available'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT col-span-4: Sentiment Gauge */}
          <Card className="lg:col-span-4 rounded-[20px] shadow-[var(--shadow-card)]">
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

              <div className="flex flex-col items-center gap-1">
                <ScoreRing
                  score={positivePct}
                  size="md"
                  showLabel={false}
                  animate
                />
                <span className="text-sm font-semibold text-foreground">{positivePct}%</span>
                <span className="text-xs text-muted-foreground">Positive sentiment</span>
              </div>

              <div className="w-full flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    Positive
                  </span>
                  <span className="tabular-nums font-medium">{positiveCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden="true" />
                    Neutral
                  </span>
                  <span className="tabular-nums font-medium">{neutralCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
                    Negative
                  </span>
                  <span className="tabular-nums font-medium">{negativeCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Row 3: Engine Performance ────────────────────────────────────────── */}
      {hasData && (
        <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:160ms]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Performance by Engine</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {latestDetails.length} engines scanned
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-lg border-border">
                <Link href="/scan">
                  <ScanSearch className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Rescan
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5 pt-0">
            {latestDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No engine data available. Run a scan to see detailed results.
              </p>
            ) : (
              <>
                {/* Column headers */}
                <div className="flex items-center gap-4 pb-2 border-b border-border/60">
                  <div className="w-32 shrink-0">
                    <span className="section-eyebrow">Engine</span>
                  </div>
                  <div className="w-28 shrink-0">
                    <span className="section-eyebrow">Status</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="section-eyebrow">Score bar</span>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <span className="section-eyebrow">Sentiment</span>
                  </div>
                  <div className="w-10 shrink-0 text-right">
                    <span className="section-eyebrow">Pos.</span>
                  </div>
                </div>

                {/* Animated bars */}
                <div aria-label="Engine performance scores">
                  {engineRows.map((row, i) => (
                    <EnginePerformanceBar
                      key={row.id}
                      engine={row.engine}
                      label={row.label}
                      isMentioned={row.is_mentioned}
                      rankPosition={row.rank_position}
                      sentiment={row.sentiment}
                      color={getEngineBarColor(row.engine)}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Row 4: Two charts (grid-cols-2) ─────────────────────────────────── */}
      {hasData && scans.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up [animation-delay:240ms]">

          {/* Left: Visibility Trend area chart */}
          <ChartCard
            title="Visibility Trend"
            subtitle={`${scans.length} scans tracked`}
            period={chartPeriod}
            periods={periodOptions}
            onPeriodChange={setChartPeriod}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={CHART_MARGINS.default}>
                <defs>
                  <linearGradient id="rankScoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_COLORS.primary} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...DEFAULT_GRID_PROPS} />
                <XAxis dataKey="date" {...DEFAULT_XAXIS_PROPS} />
                <YAxis {...DEFAULT_YAXIS_PROPS} domain={[0, 100]} />
                <ChartTooltip valueFormatter={(v) => `${v}/100`} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#rankScoreGradient)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  animationDuration={CHART_ANIMATION.duration}
                  animationEasing={CHART_ANIMATION.easing}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Right: Mention Breakdown donut */}
          <ChartCard
            title="Mention Breakdown"
            subtitle="Mentioned vs. not mentioned per engine"
          >
            <div className="flex items-center justify-center gap-8 h-[220px]">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationBegin={200}
                    animationDuration={CHART_ANIMATION.duration}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 shrink-0" aria-hidden="true" />
                    Mentioned
                  </span>
                  <span className="metric-value text-2xl font-bold text-foreground pl-4">
                    {mentionedCount}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm bg-gray-200 shrink-0" aria-hidden="true" />
                    Not mentioned
                  </span>
                  <span className="metric-value text-2xl font-bold text-foreground pl-4">
                    {notMentionedCount}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Row 5: Tracked Queries ───────────────────────────────────────────── */}
      {hasData && (
        <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:320ms]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" aria-hidden="true" />
                  Tracked Queries
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {queryRows.length} {queryRows.length === 1 ? 'query' : 'queries'} tracked
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            {queryRows.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No tracked queries yet.</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Queries are created automatically when you run scans.
                </p>
              </div>
            ) : (
              <DataTable
                columns={queryColumns}
                data={queryRows}
                emptyMessage="No queries tracked yet."
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Row 6: Scan History ──────────────────────────────────────────────── */}
      {hasData && (
        <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:400ms]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                  Scan History
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last {Math.min(scans.length, 10)} scans
                </p>
              </div>
              <Link
                href="/dashboard/rankings"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            {scanHistoryRows.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">No scan history yet.</p>
              </div>
            ) : (
              <DataTable
                columns={scanHistoryColumns}
                data={scanHistoryRows}
                emptyMessage="No scan history available."
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
