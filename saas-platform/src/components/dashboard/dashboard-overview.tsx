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
  Calendar,
  Globe,
  MapPin,
  Award,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScoreRing } from '@/components/ui/score-ring'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
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

// Mock competitors shown in industry ranking table.
// These will be replaced with real competitor data from the
// competitor_intelligence agent once that pipeline is wired.
const MOCK_COMPETITORS = [
  { name: 'Competitor A', score: 72, position: 1 },
  { name: 'Competitor B', score: 61, position: 2 },
  { name: 'Competitor C', score: 44, position: 4 },
  { name: 'Competitor D', score: 38, position: 5 },
] as const

const PRIORITY_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  critical: { bg: 'bg-red-50',    text: 'text-red-700',    ring: 'border-red-200' },
  high:     { bg: 'bg-[#FFF5F2]', text: 'text-[#FF3C00]',  ring: 'border-[#FFCFC4]' },
  medium:   { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'border-amber-200' },
  low:      { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'border-blue-200' },
}

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

// ─── Chart tooltip ────────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { date: string } }>
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-card border border-border shadow-lg p-3">
      <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
      <p className="text-lg font-semibold text-foreground tabular-nums">
        {payload[0].value}%
      </p>
    </div>
  )
}

// ─── Delta badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" aria-hidden="true" />
        No change
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        delta > 0
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
          : 'bg-red-50 text-red-600 dark:bg-red-950/40',
      )}
    >
      {delta > 0 ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      {delta > 0 ? '+' : ''}{delta}
    </span>
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

  // Build date-labelled chart data from recentScans (oldest first for L→R trend)
  const chartData = recentScans
    .filter((s) => s.overall_score !== null)
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score: s.overall_score as number,
    }))
    .reverse()

  const hasChart = chartData.length >= 2

  // Top recommendation gets hero treatment; rest get compact list
  const [topRec, ...restRecs] = recommendations

  // Derive market position by comparing score to mock competitors
  const userScore = score ?? 0
  const competitorsAbove = MOCK_COMPETITORS.filter((c) => c.score > userScore).length
  const marketPosition = competitorsAbove + 1

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">

      {/* ─── Header: Greeting + Date ──────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Good morning{businessName ? `, ${businessName}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your AI search performance and take action.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{todayStr}</span>
      </div>

      {/* ─── Filter Bar ───────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl bg-card border border-border p-2"
        role="toolbar"
        aria-label="Dashboard filters"
      >
        <Badge
          variant="outline"
          className="cursor-default rounded-full text-xs font-medium hover:bg-muted"
        >
          <Calendar className="me-1.5 h-3 w-3" aria-hidden="true" />
          Last 7 days
        </Badge>
        <Badge
          variant="outline"
          className="cursor-default rounded-full text-xs font-medium hover:bg-muted"
        >
          <Globe className="me-1.5 h-3 w-3" aria-hidden="true" />
          All engines
        </Badge>
        <Badge
          variant="outline"
          className="cursor-default rounded-full text-xs font-medium hover:bg-muted"
        >
          <MapPin className="me-1.5 h-3 w-3" aria-hidden="true" />
          All locations
        </Badge>
        {lastScanned && (
          <span className="ms-auto text-xs text-muted-foreground">
            Last scanned{' '}
            <span className="font-medium text-foreground">
              {formatDistanceToNow(new Date(lastScanned), { addSuffix: true })}
            </span>
          </span>
        )}
      </div>

      {/* ─── KPI Cards Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* KPI 1: Brand Presence */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Brand Presence</span>
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ScoreRing score={score} size="sm" animate={true} showLabel={false} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold tabular-nums text-foreground">
                      {score !== null ? `${score}%` : '--'}
                    </span>
                    <DeltaBadge delta={scoreDelta} />
                  </div>
                  <p className="text-xs text-muted-foreground">Visibility score</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">AI Mentions</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {hasData ? mentionCount : '--'}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 4 engines</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Citations */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Citations</span>
              <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {hasData ? mentionCount : '--'}
                  </span>
                  <span className="text-sm text-muted-foreground">AI mentions</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {!hasData
                    ? 'Run a scan to see citations'
                    : mentionCount === 0
                    ? 'Not appearing in any AI engine yet'
                    : `Across ${mentionCount} of 4 engines`}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">Last scanned</span>
                <span className="text-xs font-medium text-foreground">
                  {lastScanned
                    ? formatDistanceToNow(new Date(lastScanned), { addSuffix: true })
                    : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Market Position */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Market Position</span>
              <Award className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {hasData ? `#${marketPosition}` : '--'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {hasData ? 'in industry' : ''}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasData
                    ? 'Estimated vs. competitors in your space'
                    : 'Run a scan to see positioning'}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">Market share</span>
                <span className="text-xs font-medium text-muted-foreground italic">
                  Coming soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main Content: Chart + Rankings ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Left 2/3: AI Visibility Score Chart */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                  AI Visibility Score
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Trend over your last{' '}
                  {recentScans.length} scan{recentScans.length !== 1 ? 's' : ''}
                </p>
              </div>
              {hasData && (
                <div className="text-end shrink-0">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-3xl font-semibold tabular-nums text-foreground">
                      {score}%
                    </span>
                    <DeltaBadge delta={scoreDelta} />
                  </div>
                  <p className="text-xs text-muted-foreground">Current score</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {!hasData || recentScans.length === 0 ? (
              /* Empty state — no scans yet */
              <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/50 px-6 py-12 text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground">No scan history yet</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    After your first scan, your visibility trend will appear here.
                  </p>
                </div>
                <Link href="/dashboard/rankings">
                  <Button size="sm" className="mt-1">
                    Start your first scan
                    <ArrowRight className="ms-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            ) : !hasChart ? (
              /* Not enough points for a trend — nudge user to scan again */
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-6 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  {chartData.length === 1
                    ? '1 scan recorded — run 1 more to unlock the trend chart'
                    : `${chartData.length} scans recorded — building your trend...`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Each scan adds a data point to your visibility curve.
                </p>
                <Link href="/dashboard/rankings">
                  <Button variant="outline" size="sm" className="mt-1">
                    Run another scan
                    <ArrowRight className="ms-1.5 h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            ) : (
              /* Full area chart */
              <div
                className="h-[280px] w-full"
                role="img"
                aria-label={`AI visibility score trend over ${chartData.length} scans`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3C00" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#FF3C00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ stroke: '#FF3C00', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#FF3C00"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#FF3C00', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 1/3: Industry Ranking Table */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Industry Ranking</CardTitle>
            <p className="text-xs text-muted-foreground">
              Your position vs. competitors
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {!hasData ? (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-4 py-8 text-center">
                <Award className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">
                  Run a scan to see how you rank.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Column header */}
                <div className="grid grid-cols-[20px_1fr_40px] gap-2 px-2 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    #
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Brand
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-end">
                    Score
                  </span>
                </div>

                {/* User row — highlighted with orange accent */}
                <div
                  className="grid grid-cols-[20px_1fr_40px] items-center gap-2 rounded-xl px-2 py-2.5 bg-primary/5 border-s-2 border-primary"
                >
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {marketPosition}
                  </span>
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {businessName || 'You'}
                    </span>
                    <Badge className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary border-0">
                      You
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-end text-foreground">
                    {score}%
                  </span>
                </div>

                {/* Competitor rows — mock data */}
                {MOCK_COMPETITORS.map((comp, i) => {
                  // Assign ranks that skip the user's position
                  const rank = i + 1 >= marketPosition ? i + 2 : i + 1
                  return (
                    <div
                      key={comp.name}
                      className="grid grid-cols-[20px_1fr_40px] items-center gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <span className="text-xs text-muted-foreground tabular-nums">{rank}</span>
                      <span className="truncate text-xs text-muted-foreground">{comp.name}</span>
                      <span className="text-xs tabular-nums text-end text-muted-foreground">
                        {comp.score}%
                      </span>
                    </div>
                  )
                })}

                <p className="pt-2 text-[10px] text-muted-foreground px-2 leading-relaxed">
                  Competitor data is estimated. Run the Competitor Intelligence agent for real data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Bottom Row: Action Queue + Credits & Activity ────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Left: Recommended Actions */}
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
                Recommended Actions
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
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-6 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-[#10B981]" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">Nothing to fix right now</p>
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

                {/* Top priority recommendation — hero accent */}
                {topRec && (() => {
                  const style = PRIORITY_STYLES[topRec.priority] ?? PRIORITY_STYLES.medium
                  const agentLabel = topRec.suggested_agent
                    ? (AGENT_LABELS[topRec.suggested_agent] ?? topRec.suggested_agent)
                    : null
                  const isUrgent = topRec.priority === 'critical' || topRec.priority === 'high'
                  return (
                    <div className="relative overflow-hidden rounded-[20px] bg-[#FFF5F2] dark:bg-primary/5 border border-[#FFCFC4] dark:border-primary/20 ps-6 pe-5 py-5">
                      <span
                        className="absolute inset-y-0 start-0 w-1 rounded-s-[20px] bg-gradient-to-b from-[#FF3C00] to-[#FF3C00]/50"
                        aria-hidden="true"
                      />
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                            'text-[10px] font-bold uppercase tracking-wider',
                            style.bg, style.text,
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          {isUrgent ? 'Top action' : topRec.priority}
                        </span>
                        {agentLabel && (
                          <span className="text-xs text-muted-foreground">— {agentLabel}</span>
                        )}
                      </div>
                      <h3 className="mb-1 text-sm font-semibold text-foreground leading-snug">
                        {topRec.title}
                      </h3>
                      <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                        {topRec.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {agentLabel ? (
                          <Link href="/dashboard/agents">
                            <Button
                              size="sm"
                              className="rounded-lg bg-primary text-white shadow-[0_2px_8px_rgba(255,60,0,0.25)] hover:bg-[#e63600] hover:shadow-[0_4px_16px_rgba(255,60,0,0.35)] active:scale-[0.98] transition-all duration-150"
                            >
                              <Sparkles className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                              Run Agent
                              <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/dashboard/rankings">
                            <Button
                              size="sm"
                              className="rounded-lg bg-primary text-white shadow-[0_2px_8px_rgba(255,60,0,0.25)] hover:bg-[#e63600] hover:shadow-[0_4px_16px_rgba(255,60,0,0.35)] active:scale-[0.98] transition-all duration-150"
                            >
                              Fix this now
                              <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
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
                  )
                })()}

                {/* Remaining recommendations — compact list */}
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
                          style.bg, style.text,
                        )}
                      >
                        {rec.priority}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{rec.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                      {agentLabel && (
                        <Link href="/dashboard/agents" className="shrink-0">
                          <Badge
                            variant="outline"
                            className="cursor-pointer text-xs transition-colors hover:border-[#FFCFC4] hover:bg-[#FFF5F2] hover:text-[#FF3C00]"
                          >
                            <Bot className="me-1 h-3 w-3" aria-hidden="true" />
                            Fix
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

        {/* Right: Agent Credits + Recent Activity stacked */}
        <div className="flex flex-col gap-4">

          {/* Agent Credits */}
          <Card className="bg-card rounded-[20px] border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Agent Credits</span>
                <Bot className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {totalCredits}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {monthlyCredits} remaining
                </span>
              </div>
              {monthlyCredits > 0 && (
                <div className="space-y-1.5">
                  <Progress
                    value={creditsPercent}
                    className="h-2"
                    aria-label={`${creditsUsed} of ${monthlyCredits} agent credits used`}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{creditsUsed} used</span>
                    <span>{totalCredits} left</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Agent Activity */}
          <Card className="flex-1 bg-card rounded-[20px] border border-border shadow-sm">
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
                <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-4 py-6 text-center">
                  <Bot className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm font-medium text-foreground">No agent work yet</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Pick an action from the queue and let an agent handle it.
                  </p>
                  <Link href="/dashboard/agents" className="mt-1">
                    <Button size="sm" className="h-7 rounded-lg px-3 text-xs">
                      <Sparkles className="me-1.5 h-3 w-3" aria-hidden="true" />
                      Run your first agent
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentAgents.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5 transition-colors duration-150 hover:bg-muted"
                    >
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
      </div>
    </div>
  )
}
