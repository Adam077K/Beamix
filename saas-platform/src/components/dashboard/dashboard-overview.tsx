'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Bot,
  BarChart3,
  Radio,
  RefreshCw,
  Expand,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { VisibilityTrendChart } from './charts/visibility-trend-chart'
import { EngineLogo } from '@/components/marketing/logos'

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

const AGENT_DESCRIPTIONS: Record<string, string> = {
  content_writer: 'Generated optimized content for your business profile and key pages',
  blog_writer: 'Created blog posts targeting high-value AI search queries',
  review_analyzer: 'Analyzed customer reviews and extracted sentiment patterns',
  schema_optimizer: 'Improved structured data markup for better AI comprehension',
  recommendations: 'Generated actionable recommendations based on scan results',
  social_strategy: 'Developed social media content strategy for AI visibility',
  competitor_intelligence: 'Analyzed competitor positioning across AI search engines',
  faq_agent: 'Created FAQ content optimized for AI search answers',
  initial_analysis: 'Completed initial AI visibility analysis for your business',
  free_scan: 'Ran a free AI visibility scan across search engines',
}

const LOGO_DEV_KEY = 'pk_Zl-VsfExQ8Ou_bmqOwe1sA'

const MOCK_COMPETITORS = [
  { name: 'Clay', domain: 'clay.com', score: 72, trend: 1.2, sentiment: 86, position: 2.7, posTrend: 0.3 },
  { name: 'Ramotion', domain: 'ramotion.com', score: 61, trend: -0.8, sentiment: 62, position: 2.9, posTrend: -0.1 },
  { name: 'Cieden', domain: 'cieden.com', score: 44, trend: 0.3, sentiment: 89, position: 3.6, posTrend: 0 },
  { name: 'Frog Design', domain: 'frogdesign.com', score: 38, trend: -1.1, sentiment: 76, position: 3.9, posTrend: 0 },
] as const

