'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  Bot,
  ChevronRight,
  ArrowUpRight,
  Radio,
  BarChart3,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { VisibilityTrendChart } from './charts/visibility-trend-chart'

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, string> = {
  content_writer: 'Content Writer',
  blog_writer: 'Blog Writer',
  review_analyzer: 'Review Analyzer',
  schema_optimizer: 'Schema Optimizer',
  recommendations: 'Recommendations',
  social_strategy: 'Social Strategy',
  competitor_intelligence: 'Competitor Intel',
  faq_agent: 'FAQ Agent',
  initial_analysis: 'Initial Analysis',
  free_scan: 'Free Scan',
}

const MOCK_COMPETITORS = [
  { name: 'Clay', score: 72, position: 1 },
  { name: 'Ramotion', score: 61, position: 2 },
  { name: 'Cieden', score: 44, position: 4 },
  { name: 'Frog Design', score: 38, position: 5 },
] as const

const DEMO_SCAN_HISTORY = [
  { created_at: '2026-03-01', overall_score: 42, mentions_count: 8, avg_position: 4.2, sentiment_positive_pct: 55 },
  { created_at: '2026-03-05', overall_score: 48, mentions_count: 12, avg_position: 3.8, sentiment_positive_pct: 62 },
  { created_at: '2026-03-10', overall_score: 55, mentions_count: 15, avg_position: 3.5, sentiment_positive_pct: 68 },
  { created_at: '2026-03-15', overall_score: 52, mentions_count: 14, avg_position: 3.6, sentiment_positive_pct: 65 },
  { created_at: '2026-03-20', overall_score: 61, mentions_count: 18, avg_position: 3.2, sentiment_positive_pct: 71 },
  { created_at: '2026-03-25', overall_score: 67, mentions_count: 22, avg_position: 2.9, sentiment_positive_pct: 75 },
  { created_at: '2026-03-28', overall_score: 72, mentions_count: 26, avg_position: 2.7, sentiment_positive_pct: 78 },
  { created_at: '2026-03-30', overall_score: 75, mentions_count: 28, avg_position: 2.5, sentiment_positive_pct: 81 },
]

const ENGINE_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  'google ai': 'Google AI',
  grok: 'Grok',
  'you.com': 'You.com',
  ChatGPT: 'ChatGPT',
  Gemini: 'Gemini',
  Perplexity: 'Perplexity',
  Claude: 'Claude',
  'Google AI': 'Google AI',
  Grok: 'Grok',
  'You.com': 'You.com',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-[#06B6D4]'
  if (score >= 50) return 'text-[#10B981]'
  if (score >= 25) return 'text-[#F59E0B]'
  return 'text-[#EF4444]'
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-cyan-50 dark:bg-cyan-950/30'
  if (score >= 50) return 'bg-emerald-50 dark:bg-emerald-950/30'
  if (score >= 25) return 'bg-amber-50 dark:bg-amber-950/30'
  return 'bg-red-50 dark:bg-red-950/30'
}

function getSentimentDot(sentiment: string | null): string {
  if (sentiment === 'positive') return 'bg-emerald-500'
  if (sentiment === 'negative') return 'bg-red-500'
  return 'bg-gray-300 dark:bg-gray-600'
}

function getStatusColor(status: string): string {
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'running' || status === 'in_progress') return 'bg-[#3370FF]'
  if (status === 'failed') return 'bg-red-500'
  return 'bg-gray-300 dark:bg-gray-600'
}

// ─── Inline Sparkline (SVG — no dependencies) ────────────────────────────────

