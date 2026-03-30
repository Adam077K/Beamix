'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  Bot,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Trophy,
  Cpu,
  Activity,
  TrendingUp,
  Calendar,
  Globe,
  MapPin,
  Tag,
} from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatusDot, type StatusDotStatus } from '@/components/ui/status-dot'
import { TrendBadge } from '@/components/ui/trend-badge'
import { DataTable } from '@/components/ui/data-table'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { VisibilityTrendChart } from './charts/visibility-trend-chart'
import { EngineDonutChart } from './charts/engine-donut-chart'
import { CompetitorBarChart } from './charts/competitor-bar-chart'

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

const MOCK_COMPETITORS = [
  { name: 'Competitor A', score: 72, position: 1 },
  { name: 'Competitor B', score: 61, position: 2 },
  { name: 'Competitor C', score: 44, position: 4 },
  { name: 'Competitor D', score: 38, position: 5 },
] as const

// Demo scan history for empty-state sparklines / charts
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Tab types ────────────────────────────────────────────────────────────────

type DashboardTab = 'overview' | 'rankings' | 'engines' | 'activity'

const TABS: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'rankings', label: 'Rankings', icon: Trophy },
  { id: 'engines', label: 'Engines', icon: Cpu },
  { id: 'activity', label: 'Activity', icon: Activity },
]

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

// ─── Row types ────────────────────────────────────────────────────────────────

interface ActivityRow {
  id: string
  agent_type: string
  status: string
  credits_cost: number
  created_at: string
}

interface RankingRow {
  position: number
  name: string
  score: string
  numericScore: number
  sentiment?: number
  positionDelta?: number
  isUser?: boolean
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  props: DashboardOverviewProps
  demoMode: boolean
  scanHistory: Array<{
    created_at: string
    overall_score: number
    mentions_count: number
    avg_position: number | null
    sentiment_positive_pct: number | null
  }>
  positivePct: number
  userScore: number
  recommendations: DashboardOverviewProps['recommendations']
}

function FilterButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
      <ChevronDown className="h-3 w-3 opacity-50" aria-hidden="true" />
    </button>
  )
}