const DEMO_SCAN_HISTORY = [
  { created_at: '2026-01-15', overall_score: 42, mentions_count: 8, avg_position: 4.2, sentiment_positive_pct: 55 },
  { created_at: '2026-02-01', overall_score: 48, mentions_count: 12, avg_position: 3.8, sentiment_positive_pct: 62 },
  { created_at: '2026-02-15', overall_score: 55, mentions_count: 15, avg_position: 3.5, sentiment_positive_pct: 68 },
  { created_at: '2026-03-01', overall_score: 52, mentions_count: 14, avg_position: 3.6, sentiment_positive_pct: 65 },
  { created_at: '2026-03-15', overall_score: 61, mentions_count: 18, avg_position: 3.2, sentiment_positive_pct: 71 },
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

const ENGINE_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  ChatGPT: { label: 'LLM', color: 'text-[#3370FF]', bg: 'bg-[#3370FF]/10' },
  Gemini: { label: 'LLM', color: 'text-[#3370FF]', bg: 'bg-[#3370FF]/10' },
  Claude: { label: 'LLM', color: 'text-[#3370FF]', bg: 'bg-[#3370FF]/10' },
  Perplexity: { label: 'Search', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  'Google AI': { label: 'AI Overview', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
  Grok: { label: 'LLM', color: 'text-[#3370FF]', bg: 'bg-[#3370FF]/10' },
  'You.com': { label: 'Search', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
}

// ─── User business logo ──────────────────────────────────────────────────────
const BEAMIX_LOGO = '/logo/beamix_logo_blue_Primary.svg'

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────

function SentimentDonut({
  positive,
  neutral,
  negative,
}: {
  positive: number
  neutral: number
  negative: number
}) {
  const total = positive + neutral + negative
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[140px]">
        <p className="text-xs text-muted-foreground">No sentiment data</p>
      </div>
    )
  }

  const pPct = Math.round((positive / total) * 100)
  const nPct = Math.round((neutral / total) * 100)
  const negPct = Math.round((negative / total) * 100)

  const size = 130
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Gaps between segments for the rounded-cap look (like reference)
  const gapAngle = 4 // degrees
  const gapLen = (gapAngle / 360) * circumference
  const segCount = negative > 0 ? 3 : 2
  const usable = circumference - gapLen * segCount

  const segments = [
    { pct: positive / total, color: '#3370FF', label: 'Positive', value: pPct },
    { pct: neutral / total, color: '#9CA3AF', label: 'Neutral', value: nPct },
    ...(negative > 0 ? [{ pct: negative / total, color: '#EF4444', label: 'Negative', value: negPct }] : []),
  ]

  let offset = 0

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {segments.map((seg) => {
            const len = seg.pct * usable
            const el = (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            )
            offset += len + gapLen
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-foreground leading-none">{pPct}%</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">positive</span>
        </div>
      </div>
      {/* Legend — horizontal row below donut */}
      <div className="flex items-center gap-4 text-[11px]">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="text-foreground tabular-nums font-medium">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sentiment Bar (thin vertical bar like reference) ────────────────────────

function SentimentBar({ value }: { value: number }) {
  const maxValue = 100
  const height = Math.max(4, (value / maxValue) * 24)
  return (
    <div className="flex items-end gap-[2px] h-6">
      <div
        className="w-[3px] rounded-sm bg-foreground/20"
        style={{ height: `${height}px` }}
      />
      <span className="text-[11px] tabular-nums text-muted-foreground ml-1">{value}</span>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusDot(status: string): string {
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'running' || status === 'in_progress') return 'bg-[#3370FF]'
  if (status === 'failed') return 'bg-red-500'
  return 'bg-gray-300 dark:bg-gray-600'
}

function getStatusLabel(status: string): string {
  if (status === 'completed') return 'Completed'
  if (status === 'running' || status === 'in_progress') return 'Running'
  if (status === 'failed') return 'Failed'
  return status
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
  const [chartMetric, setChartMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')
  const [engineTab, setEngineTab] = useState<'engines' | 'sources'>('engines')
  const [engineSearch, setEngineSearch] = useState('')

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

  // Computed values
  const userScore = props.score ?? (demoMode ? 75 : 0)
  const displayScore = demoMode ? 75 : userScore
  const scoreDelta = demoMode ? 5.2 : (props.scoreDelta ?? 0)
  // Engine results for breakdown
  const engineResults = props.engineResults ?? []
  const demoEngineResults = demoMode
    ? [
        { engine: 'ChatGPT', is_mentioned: true, rank_position: 3, sentiment: 'positive' as string | null },
        { engine: 'Gemini', is_mentioned: true, rank_position: 5, sentiment: 'neutral' as string | null },
        { engine: 'Perplexity', is_mentioned: true, rank_position: 2, sentiment: 'positive' as string | null },
        { engine: 'Claude', is_mentioned: false, rank_position: null, sentiment: null as string | null },
        { engine: 'Google AI', is_mentioned: false, rank_position: null, sentiment: null as string | null },
        { engine: 'Grok', is_mentioned: false, rank_position: null, sentiment: null as string | null },
        { engine: 'You.com', is_mentioned: false, rank_position: null, sentiment: null as string | null },
      ]
    : engineResults

  // Filter engines by search
  const filteredEngines = demoEngineResults.filter((e) => {
    const name = ENGINE_NAMES[e.engine] ?? e.engine
    return name.toLowerCase().includes(engineSearch.toLowerCase())
  })

  // Sentiment
  const sentimentSummary = props.sentimentSummary ?? (demoMode
    ? { positive: 18, neutral: 7, negative: 3 }
    : { positive: 0, neutral: 0, negative: 0 })

  // Competitor ranking — insert user into mock competitors
  const competitorsAbove = MOCK_COMPETITORS.filter((c) => c.score > displayScore).length
  const marketPosition = competitorsAbove + 1
  const allCompetitors = [
    {
      rank: marketPosition,
      name: props.businessName || 'Beamix',
      domain: undefined as string | undefined,
      score: displayScore,
      trend: scoreDelta,
      sentiment: 88,
      position: 2.5,
      posTrend: 0.2,
      isUser: true,
    },
    ...MOCK_COMPETITORS.map((c, i) => ({
      rank: c.score > displayScore ? i + 1 : i + 2,
      name: c.name,
      domain: c.domain,
      score: c.score,
      trend: c.trend,
      sentiment: c.sentiment,
      position: c.position,
      posTrend: c.posTrend,
      isUser: false,
    })),
  ].sort((a, b) => b.score - a.score).map((c, i) => ({ ...c, rank: i + 1 }))

  // Recent agent activity
  const recentAgents = props.recentAgents.slice(0, 4)

  // Business logo
  const businessLogoUrl = BEAMIX_LOGO

  // ─── Empty State ────────────────────────────────────────────────────────────

  const hasNoData = !demoMode && displayScore === 0 && props.recentScans.length === 0

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-10 w-10 rounded-[10px] bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="text-base font-medium text-foreground">No scan data yet</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Run your first AI visibility scan to see how your business appears across AI search engines.
        </p>
        <Button asChild className="mt-5 rounded-lg bg-[#3370FF] text-white hover:bg-[#2960DB] h-9 px-4 text-sm">
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
    <div className="space-y-0">

      {/* ── Filter Bar (Attio-style pill selectors) ─── */}
      <div className="flex items-center gap-2 flex-wrap pb-4">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted/50 transition-colors"
        >
          <img
            src={businessLogoUrl}
            alt={props.businessName || 'Beamix'}
            width={16}
            height={16}
            className="shrink-0 rounded object-contain"
            loading="lazy"
          />
          <span className="truncate max-w-[140px]">{props.businessName || 'Beamix'}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Last 7 days
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          All Engines
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>

        {demoMode && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 bg-muted/60 px-2 py-0.5 rounded-full">Sample data</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="rounded-lg h-8 px-3 text-xs bg-[#3370FF] text-white hover:bg-[#2960DB] border-0"
          >
            <Link href="/dashboard/scan">
              <RefreshCw className="h-3 w-3 mr-1.5" aria-hidden="true" />
              Run Scan
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Two-Column Layout (60/40 split like Attio) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">

        {/* === LEFT COLUMN === */}
        <div className="flex flex-col gap-5">

          {/* Chart Area */}
          <div className="rounded-[20px] border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: 'visibility', label: 'Visibility', icon: '●' },
                    { key: 'sentiment', label: 'Sentiment', icon: '◎' },
                    { key: 'position', label: 'Position', icon: '◆' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setChartMetric(tab.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors',
                      chartMetric === tab.key
                        ? 'bg-foreground text-background font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <span className="text-[10px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 pb-3">
              <VisibilityTrendChart data={scanHistory} />
            </div>
          </div>

          {/* Engine Table — reference: "Top Websites that AI loves" style */}
          <div className="rounded-[20px] border border-border bg-card overflow-hidden">
            {/* Tab selectors + search */}
            <div className="flex items-center gap-0 px-4 pt-3 border-b border-border">
              {(['engines', 'sources'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setEngineTab(tab)}
                  className={cn(
                    'px-3 pb-2.5 text-sm capitalize transition-colors border-b-2 -mb-px',
                    engineTab === tab
                      ? 'border-foreground text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {engineTab === 'engines' ? (
              <div>
                {/* Search bar + filter — matches reference layout */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50">
                  <div className="relative flex-1 max-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search engines"
                      value={engineSearch}
                      onChange={(e) => setEngineSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#3370FF]/30 focus:border-[#3370FF]/50 transition-colors"
                    />
                  </div>
                  <div className="ml-auto">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      All Types
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Table header — reference style with clean spacing */}
                <div className="grid grid-cols-[28px_1fr_80px_56px] sm:grid-cols-[28px_1fr_64px_80px_56px_48px] gap-1.5 px-4 py-2 text-[11px] text-muted-foreground font-medium border-b border-border/30">
                  <span>#</span>
                  <span>Engine</span>
                  <span className="hidden sm:block">Type</span>
                  <span>Mentioned</span>
                  <span>Rank</span>
                  <span className="hidden sm:block">Sent.</span>
                </div>
                {/* Table rows */}
                <div className="divide-y divide-border/30">
                  {filteredEngines.map((engine, i) => {
                    const name = ENGINE_NAMES[engine.engine] ?? engine.engine
                    const typeInfo = ENGINE_TYPES[name] ?? { label: 'LLM', color: 'text-[#3370FF]', bg: 'bg-[#3370FF]/10' }
                    return (
                      <div
                        key={engine.engine}
                        className="grid grid-cols-[28px_1fr_80px_56px] sm:grid-cols-[28px_1fr_64px_80px_56px_48px] gap-1.5 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <EngineLogo engine={name} size="sm" />
                          <span className="text-sm text-foreground truncate">{name}</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium', typeInfo.color, typeInfo.bg)}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div>
                          {engine.is_mentioned ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-[6px] w-[6px] rounded-full bg-emerald-500" />
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">Yes</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-[6px] w-[6px] rounded-full bg-gray-300 dark:bg-gray-600" />
                              <span className="text-xs text-muted-foreground">No</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {engine.is_mentioned && engine.rank_position != null
                            ? `#${engine.rank_position}`
                            : '\u2014'}
                        </span>
                        <span className="hidden sm:block">
                          {engine.sentiment ? (
                            <span
                              className={cn(
                                'h-[6px] w-[6px] rounded-full inline-block',
                                engine.sentiment === 'positive' && 'bg-emerald-500',
                                engine.sentiment === 'neutral' && 'bg-gray-400',
                                engine.sentiment === 'negative' && 'bg-red-500',
                              )}
                              aria-label={`Sentiment: ${engine.sentiment}`}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">{'\u2014'}</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">Source analysis coming soon</p>
                <p className="text-xs text-muted-foreground/60 mt-1">View which web sources AI engines cite</p>
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="flex flex-col gap-5">

          {/* Competitors Table — reference: "Attio's competitors" style */}
          <div className="rounded-[20px] border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-medium text-foreground">Competitors</h3>
              <button
                type="button"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Expand competitors view"
              >
                <Expand className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Table header — matches reference: # | Brand | Visibility | Sentiment | Position */}
            <div className="grid grid-cols-[28px_1fr_90px_72px_72px] gap-2 px-4 py-2 text-[11px] text-muted-foreground font-medium border-b border-border/50">
              <span>#</span>
              <span>Brand</span>
              <span>Visibility</span>
              <span>Sentiment</span>
              <span className="text-right">Position</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-border/30">
              {allCompetitors.slice(0, 5).map((competitor) => (
                <div
                  key={competitor.name}
                  className={cn(
                    'grid grid-cols-[28px_1fr_90px_72px_72px] gap-2 items-center px-4 py-2.5 hover:bg-muted/30 transition-colors',
                    competitor.isUser && 'bg-muted/40 dark:bg-muted/30'
                  )}
                >
                  <span className="text-xs tabular-nums text-muted-foreground">{competitor.rank}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {competitor.isUser ? (
                      <img
                        src={businessLogoUrl}
                        alt={competitor.name}
                        width={20}
                        height={20}
                        className="shrink-0 rounded-md object-contain"
                        loading="lazy"
                      />
                    ) : competitor.domain ? (
                      <img
                        src={`https://img.logo.dev/${competitor.domain}?token=${LOGO_DEV_KEY}&size=40&format=png`}
                        alt={competitor.name}
                        width={20}
                        height={20}
                        className="shrink-0 rounded-md object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0 bg-muted-foreground/40"
                      >
                        {competitor.name.charAt(0)}
                      </div>
                    )}
                    <span
                      className={cn(
                        'text-sm truncate',
                        competitor.isUser ? 'font-medium text-foreground' : 'text-foreground'
                      )}
                    >
                      {competitor.name}
                    </span>
                  </div>
                  {/* Visibility — score + trend arrow like reference */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs tabular-nums text-foreground">{competitor.score}%</span>
                    {competitor.trend !== 0 && (
                      <span
                        className={cn(
                          'text-[10px] tabular-nums inline-flex items-center',
                          competitor.trend > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500'
                        )}
                      >
                        {competitor.trend > 0 ? '↗' : '↘'} {Math.abs(competitor.trend).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {/* Sentiment — thin bar like reference */}
                  <SentimentBar value={competitor.sentiment} />
                  {/* Position — rank number with trend */}
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-xs tabular-nums text-foreground">{competitor.position.toFixed(1)}</span>
                    {competitor.posTrend !== 0 && (
                      <span
                        className={cn(
                          'text-[10px] tabular-nums',
                          competitor.posTrend > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500'
                        )}
                      >
                        {competitor.posTrend > 0 ? '↗' : '↘'} {Math.abs(competitor.posTrend).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-border">
              <Link
                href="/dashboard/rankings"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                Full rankings
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Sentiment Distribution Donut */}
          <div className="rounded-[20px] border border-border bg-card overflow-hidden">
            <div className="px-4 py-3">
              <h3 className="text-sm font-medium text-foreground">Sentiment Distribution</h3>
            </div>
            <div className="px-4 py-4">
              <SentimentDonut
                positive={sentimentSummary.positive}
                neutral={sentimentSummary.neutral}
                negative={sentimentSummary.negative}
              />
            </div>
          </div>

          {/* Recent Activity — rich card-like rows */}
          <div className="rounded-[20px] border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
              <Link
                href="/dashboard/agents"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                All
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <div>
              {recentAgents.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
                    <Bot className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">No agent activity yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Run an agent from recommendations</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {recentAgents.map((agent) => {
                    const label = AGENT_LABELS[agent.agent_type] ?? agent.agent_type
                    const desc = AGENT_DESCRIPTIONS[agent.agent_type] ?? 'Completed task for your business'
                    const timeAgo = formatDistanceToNow(new Date(agent.created_at), { addSuffix: false })
                    const statusLabel = getStatusLabel(agent.status)
                    return (
                      <div key={agent.id} className="flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        {/* Status dot */}
                        <div className="pt-1.5 shrink-0">
                          <span
                            className={cn('block h-2 w-2 rounded-full', getStatusDot(agent.status))}
                            aria-label={`Status: ${agent.status}`}
                          />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{label}</p>
                            <span className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
                              agent.status === 'completed' && 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                              agent.status === 'failed' && 'text-red-500 bg-red-500/10',
                              (agent.status === 'running' || agent.status === 'in_progress') && 'text-[#3370FF] bg-[#3370FF]/10',
                            )}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Credits badge */}
                            {agent.credits_cost > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                {agent.credits_cost} credit{agent.credits_cost !== 1 ? 's' : ''}
                              </span>
                            )}
                            {/* Timestamp */}
                            <span className="text-[11px] text-muted-foreground/60 tabular-nums ml-auto">
                              {timeAgo} ago
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {/* Bottom action */}
            <div className="px-4 py-3 border-t border-border">
              <Button
                asChild
                size="sm"
                className="w-full rounded-lg bg-[#3370FF] text-white hover:bg-[#2960DB] h-8 text-xs font-medium"
              >
                <Link href="/dashboard/agents">
                  <Bot className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Run AI Agent
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