function MiniSparkline({
  data,
  color = '#3370FF',
  width = 80,
  height = 32,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
  usedCredits?: number
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
  demoMode?: boolean
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview(props: DashboardOverviewProps) {
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Determine demo mode
  const demoMode = props.demoMode ?? (props.recentScans?.length === 0)

  // Use demo or real data for charts
  const scanHistory = demoMode
    ? DEMO_SCAN_HISTORY
    : props.recentScans
        .map((s) => ({
          created_at: s.created_at,
          overall_score: s.overall_score ?? 0,
          mentions_count: s.mentions_count,
          avg_position: null as number | null,
          sentiment_positive_pct: null as number | null,
        }))
        .reverse()

  // Sparkline data
  const scoreSparkData = scanHistory.slice(-8).map((s) => s.overall_score ?? 0)
  const mentionSparkData = scanHistory.slice(-8).map((s) => s.mentions_count)

  // Computed values
  const userScore = props.score ?? (demoMode ? 75 : 0)
  const displayScore = demoMode ? 75 : userScore
  const scoreDelta = demoMode ? 3 : props.scoreDelta
  const mentionDelta = demoMode ? 2 : props.mentionDelta
  const displayMentionCount = demoMode ? 28 : props.mentionCount
  const enginesMentioning = props.enginesMentioning ?? (demoMode ? 3 : 0)
  const totalEngines = props.totalEngines ?? (demoMode ? 3 : 3)
  const creditsUsed = props.usedCredits ?? 0
  const creditsRemaining = props.totalCredits
  const creditsPercent = props.monthlyCredits > 0 ? Math.round((creditsUsed / props.monthlyCredits) * 100) : 0

  // Engine results for breakdown
  const engineResults = props.engineResults ?? []
  const demoEngineResults = demoMode
    ? [
        { engine: 'ChatGPT', is_mentioned: true, rank_position: 3, sentiment: 'positive' as string | null },
        { engine: 'Gemini', is_mentioned: true, rank_position: 5, sentiment: 'neutral' as string | null },
        { engine: 'Perplexity', is_mentioned: true, rank_position: 2, sentiment: 'positive' as string | null },
      ]
    : engineResults

  // Recommendations
  const recommendations = props.recommendations

  // Recent agent activity
  const recentAgents = props.recentAgents.slice(0, 5)

  // Competitor ranking rows
  const competitorsAbove = MOCK_COMPETITORS.filter((c) => c.score > userScore).length
  const marketPosition = competitorsAbove + 1

  // Last scanned display
  const lastScannedText = props.lastScanned
    ? formatDistanceToNow(new Date(props.lastScanned), { addSuffix: true })
    : 'never'

  // ─── Empty State ────────────────────────────────────────────────────────────

  const hasNoData = !demoMode && displayScore === 0 && props.recentScans.length === 0

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-medium text-foreground">No scan data yet</h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
          Run your first AI visibility scan to see how your business appears across AI search engines.
        </p>
        <Button asChild className="mt-6 rounded-lg bg-[#3370FF] text-white hover:bg-[#2960DB]">
          <Link href="/dashboard/scan">
            <Radio className="h-4 w-4 mr-2" aria-hidden="true" />
            Run first scan
          </Link>
        </Button>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header Bar ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-medium text-foreground truncate">{props.businessName}</h1>
          {props.businessUrl && (
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">{props.businessUrl}</span>
          )}
          {demoMode && (
            <span className="shrink-0 rounded bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Sample data
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden md:inline">
            <Clock className="h-3 w-3 inline mr-1" aria-hidden="true" />
            Scanned {lastScannedText}
          </span>
          <Button asChild size="sm" className="rounded-lg bg-[#3370FF] text-white hover:bg-[#2960DB] h-8 px-3 text-xs">
            <Link href="/dashboard/scan">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Run Scan
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards (4 across) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AI Visibility Score */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">AI Visibility</span>
            <MiniSparkline data={scoreSparkData} color="#3370FF" width={64} height={24} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
              {displayScore > 0 ? displayScore : '--'}
            </span>
            {displayScore > 0 && (
              <span className="text-sm text-muted-foreground">/100</span>
            )}
          </div>
          {scoreDelta != null && scoreDelta !== 0 && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  scoreDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                )}
              >
                {scoreDelta > 0 ? '+' : ''}{scoreDelta} pts
              </span>
              <span className="text-xs text-muted-foreground">vs last scan</span>
            </div>
          )}
        </div>

        {/* AI Mentions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">AI Mentions</span>
            <MiniSparkline data={mentionSparkData} color="#10B981" width={64} height={24} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
              {displayMentionCount}
            </span>
          </div>
          {mentionDelta != null && mentionDelta !== 0 && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  mentionDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                )}
              >
                {mentionDelta > 0 ? '+' : ''}{mentionDelta}
              </span>
              <span className="text-xs text-muted-foreground">vs last scan</span>
            </div>
          )}
        </div>

        {/* Engines Tracking */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Engines</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
              {enginesMentioning}
            </span>
            <span className="text-sm text-muted-foreground">/ {totalEngines}</span>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[#3370FF] transition-all duration-500"
                style={{ width: totalEngines ? `${(enginesMentioning / totalEngines) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1.5 block">mentioning you</span>
          </div>
        </div>

        {/* Agent Credits */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Agent Credits</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
              {creditsRemaining}
            </span>
            <span className="text-sm text-muted-foreground">remaining</span>
          </div>
          <div className="mt-3">
            <Progress
              value={creditsPercent}
              className="h-1.5 bg-muted [&>div]:bg-[#3370FF]"
              aria-label={`${creditsUsed} of ${props.monthlyCredits} credits used`}
            />
            <span className="text-xs text-muted-foreground mt-1.5 block">
              {creditsUsed} / {props.monthlyCredits} used this month
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex flex-col gap-6">

          {/* Visibility Trend Chart */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Visibility Trend</h3>
              <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setChartRange(range)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                      chartRange === range
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 pb-3 pt-1">
              <VisibilityTrendChart data={scanHistory} />
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Recommended Actions</h3>
              <Link
                href="/dashboard/recommendations"
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                View all
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <div>
              {recommendations.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No pending recommendations</p>
                  <p className="text-xs text-muted-foreground mt-1">Run a scan to get AI-powered suggestions</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recommendations.slice(0, 5).map((rec) => {
                    const priorityColors: Record<string, string> = {
                      critical: 'bg-red-500',
                      high: 'bg-amber-500',
                      medium: 'bg-gray-400 dark:bg-gray-500',
                      low: 'bg-gray-300 dark:bg-gray-600',
                    }
                    return (
                      <div key={rec.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            priorityColors[rec.priority] ?? 'bg-gray-300'
                          )}
                          aria-hidden="true"
                        />
                        <p className="flex-1 text-sm text-foreground truncate">{rec.title}</p>
                        {rec.credits_cost != null && (
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                            {rec.credits_cost} cr
                          </span>
                        )}
                        {rec.suggested_agent && (
                          <Link
                            href="/dashboard/agents"
                            className="shrink-0 text-xs font-medium text-[#3370FF] hover:text-[#2960DB] transition-colors"
                          >
                            Run Agent
                            <ChevronRight className="h-3 w-3 inline ml-0.5" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="flex flex-col gap-6">

          {/* Engine Breakdown */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Engine Breakdown</h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {enginesMentioning}/{totalEngines}
              </span>
            </div>
            <div className="divide-y divide-border">
              {demoEngineResults.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No engine data</p>
                </div>
              ) : (
                demoEngineResults.map((engine) => (
                  <div key={engine.engine} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {ENGINE_NAMES[engine.engine] ?? engine.engine}
                    </span>
                    {/* Mentioned indicator */}
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        engine.is_mentioned ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                      aria-label={engine.is_mentioned ? 'Mentioned' : 'Not mentioned'}
                    />
                    {/* Rank */}
                    <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                      {engine.is_mentioned && engine.rank_position != null
                        ? `#${engine.rank_position}`
                        : '\u2014'}
                    </span>
                    {/* Sentiment dot */}
                    <span
                      className={cn('h-2 w-2 rounded-full shrink-0', getSentimentDot(engine.sentiment))}
                      aria-label={`Sentiment: ${engine.sentiment ?? 'unknown'}`}
                    />
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <Link
                href="/dashboard/engines"
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                Full engine report
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Recent Agent Activity */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
              <Link
                href="/dashboard/agents"
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                All agents
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <div>
              {recentAgents.length === 0 ? (
                <div className="py-8 text-center px-5">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
                    <Bot className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">No agent activity yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Run an agent from recommendations above
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3 px-5 py-3">
                      <span
                        className={cn('h-1.5 w-1.5 rounded-full shrink-0', getStatusColor(agent.status))}
                        aria-label={`Status: ${agent.status}`}
                      />
                      <span className="flex-1 text-sm text-foreground truncate">
                        {AGENT_LABELS[agent.agent_type] ?? agent.agent_type}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {agent.credits_cost} cr
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {format(new Date(agent.created_at), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {recentAgents.length > 0 && (
              <div className="px-5 py-3 border-t border-border">
                <Link
                  href="/dashboard/agents"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-muted/50 hover:bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors"
                >
                  <Zap className="h-3.5 w-3.5 text-[#3370FF]" aria-hidden="true" />
                  Run AI Agent
                </Link>
              </div>
            )}
          </div>

          {/* Industry Position (compact) */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Industry Position</h3>
              <span className={cn('text-xs font-medium tabular-nums px-2 py-0.5 rounded-md', getScoreBg(displayScore), getScoreColor(displayScore))}>
                #{marketPosition}
              </span>
            </div>
            <div className="divide-y divide-border">
              {[
                {
                  position: marketPosition,
                  name: props.businessName || 'You',
                  score: displayScore,
                  isUser: true,
                },
                ...MOCK_COMPETITORS.map((c) => ({
                  position: c.position >= marketPosition ? c.position + 1 : c.position,
                  name: c.name,
                  score: c.score,
                  isUser: false,
                })),
              ]
                .sort((a, b) => a.position - b.position)
                .slice(0, 5)
                .map((row) => (
                  <div
                    key={row.name}
                    className={cn(
                      'flex items-center gap-3 px-5 py-2.5',
                      row.isUser && 'bg-[#3370FF]/[0.04] dark:bg-[#3370FF]/[0.08]'
                    )}
                  >
                    <span className="text-xs tabular-nums text-muted-foreground w-4">{row.position}</span>
                    <span
                      className={cn(
                        'flex-1 text-sm truncate',
                        row.isUser ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {row.name}
                      {row.isUser && (
                        <span className="ml-1.5 text-[10px] font-medium text-[#3370FF] bg-[#3370FF]/10 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </span>
                    {/* Score bar */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            row.isUser ? 'bg-[#3370FF]' : 'bg-gray-300 dark:bg-gray-600'
                          )}
                          style={{ width: `${row.score}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">
                        {row.score}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <Link
                href="/dashboard/rankings"
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                Full rankings
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