function OverviewTab({
  props,
  demoMode,
  scanHistory,
  positivePct,
  userScore,
  recommendations,
}: OverviewTabProps) {
  const creditsUsed = props.usedCredits ?? 0
  const creditsPercent = props.monthlyCredits > 0 ? Math.round((creditsUsed / props.monthlyCredits) * 100) : 0

  // Build engine donut data
  const engineDonutData = (props.engineResults ?? [])
    .filter((r) => r.is_mentioned)
    .map((r) => ({ engine: r.engine, mentions: 1 }))

  if (engineDonutData.length === 0 && demoMode) {
    engineDonutData.push(
      { engine: 'ChatGPT', mentions: 8 },
      { engine: 'Gemini', mentions: 5 },
      { engine: 'Perplexity', mentions: 7 },
      { engine: 'Google AI', mentions: 3 },
    )
  }

  // Build competitor bar data
  const userCompetitorRow = {
    name: props.businessName || 'You',
    score: userScore,
    isUser: true,
  }
  const competitorBarData = [
    userCompetitorRow,
    ...MOCK_COMPETITORS.map((c) => ({ name: c.name, score: c.score })),
  ]

  // Score delta from last scan — use demo delta if in demo mode
  const scoreDelta = demoMode ? 3 : props.scoreDelta
  const mentionDelta = demoMode ? 2 : props.mentionDelta

  // Compute market position for grouped stat card
  const competitorsAbove = MOCK_COMPETITORS.filter((c) => c.score > userScore).length
  const marketPosition = competitorsAbove + 1
  const enginesMentioning = props.enginesMentioning ?? (demoMode ? 3 : 0)
  const totalEngines = props.totalEngines ?? (demoMode ? 3 : 3)
  const displayScore = demoMode ? 75 : userScore
  const displayMentionCount = demoMode ? 28 : props.mentionCount
  const displayPositivePct = demoMode ? 81 : positivePct

  // Ranking rows for inline table
  const rankingRows: RankingRow[] = [
    {
      position: marketPosition,
      name: props.businessName || 'You',
      score: displayScore > 0 ? `${displayScore}` : '--',
      numericScore: displayScore,
      sentiment: demoMode ? 81 : undefined,
      positionDelta: demoMode ? 1 : undefined,
      isUser: true,
    },
    ...MOCK_COMPETITORS.map((comp, i) => {
      const rank = i + 1 >= marketPosition ? i + 2 : i + 1
      return {
        position: rank,
        name: comp.name,
        score: `${comp.score}`,
        numericScore: comp.score,
        sentiment: 60 - i * 5,
        positionDelta: undefined,
        isUser: false,
      }
    }),
  ].sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-5">
      {/* ── AI Visibility Score hero header ─── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-base font-semibold text-slate-900">AI visibility score</h3>
          <p className="text-xs text-slate-500 mt-0.5">Performance over time across all AI engines</p>
        </div>
        <div className="flex items-center gap-2">
          {demoMode && (
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
              Sample data
            </Badge>
          )}
          <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{displayScore}%</span>
          {scoreDelta != null && (
            <span className={cn('text-sm font-semibold tabular-nums', scoreDelta >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {scoreDelta >= 0 ? '↑' : '↓'} {Math.abs(scoreDelta)}
            </span>
          )}
        </div>
      </div>

      {/* ── Row 2: 65/35 — trend chart + ranking table ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
        {/* Left: Visibility trend chart */}
        <Card className="rounded-xl border border-slate-200 shadow-none min-w-0">
          <CardContent className="px-3 pb-2 pt-3">
            <VisibilityTrendChart data={scanHistory} />
          </CardContent>
        </Card>

        {/* Right: Industry ranking table — Wavespace style */}
        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
          <div className="flex items-start justify-between px-4 pt-4 pb-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Industry Ranking</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Brands with highest visibility</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{displayScore > 0 ? `${(displayScore * 0.4).toFixed(1)}%` : '--'}</span>
              <p className="text-[10px] text-slate-400">Avg. visibility 7d</p>
            </div>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-[18px_1fr_52px_36px_44px_48px] gap-1 px-4 py-1.5 border-y border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">#</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Brand</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Mentions</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Pos</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Change</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Visibility</span>
          </div>
          {/* Table rows */}
          <div className="flex flex-col">
            {rankingRows.map((row) => {
              const mentionMap: Record<number, number> = { 72: 142, 61: 139, 44: 164, 38: 98 }
              const changeMap: Record<number, number> = { 72: -2.6, 61: -1.4, 44: 3.3, 38: 3.3 }
              const demoMentions = row.isUser ? 534 : (mentionMap[row.numericScore] ?? row.numericScore * 2)
              const demoChange = row.isUser ? -3.3 : (changeMap[row.numericScore] ?? 0)
              const demoVisibility = (row.numericScore * 0.42).toFixed(1)
              const brandColors = ['bg-[#3370FF]', 'bg-slate-800', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500']
              const colorIdx = rankingRows.indexOf(row)
              return (
                <div
                  key={row.name}
                  className={cn(
                    'grid grid-cols-[18px_1fr_52px_36px_44px_48px] gap-1 items-center px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0',
                    row.isUser && 'bg-blue-50/30 dark:bg-blue-950/20'
                  )}
                >
                  <span className="text-[11px] text-slate-400 tabular-nums">{row.position}</span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className={cn('h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0', brandColors[colorIdx % brandColors.length])}>
                      {row.name.charAt(0)}
                    </span>
                    <span className={cn('text-[11px] truncate', row.isUser ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>
                      {row.name}
                    </span>
                    {row.isUser && (
                      <span className="shrink-0 rounded bg-slate-100 dark:bg-slate-800 px-1 py-0 text-[9px] font-semibold text-slate-500">You</span>
                    )}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 text-right">{demoMentions}</span>
                  <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 text-right">{(row.position + 2.5).toFixed(1)}</span>
                  <span className={cn('text-[11px] tabular-nums text-right font-medium', demoChange > 0 ? 'text-emerald-500' : 'text-red-500')}>
                    {demoChange > 0 ? '+' : ''}{demoChange}%
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-900 dark:text-white text-right font-medium">{demoVisibility}%</span>
                </div>
              )
            })}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/dashboard?tab=rankings"
              className="text-[11px] font-medium text-[#3370FF] hover:underline flex items-center gap-0.5"
            >
              View full rankings <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Performance stat cards ─── */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Performance</h2>
        <p className="text-xs text-slate-500 mt-0.5">Track brand performance with AI insights and metrics</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Brand Presence */}
          <div className="px-5 py-4">
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Brand presence</span>
            <div className="grid grid-cols-2 gap-6 mt-3">
              <div>
                <span className="text-[11px] text-slate-400">Visibility</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{displayScore > 0 ? `${displayScore}%` : '--'}</span>
                  {scoreDelta != null && (
                    <span className={cn('text-xs font-semibold tabular-nums flex items-center gap-0.5', scoreDelta >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                      {scoreDelta >= 0 ? '↑' : '↓'} {Math.abs(scoreDelta)}%
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Answers mentioning me</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{displayMentionCount.toLocaleString()}</span>
                  {mentionDelta != null && (
                    <span className={cn('text-xs font-semibold tabular-nums flex items-center gap-0.5', mentionDelta >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                      {mentionDelta >= 0 ? '↑' : '↓'} {Math.abs(mentionDelta)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Citations */}
          <div className="px-5 py-4">
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Citations</span>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <span className="text-[11px] text-slate-400">Total pages cited</span>
                <div className="mt-1">
                  <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{(props.contentStats?.total ?? (demoMode ? 14808 : 0)).toLocaleString()}</span>
                  {demoMode && <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 2,479</div>}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">My pages cited</span>
                <div className="mt-1">
                  <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{demoMode ? 156 : enginesMentioning}</span>
                  {demoMode && <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 18</div>}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Pages mentioned</span>
                <div className="mt-1">
                  <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{demoMode ? '1,068' : displayPositivePct}</span>
                  {demoMode && <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 372</div>}
                </div>
              </div>
            </div>
          </div>
          {/* Competitor Analysis */}
          <div className="px-5 py-4">
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Competitor Analysis</span>
            <div className="grid grid-cols-2 gap-6 mt-3">
              <div>
                <span className="text-[11px] text-slate-400">Market share</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">14%</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Market position</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">#{marketPosition}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Recommended Actions + Engine Mentions donut ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
        {/* Left: Recommended Actions */}
        <Card className="rounded-xl border border-slate-200 shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">Recommended Actions</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">AI-prioritized fixes to boost your visibility</p>
              </div>
              <Link
                href="/dashboard/recommendations"
                className="text-xs font-medium text-[#3370FF] hover:underline flex items-center gap-0.5 shrink-0"
              >
                View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-0 flex flex-col gap-0">
            {recommendations.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/60" aria-hidden="true" />
                <p className="text-sm text-slate-500">All caught up!</p>
              </div>
            ) : (
              recommendations.slice(0, 4).map((rec, i) => {
                const isTop = i === 0
                const priorityStatus = getPriorityStatus(rec.priority)
                const priorityColors: Record<string, string> = {
                  critical: 'bg-red-500',
                  high: 'bg-amber-500',
                  medium: 'bg-slate-300',
                  low: 'bg-slate-200',
                }
                const dotColor = priorityColors[rec.priority] ?? 'bg-slate-300'
                return (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
                  >
                    <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', dotColor)} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium text-slate-900 leading-snug', isTop ? 'text-sm' : 'text-xs')}>
                        {rec.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-snug line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                    {rec.suggested_agent && (
                      <Link
                        href="/dashboard/agents"
                        className="shrink-0 flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#3370FF] hover:bg-blue-100 transition-colors whitespace-nowrap dark:bg-blue-950/30 dark:text-blue-400"
                      >
                        Fix <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Right: Engine Mentions donut */}
        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 pt-4 pb-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Engine Mentions</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Which AI engines mention your brand</p>
          </div>
          <div className="px-4 pb-4">
            <EngineDonutChart data={engineDonutData} />
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <Link
              href="/dashboard/agents"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#2B5FDB] hover:bg-blue-100 transition-colors dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
            >
              <Zap className="h-3.5 w-3.5" />
              Run AI agent
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Rankings Tab ─────────────────────────────────────────────────────────────

function RankingsTab({
  businessName,
  userScore,
  demoMode,
}: {
  businessName: string
  userScore: number
  demoMode: boolean
}) {
  const competitorsAbove = MOCK_COMPETITORS.filter((c) => c.score > userScore).length
  const marketPosition = competitorsAbove + 1

  const rankingRows: RankingRow[] = [
    {
      position: marketPosition,
      name: businessName || 'You',
      score: userScore > 0 ? `${userScore}` : '--',
      numericScore: userScore,
      sentiment: demoMode ? 81 : undefined,
      positionDelta: demoMode ? 1 : undefined,
      isUser: true,
    },
    ...MOCK_COMPETITORS.map((comp, i) => {
      const rank = i + 1 >= marketPosition ? i + 2 : i + 1
      return {
        position: rank,
        name: comp.name,
        score: `${comp.score}`,
        numericScore: comp.score,
        sentiment: 60 - i * 5,
        positionDelta: undefined,
        isUser: false,
      }
    }),
  ].sort((a, b) => a.position - b.position)

  const rankingColumns: ColumnDef<RankingRow>[] = [
    {
      header: '#',
      accessorKey: 'position',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-muted-foreground text-xs w-6 inline-block text-center">
          {row.original.position}
        </span>
      ),
    },
    {
      header: 'Brand',
      accessorKey: 'name',
      cell: ({ row }) =>
        row.original.isUser ? (
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
            <Badge className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0 text-[10px] font-semibold text-[#2B5FDB] border-0 dark:bg-blue-950/50 dark:text-blue-300">
              You
            </Badge>
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">{row.original.name}</span>
        ),
    },
    {
      header: 'Visibility',
      accessorKey: 'numericScore',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-20 h-1.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-[#3370FF]"
              style={{ width: `${row.original.numericScore}%` }}
            />
          </div>
          <span className="w-8 text-right font-medium tabular-nums text-foreground text-xs">
            {row.original.numericScore}
          </span>
        </div>
      ),
    },
    {
      header: 'Sentiment',
      accessorKey: 'sentiment',
      meta: { align: 'right' },
      cell: ({ row }) => {
        const val = row.original.sentiment
        if (val == null) return <span className="text-xs text-muted-foreground">—</span>
        const color = val >= 70 ? 'text-emerald-600' : val >= 50 ? 'text-amber-600' : 'text-red-500'
        return <span className={cn('text-xs font-medium tabular-nums', color)}>{val}%</span>
      },
    },
    {
      header: 'Position',
      accessorKey: 'position',
      id: 'position_delta',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-xs font-medium tabular-nums text-foreground">
            #{row.original.position}
          </span>
          {row.original.positionDelta != null && row.original.positionDelta !== 0 && (
            <TrendBadge value={-row.original.positionDelta} size="sm" />
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="rounded-lg shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Industry Rankings</CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
              vs. competitors
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Based on estimated data. Add real competitors via Competitor Intelligence.
          </p>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          <DataTable
            columns={rankingColumns}
            data={rankingRows}
            highlightRow={(row) => row.isUser === true}
            emptyMessage="Run a scan to unlock ranking data."
          />
        </CardContent>
      </Card>

      {/* CTA to unlock real data */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/20">
        <TrendingUp className="h-4 w-4 text-[#3370FF] dark:text-blue-400 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-300 flex-1">
          Run Competitor Intelligence to unlock real ranking data from AI engines.
        </p>
        <Button
          asChild
          size="sm"
          className="rounded-lg bg-[#3370FF] text-white hover:bg-[#2B5FDB] shrink-0"
        >
          <Link href="/dashboard/agents">
            <Zap className="h-3.5 w-3.5 mr-1.5" />Run Agent
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Engines Tab ──────────────────────────────────────────────────────────────

function EnginesTab({
  engineResults,
  totalEngines,
}: {
  engineResults: DashboardOverviewProps['engineResults']
  totalEngines: number | null | undefined
}) {
  const ENGINE_LIST = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google AI', 'Grok', 'You.com']
  const engineMap = new Map((engineResults ?? []).map((r) => [r.engine, r]))
  const activeEngines = ENGINE_LIST.slice(0, totalEngines ?? 3)

  const getSentimentColor = (sentiment: string | null): string => {
    if (sentiment === 'positive') return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
    if (sentiment === 'negative') return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400'
    return 'text-muted-foreground bg-muted border-border'
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-lg shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Engine Performance</CardTitle>
            <span className="text-xs text-muted-foreground">
              {(engineResults ?? []).filter((r) => r.is_mentioned).length} of {activeEngines.length} mentioning you
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5 pt-0">
          <div className="divide-y divide-border/40">
            {activeEngines.map((engineName) => {
              const data = engineMap.get(engineName)
              const isMentioned = data?.is_mentioned ?? false
              const rank = data?.rank_position ?? null
              const sentiment = data?.sentiment ?? null

              return (
                <div key={engineName} className="flex items-center justify-between gap-4 py-3.5">
                  {/* Engine name */}
                  <span className="w-28 shrink-0 text-sm font-medium text-foreground">{engineName}</span>

                  {/* Mention status chip */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                      isMentioned
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
                        : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400'
                    )}
                  >
                    <span
                      className={cn('h-1.5 w-1.5 rounded-full', isMentioned ? 'bg-emerald-500' : 'bg-red-400')}
                      aria-hidden="true"
                    />
                    {isMentioned ? 'Mentioned' : 'Not mentioned'}
                  </span>

                  {/* Rank position */}
                  <span className="w-8 text-sm tabular-nums font-medium text-muted-foreground text-center">
                    {isMentioned && rank != null ? `#${rank}` : '—'}
                  </span>

                  {/* Sentiment badge */}
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border capitalize',
                      getSentimentColor(sentiment)
                    )}
                  >
                    {sentiment ?? 'N/A'}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({
  recentAgents,
  usedCredits,
  monthlyCredits,
  totalCredits,
}: {
  recentAgents: DashboardOverviewProps['recentAgents']
  usedCredits: number
  monthlyCredits: number
  totalCredits: number
}) {
  const [activitySearch, setActivitySearch] = useState('')
  const creditsUsed = usedCredits
  const creditsPercent = monthlyCredits > 0 ? Math.round((creditsUsed / monthlyCredits) * 100) : 0

  const activityRows: ActivityRow[] = recentAgents.slice(0, 20)
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
      cell: () => (
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

  return (
    <div className="space-y-4">
      {/* Recent activity */}
      <Card className="rounded-lg shadow-[var(--shadow-card)]">
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
              <p className="text-xs text-muted-foreground mt-0.5">
                Run your first agent to see results here.
              </p>
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

      {/* Credit usage breakdown */}
      <Card className="rounded-lg shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">AI Run Usage</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground tabular-nums">
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
            <Progress
              value={creditsPercent}
              className="h-2 bg-blue-100 [&>div]:bg-[#3370FF] dark:bg-blue-950/40 dark:[&>div]:bg-[#3370FF]"
              aria-label={`${creditsUsed} of ${monthlyCredits} AI Runs used`}
            />
            <span className="text-sm text-muted-foreground">
              {creditsUsed} of {monthlyCredits} AI Runs used this month
            </span>
          </div>
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
              <span className="text-xs text-muted-foreground">Monthly cap</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">{monthlyCredits}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview(props: DashboardOverviewProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

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

  // Sparkline data arrays (last 8 points)
  const scoreSparkData = scanHistory.slice(-8).map((s) => s.overall_score ?? 0)
  const mentionSparkData = scanHistory.slice(-8).map((s) => s.mentions_count)
  const sentimentSparkData = scanHistory.slice(-8).map((s) => s.sentiment_positive_pct ?? 0)
  const positionSparkData = scanHistory.slice(-8).map((s) => s.avg_position ?? 0)

  // Sentiment calc
  const positive = props.sentimentSummary?.positive ?? 0
  const neutral = props.sentimentSummary?.neutral ?? 0
  const negative = props.sentimentSummary?.negative ?? 0
  const sentimentTotal = positive + neutral + negative
  const positivePct =
    sentimentTotal > 0 ? Math.round((positive / sentimentTotal) * 100) : demoMode ? 81 : 0

  const userScore = props.score ?? (demoMode ? 75 : 0)
  const creditsUsed = props.usedCredits ?? 0

  return (
    <div className="space-y-5">
      {/* Demo banner */}
      {demoMode && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You&apos;re viewing sample data. Run your first scan to unlock real insights.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-lg bg-[#3370FF] text-white hover:bg-[#2B5FDB] shrink-0"
          >
            <Link href="/dashboard/scan">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Run Scan
            </Link>
          </Button>
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}{props.businessName ? `, ${props.businessName}` : ''}
        </h1>
        <p className="text-xs text-slate-400">
          Last updated {demoMode ? 'just now' : (props.lastScanned ? format(new Date(props.lastScanned), 'MMM d, h:mm a') : 'never')}
        </p>
      </div>

      {/* Tab bar */}
      <div>
        {/* Desktop tabs */}
        <div className="hidden sm:flex items-center gap-0.5 border-b border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors rounded-t-lg -mb-px',
                  activeTab === tab.id
                    ? 'text-[#3370FF] border-b-[3px] border-[#3370FF] dark:text-blue-400 dark:border-blue-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Mobile dropdown */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as DashboardTab)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#3370FF]/50"
          >
            {TABS.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter bar — shown on overview tab */}
      {activeTab === 'overview' && (
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton icon={Calendar} label="Last 30 days" />
          <FilterButton icon={Globe} label="All engines" />
          <FilterButton icon={MapPin} label="All locations" />
          <FilterButton icon={Tag} label="All topics" />
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab
          props={props}
          demoMode={demoMode}
          scanHistory={scanHistory}
          positivePct={positivePct}
          userScore={userScore}
          recommendations={props.recommendations}
        />
      )}
      {activeTab === 'rankings' && (
        <RankingsTab
          businessName={props.businessName}
          userScore={userScore}
          demoMode={demoMode}
        />
      )}
      {activeTab === 'engines' && (
        <EnginesTab
          engineResults={props.engineResults}
          totalEngines={props.totalEngines}
        />
      )}
      {activeTab === 'activity' && (
        <ActivityTab
          recentAgents={props.recentAgents}
          usedCredits={creditsUsed}
          monthlyCredits={props.monthlyCredits}
          totalCredits={props.totalCredits}
        />
      )}
    </div>
  )
}
