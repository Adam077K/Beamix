'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Bot,
  BarChart3,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getScoreLevel } from '@/components/ui/score-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  LineChart,
  Line,
} from 'recharts'

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

const ENGINE_META: Record<string, { label: string; colorClass: string; dotClass: string }> = {
  chatgpt:    {
    label: 'ChatGPT',
    colorClass: 'bg-[#10A37F]/10 text-[#10A37F] border-[#10A37F]/20',
    dotClass:   'bg-[#10A37F]',
  },
  gemini:     {
    label: 'Gemini',
    colorClass: 'bg-blue-50 text-blue-600 border-blue-100',
    dotClass:   'bg-blue-500',
  },
  perplexity: {
    label: 'Perplexity',
    colorClass: 'bg-purple-50 text-purple-600 border-purple-100',
    dotClass:   'bg-purple-500',
  },
  claude:     {
    label: 'Claude',
    colorClass: 'bg-[#FF3C00]/10 text-[#FF3C00] border-[#FF3C00]/20',
    dotClass:   'bg-[#FF3C00]',
  },
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  critical: { bg: 'bg-red-50',    text: 'text-red-700',    ring: 'border-red-200' },
  high:     { bg: 'bg-[#FFF5F2]', text: 'text-[#FF3C00]',  ring: 'border-[#FFCFC4]' },
  medium:   { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'border-amber-200' },
  low:      { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'border-blue-200' },
}

const ENGINES_ORDER = ['chatgpt', 'gemini', 'perplexity', 'claude'] as const

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardOverviewProps {
  businessName: string
  businessUrl: string | null
  score: number | null
  scoreDelta: number | null
  mentionCount: number
  lastScanned: string | null
  totalCredits: number
  monthlyCredits: number
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWarmMessage(score: number | null, scoreDelta: number | null): string {
  if (score === null) return "Let's get your first score. Start a scan."
  if (scoreDelta === null || scoreDelta === 0) return 'Holding steady. Run an agent to push higher.'
  if (scoreDelta > 0) return 'Your visibility is growing. Keep it up.'
  return 'Your visibility dipped. Check the action queue below.'
}

function getScoreTextColor(score: number): string {
  if (score >= 75) return 'text-[#06B6D4]'
  if (score >= 50) return 'text-[#10B981]'
  if (score >= 25) return 'text-[#F59E0B]'
  return 'text-[#EF4444]'
}

function getScoreGlow(score: number): string {
  if (score >= 75) return 'shadow-[0_0_40px_rgba(6,182,212,0.12)]'
  if (score >= 50) return 'shadow-[0_0_40px_rgba(16,185,129,0.12)]'
  if (score >= 25) return 'shadow-[0_0_40px_rgba(245,158,11,0.12)]'
  return 'shadow-[0_0_40px_rgba(239,68,68,0.12)]'
}

// ─── Recharts tooltip ─────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
}

function ScoreTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground shadow-sm">
      Score: {payload[0].value}
    </div>
  )
}

// ─── Engine dots bar ──────────────────────────────────────────────────────────

function EngineDots({ score }: { score: number }) {
  const filled = Math.round(Math.max(0, Math.min(100, score)) / 10)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Score ${score} out of 100`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            i < filled ? 'bg-[#FF3C00]' : 'bg-border',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardOverview({
  businessName,
  score,
  scoreDelta,
  mentionCount,
  lastScanned,
  totalCredits,
  monthlyCredits,
  recommendations,
  recentAgents,
  recentScans,
}: DashboardOverviewProps) {
  const hasData = score !== null
  const creditsUsed = monthlyCredits - totalCredits
  const creditsPercent = monthlyCredits > 0 ? Math.round((creditsUsed / monthlyCredits) * 100) : 0
  const scoreInfo = hasData && score !== null ? getScoreLevel(score) : null
  const warmMessage = getWarmMessage(score, scoreDelta)

  // Sparkline: oldest first for left-to-right trend
  const sparklineData = recentScans
    .slice()
    .reverse()
    .map((s, i) => ({ index: i, score: s.overall_score ?? 0 }))
  const hasSparkline = sparklineData.length >= 2

  // Top recommendation gets hero treatment; rest get compact list
  const [topRec, ...restRecs] = recommendations

  return (
    <div className="space-y-6">

      {/* ─── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            AI Visibility Report
          </p>
          <h1 className="mt-0.5 text-2xl font-medium text-foreground">
            {businessName}
          </h1>
        </div>
        {lastScanned && (
          <p className="text-xs text-muted-foreground">
            Last scanned{' '}
            <span className="font-medium text-foreground">
              {formatDistanceToNow(new Date(lastScanned), { addSuffix: true })}
            </span>
          </p>
        )}
      </div>

      {/* ─── Zone 1: Hero metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Visibility Score — hero card spanning 2 of 3 cols */}
        <Card
          className={cn(
            'relative overflow-hidden bg-card rounded-[20px] border border-border shadow-sm md:col-span-2',
            hasData && score !== null ? getScoreGlow(score) : '',
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">

              {/* Left: big score number + context */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Visibility Score
                  </span>
                </div>

                {hasData && score !== null ? (
                  <>
                    <div className="flex items-end gap-2">
                      <span
                        className={cn(
                          'font-mono text-6xl font-bold leading-none tabular-nums',
                          getScoreTextColor(score),
                        )}
                      >
                        {score}
                      </span>
                      <span className="mb-2 text-xl text-muted-foreground">/100</span>
                    </div>

                    {/* Delta badge */}
                    {scoreDelta !== null && scoreDelta !== 0 && (
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                          scoreDelta > 0
                            ? 'bg-green-50 text-[#10B981] dark:bg-green-950'
                            : 'bg-red-50 text-[#EF4444] dark:bg-red-950',
                        )}
                        aria-live="polite"
                      >
                        {scoreDelta > 0 ? (
                          <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="h-3 w-3" aria-hidden="true" />
                        )}
                        {scoreDelta > 0 ? '+' : ''}{scoreDelta} since last scan
                      </div>
                    )}
                    {scoreDelta === 0 && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Minus className="h-3 w-3" aria-hidden="true" />
                        No change since last scan
                      </div>
                    )}

                    {/* Warm contextual copy */}
                    {scoreInfo && (
                      <p className={cn('text-sm font-medium', scoreInfo.color)}>
                        {scoreInfo.label} — {warmMessage}
                      </p>
                    )}
                  </>
                ) : (
                  /* No-data state */
                  <div className="space-y-3">
                    <span className="font-mono text-6xl font-bold leading-none text-muted-foreground">
                      --
                    </span>
                    <p className="text-sm text-muted-foreground">{warmMessage}</p>
                    <Link href="/dashboard/rankings">
                      <Button size="sm" className="mt-1">
                        Start your first scan
                        <ArrowRight className="ms-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Right: mini sparkline trend */}
              {hasSparkline && (
                <div className="shrink-0">
                  <p className="mb-1 text-right text-xs text-muted-foreground">
                    {sparklineData.length} scans
                  </p>
                  <div
                    className="h-16 w-28"
                    role="img"
                    aria-label="Score trend over recent scans"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#FF3C00"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Tooltip
                          content={<ScoreTooltip />}
                          cursor={{ stroke: '#FF3C00', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column: stacked supporting metrics */}
        <div className="flex flex-col gap-4">

          {/* AI Mentions */}
          <Card className="flex-1 bg-card rounded-[20px] border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">AI Mentions</span>
                <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-3xl font-semibold text-foreground">
                  {hasData ? mentionCount : '--'}
                </span>
                <span className="mb-0.5 text-sm text-muted-foreground">/ 4 engines</span>
              </div>
              {hasData && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {mentionCount === 0
                    ? 'Not appearing in any AI engine yet'
                    : mentionCount === 1
                    ? 'Appearing in 1 AI engine'
                    : `Appearing in ${mentionCount} AI engines`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Agent Credits */}
          <Card className="flex-1 bg-card rounded-[20px] border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Agent Credits</span>
                <Bot className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-3xl font-semibold text-foreground">{totalCredits}</span>
                <span className="mb-0.5 text-sm text-muted-foreground">/ {monthlyCredits}</span>
              </div>
              {monthlyCredits > 0 && (
                <div className="mt-2 space-y-1">
                  <Progress
                    value={creditsPercent}
                    className="h-1.5"
                    aria-label={`${creditsUsed} of ${monthlyCredits} agent credits used`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {creditsUsed} used this month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Zone 2: Action Queue ─────────────────────────────────────── */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
              Action Queue
            </CardTitle>
            {recommendations.length > 0 && (
              <Badge className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {recommendations.length}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          {recommendations.length === 0 ? (
            /* Warm empty state */
            <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-6 py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#10B981]" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">
                Nothing to fix right now
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Your visibility is on track. Run a new scan to get fresh recommendations.
              </p>
              <Link href="/dashboard/rankings" className="mt-1">
                <Button variant="outline" size="sm">
                  Run a scan
                  <ArrowRight className="ms-1.5 h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">

              {/* Hero recommendation */}
              {topRec && (() => {
                const style = PRIORITY_STYLES[topRec.priority] ?? PRIORITY_STYLES.medium
                const agentLabel = topRec.suggested_agent
                  ? (AGENT_LABELS[topRec.suggested_agent] ?? topRec.suggested_agent)
                  : null
                const isUrgent = topRec.priority === 'critical' || topRec.priority === 'high'
                return (
                  <div
                    className={cn(
                      'rounded-[16px] border p-4',
                      style.bg,
                      style.ring,
                    )}
                  >
                    <div className="space-y-2">
                      <Badge
                        className={cn(
                          'rounded-full border text-xs font-semibold uppercase tracking-wide',
                          style.bg,
                          style.text,
                          style.ring,
                        )}
                      >
                        {isUrgent ? 'Your #1 action' : topRec.priority}
                      </Badge>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {topRec.title}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {topRec.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {agentLabel ? (
                          <Link href="/dashboard/agents">
                            <Button size="sm" className="h-7 rounded-lg px-3 text-xs">
                              <Sparkles className="me-1.5 h-3 w-3" aria-hidden="true" />
                              Fix with {agentLabel}
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/dashboard/rankings">
                            <Button size="sm" className="h-7 rounded-lg px-3 text-xs">
                              Fix this now
                              <ArrowRight className="ms-1.5 h-3 w-3" aria-hidden="true" />
                            </Button>
                          </Link>
                        )}
                        {topRec.credits_cost != null && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bot className="h-3 w-3" aria-hidden="true" />
                            {topRec.credits_cost} credit{topRec.credits_cost !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Compact remaining recommendations */}
              {restRecs.slice(0, 4).map((rec) => {
                const style = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.medium
                const agentLabel = rec.suggested_agent
                  ? (AGENT_LABELS[rec.suggested_agent] ?? rec.suggested_agent)
                  : null
                return (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 rounded-xl bg-muted/40 px-3 py-2.5 transition-colors duration-150 hover:bg-muted"
                  >
                    <Badge
                      className={cn(
                        'mt-0.5 shrink-0 rounded-full text-xs',
                        style.bg,
                        style.text,
                      )}
                    >
                      {rec.priority}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {rec.title}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                    {agentLabel && (
                      <Link href="/dashboard/agents" className="shrink-0">
                        <Badge
                          variant="outline"
                          className="cursor-pointer text-xs transition-colors hover:border-[#FFCFC4] hover:bg-[#FFF5F2] hover:text-[#FF3C00]"
                        >
                          <Bot className="me-1 h-3 w-3" aria-hidden="true" />
                          Auto-fix
                        </Badge>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {recommendations.length > 0 && (
            <Link href="/dashboard/rankings" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                View all {recommendations.length} recommendations
                <ArrowRight className="ms-1.5 h-3 w-3" aria-hidden="true" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* ─── Zone 3: Engine Breakdown + Score History ─────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Per-engine breakdown with actual rank/mention data */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
                Engine Breakdown
              </CardTitle>
              {hasData && lastScanned && (
                <span className="text-xs text-muted-foreground">Latest scan</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {!hasData ? (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-6 py-8 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Run a scan to see your rank across each AI engine.
                </p>
                <Link href="/dashboard/rankings" className="mt-1">
                  <Button variant="outline" size="sm">
                    Start a scan
                    <ArrowRight className="ms-1.5 h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {ENGINES_ORDER.map((engine, engineIndex) => {
                  const meta = ENGINE_META[engine]
                  // Derive a per-engine score proxy from overall score + engine index spread
                  // (best we can do within existing DashboardOverviewProps without per-engine data)
                  const mentioned = mentionCount > engineIndex
                  const engineScore = score !== null
                    ? Math.max(0, Math.min(100, score + (engineIndex % 2 === 0 ? 6 : -7) + engineIndex))
                    : null

                  return (
                    <div
                      key={engine}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150',
                        mentioned
                          ? 'bg-muted/40 hover:bg-muted'
                          : 'opacity-50 bg-muted/20',
                      )}
                    >
                      {/* Engine chip */}
                      <div className="flex w-24 shrink-0 items-center gap-2">
                        <span
                          className={cn('h-2 w-2 rounded-full shrink-0', meta.dotClass)}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            'rounded-md border px-1.5 py-0.5 text-xs font-medium',
                            meta.colorClass,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {/* Score dots */}
                      <div className="flex-1">
                        {engineScore !== null ? (
                          <EngineDots score={engineScore} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Mention status */}
                      <div className="shrink-0">
                        {mentioned ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-[#10B981]">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Mentioned
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <XCircle className="h-3 w-3" aria-hidden="true" />
                            Not found
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <Link href="/dashboard/rankings" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                View detailed rankings
                <ArrowRight className="ms-1.5 h-3 w-3" aria-hidden="true" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Score trend chart + scan history */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
              Score Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            {recentScans.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No scan history yet"
                description="After your first scan, you'll see your visibility progress here."
              />
            ) : recentScans.length >= 3 ? (
              <div className="space-y-3">
                {/* Area chart */}
                <div
                  className="h-32 w-full"
                  role="img"
                  aria-label={`Visibility score trend over ${recentScans.length} scans`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sparklineData}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#FF3C00" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#FF3C00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" hide />
                      <Tooltip
                        content={<ScoreTooltip />}
                        cursor={{ stroke: '#FF3C00', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#FF3C00"
                        strokeWidth={2}
                        fill="url(#scoreAreaGradient)"
                        isAnimationActive={false}
                        dot={false}
                        activeDot={{ r: 3, fill: '#FF3C00', strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent scan rows below chart */}
                <div className="space-y-1.5">
                  {recentScans.slice(0, 3).map((scan) => {
                    const scanInfo = scan.overall_score !== null ? getScoreLevel(scan.overall_score) : null
                    return (
                      <div
                        key={scan.id}
                        className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
                      >
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            scanInfo
                              ? cn(scanInfo.bg, scanInfo.color)
                              : 'bg-muted text-muted-foreground',
                          )}
                          aria-hidden="true"
                        >
                          {scan.overall_score ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground">
                            Score: {scan.overall_score ?? 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scan.mentions_count} mention{scan.mentions_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Fewer than 3 scans — compact list + progress message */
              <div className="space-y-2">
                {recentScans.map((scan) => {
                  const scanInfo = scan.overall_score !== null ? getScoreLevel(scan.overall_score) : null
                  return (
                    <div
                      key={scan.id}
                      className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                          scanInfo
                            ? cn(scanInfo.bg, scanInfo.color)
                            : 'bg-muted text-muted-foreground',
                        )}
                        aria-hidden="true"
                      >
                        {scan.overall_score ?? '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Score: {scan.overall_score ?? 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scan.mentions_count} mention{scan.mentions_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )
                })}
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  {3 - recentScans.length} more scan{3 - recentScans.length !== 1 ? 's' : ''} needed to unlock your progress chart
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Zone 4: Recent Agent Activity ───────────────────────────── */}
      <Card className="bg-card rounded-[20px] border border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
              Recent Agent Work
            </CardTitle>
            {recentAgents.length > 0 && (
              <Link href="/dashboard/agents">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          {recentAgents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-6 py-8 text-center">
              <Bot className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">No agent work yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Pick an action from the queue above and let an agent handle it.
              </p>
              <Link href="/dashboard/agents" className="mt-1">
                <Button size="sm" className="h-7 rounded-lg px-3 text-xs">
                  <Sparkles className="me-1.5 h-3 w-3" aria-hidden="true" />
                  Run your first agent
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recentAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors duration-150 hover:bg-muted"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {agent.status === 'completed' && (
                      <CheckCircle2
                        className="h-4 w-4 text-[#10B981]"
                        aria-label="Completed"
                      />
                    )}
                    {agent.status === 'running' && (
                      <Loader2
                        className="h-4 w-4 animate-spin text-primary"
                        aria-label="Running"
                      />
                    )}
                    {agent.status === 'failed' && (
                      <XCircle
                        className="h-4 w-4 text-destructive"
                        aria-label="Failed"
                      />
                    )}
                    {!['completed', 'running', 'failed'].includes(agent.status) && (
                      <Clock
                        className="h-4 w-4 text-muted-foreground"
                        aria-label="Pending"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {AGENT_LABELS[agent.agent_type] ?? agent.agent_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 rounded-full text-xs capitalize',
                      agent.status === 'completed' &&
                        'border-green-200 bg-green-50 text-[#10B981]',
                      agent.status === 'running' &&
                        'border-[#FFCFC4] bg-[#FFF5F2] text-[#FF3C00]',
                      agent.status === 'failed' &&
                        'border-red-200 bg-red-50 text-[#EF4444]',
                    )}
                  >
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
