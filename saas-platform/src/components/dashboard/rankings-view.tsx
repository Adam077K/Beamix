'use client'

import * as React from 'react'
import { useState, useEffect, useMemo, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  ScanSearch,
  Search,
  Activity,
  ChevronDown,
  Clock,
  Zap,
  Download,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Globe,
  Trash2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { DataTable } from '@/components/ui/data-table'
import { ChartCard } from '@/components/ui/chart-card'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { StatusDot } from '@/components/ui/status-dot'
import { ScoreRing } from '@/components/ui/score-ring'
import { TrendBadge } from '@/components/ui/trend-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
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

// ─── Design tokens (from DASHBOARD_PAGES_FINAL.md) ──────────────────────────

const ACCENT = '#3370FF'
const TEXT_PRIMARY = '#111827'
const TEXT_MUTED = '#6B7280'
const BORDER_COLOR = '#E5E7EB'

// ─── Types ───────────────────────────────────────────────────────────────────

type MentionSentiment = 'positive' | 'neutral' | 'negative'
type TabId = 'rankings' | 'competitors'

interface ScanItem {
  id: string
  overall_score: number | null
  mentions_count: number | null
  created_at: string
  scan_type: string | null
}

interface EngineDetail {
  id: string
  scan_id: string
  engine: string
  is_mentioned: boolean
  rank_position: number | null
  sentiment: MentionSentiment | null
}

interface QueryItem {
  id: string
  query_text: string
  priority: number | null
  is_active: boolean
  last_scanned_at: string | null
}

interface Competitor {
  id: string
  name: string
  domain: string | null
  source: string | null
  created_at: string
  business_id: string
}

export interface RankingsViewProps {
  scans: ScanItem[]
  latestDetails: EngineDetail[]
  queries: QueryItem[]
  /** Competitor data — optional; shown in Competitors tab */
  competitors?: Competitor[]
  businessId?: string | null
}

// ─── Engine colors ───────────────────────────────────────────────────────────

const ENGINE_COLORS: Record<string, string> = {
  chatgpt: '#10B981',
  gemini: '#0EA5E9',
  perplexity: '#8B5CF6',
  claude: '#F97316',
  google_ai_overviews: '#FBBF24',
}

function engineColor(engine: string): string {
  return ENGINE_COLORS[engine] ?? '#9CA3AF'
}

// ─── Mock competitor score (deterministic) ───────────────────────────────────

function mockCompetitorScore(index: number): number {
  const base = [72, 61, 55, 44, 38, 30, 25]
  return base[index % base.length] ?? 40
}

// ─── CSV export ──────────────────────────────────────────────────────────────

function exportEngineResultsCSV(details: EngineDetail[]): void {
  const header = 'Engine,Mentioned,Rank Position,Sentiment'
  const rows = details.map((d) => {
    const label = PROVIDER_LABELS[d.engine as LlmProvider] ?? d.engine
    return `${label},${d.is_mentioned ? 'Yes' : 'No'},${d.rank_position ?? '—'},${d.sentiment ?? '—'}`
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rankings-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sentiment badge ─────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: MentionSentiment | null }) {
  if (!sentiment) return <span className="text-[#9CA3AF] text-xs">—</span>
  const map = {
    positive: { label: 'Positive', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    neutral:  { label: 'Neutral',  cls: 'bg-gray-50 text-[#6B7280] border-[#E5E7EB]' },
    negative: { label: 'Negative', cls: 'bg-red-50 text-red-700 border-red-200' },
  }[sentiment]
  return (
    <Badge variant="outline" className={cn('text-xs font-medium capitalize rounded-md', map.cls)}>
      {map.label}
    </Badge>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'rankings',    label: 'My Rankings' },
    { id: 'competitors', label: 'Competitors' },
  ]

  return (
    <div
      className="flex gap-0 border-b"
      style={{ borderColor: BORDER_COLOR }}
      role="tablist"
      aria-label="Rankings navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
              'focus-visible:ring-[#3370FF]',
              isActive
                ? 'border-b-2 text-[#3370FF]'
                : 'text-[#6B7280] hover:text-[#111827] border-b-2 border-transparent',
            )}
            style={isActive ? { borderBottomColor: ACCENT, marginBottom: '-1px' } : undefined}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Animated bar ─────────────────────────────────────────────────────────────

interface AnimatedBarProps {
  pct: number
  color: string
  delay: number
  height?: string
  bg?: string
}

function AnimatedBar({ pct, color, delay, height = 'h-2', bg = 'bg-[#F3F4F6]' }: AnimatedBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay)
    return () => clearTimeout(t)
  }, [pct, delay])

  return (
    <div className={cn('relative overflow-hidden rounded-full w-full', height, bg)}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, backgroundColor: color, transitionDelay: `${delay}ms` }}
      />
    </div>
  )
}

// ─── Engine row (expandable) ─────────────────────────────────────────────────

interface EngineRowProps {
  detail: EngineDetail
  index: number
}

const AI_RESPONSE_SNIPPETS: Record<string, string> = {
  chatgpt: '"When searching for local services, this business is one of the top-mentioned providers in the area, known for reliability and customer satisfaction."',
  gemini: '"Based on recent data, this business has strong visibility in local AI search results and appears frequently when users ask about related services."',
  perplexity: '"Multiple sources confirm this business as a trusted option for customers looking for this type of service."',
  claude: '"This business demonstrates good online presence across review platforms and industry directories."',
  google_ai_overviews: '"This business is frequently featured in AI-generated overviews for local service queries."',
}

function EngineRow({ detail, index }: EngineRowProps) {
  const [expanded, setExpanded] = useState(false)
  const label = PROVIDER_LABELS[detail.engine as LlmProvider] ?? detail.engine
  const color = engineColor(detail.engine)
  const notFound = !detail.is_mentioned

  return (
    <div className="border-b last:border-0" style={{ borderColor: BORDER_COLOR }}>
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-3.5">
        {/* Mention status circle + engine name */}
        <div className="flex items-center gap-2.5 w-36 shrink-0">
          <span
            className={cn(
              'text-base leading-none shrink-0',
              detail.is_mentioned ? 'text-[#10B981]' : 'text-[#D1D5DB]',
            )}
            aria-label={detail.is_mentioned ? 'Mentioned' : 'Not mentioned'}
          >
            {detail.is_mentioned ? '●' : '○'}
          </span>
          <span className="text-sm font-medium truncate" style={{ color: TEXT_PRIMARY }}>
            {label}
          </span>
        </div>

        {/* Status */}
        <div className="w-24 shrink-0">
          <span
            className={cn(
              'text-xs font-medium',
              detail.is_mentioned ? 'text-[#10B981]' : 'text-[#EF4444]',
            )}
          >
            {detail.is_mentioned ? 'Mentioned' : 'Not Found'}
          </span>
        </div>

        {/* Animated bar */}
        <div className="flex-1 min-w-0">
          <AnimatedBar
            pct={detail.is_mentioned ? (detail.rank_position ? Math.max(0, Math.min(100, Math.round((1 / detail.rank_position) * 100))) : 60) : 0}
            color={detail.is_mentioned ? color : BORDER_COLOR}
            delay={index * 80 + 200}
          />
        </div>

        {/* Sentiment */}
        <div className="w-24 shrink-0 text-right">
          <SentimentBadge sentiment={detail.sentiment} />
        </div>

        {/* Rank position */}
        <div className="w-10 shrink-0 text-right">
          <span className="text-sm font-mono tabular-nums" style={{ color: TEXT_MUTED }}>
            {detail.is_mentioned && detail.rank_position !== null ? `#${detail.rank_position}` : '—'}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-6 shrink-0 flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] rounded"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label} details`}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Expanded: AI response snippet + diagnostic hint */}
      {expanded && (
        <div className="px-5 pb-4 pt-0 bg-[#F9FAFB]">
          {detail.is_mentioned ? (
            <div className="flex gap-3">
              <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-[#3370FF]" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: TEXT_MUTED }}>
                  What {label} says about you
                </p>
                <p className="text-sm italic" style={{ color: TEXT_PRIMARY }}>
                  {AI_RESPONSE_SNIPPETS[detail.engine] ?? '"This business appears in search results for relevant queries."'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#F59E0B]" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>
                  Not yet indexed by {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                  To improve visibility on {label}: ensure your business is mentioned in authoritative directories, add structured data (Schema.org), and create content that answers common questions in your industry.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-2.5 h-7 text-xs rounded-md border-[#E5E7EB]">
                  <Link href="/dashboard/action-center">
                    <Lightbulb className="h-3 w-3 mr-1.5" aria-hidden="true" />
                    Fix This
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Query performance grid ───────────────────────────────────────────────────

interface QueryGridProps {
  queries: QueryItem[]
  engines: string[]
}

function QueryPerformanceGrid({ queries, engines }: QueryGridProps) {
  if (queries.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <Search className="h-8 w-8 mx-auto mb-2 text-[#D1D5DB]" aria-hidden="true" />
        <p className="text-sm" style={{ color: TEXT_MUTED }}>No tracked queries yet.</p>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
          Queries are created automatically when you run scans.
        </p>
      </div>
    )
  }

  const displayEngines = engines.slice(0, 5)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm" role="grid" aria-label="Query performance by engine">
        <thead>
          <tr className="border-b" style={{ borderColor: BORDER_COLOR }}>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
              Query
            </th>
            {displayEngines.map((engine) => (
              <th key={engine} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                {PROVIDER_LABELS[engine as LlmProvider] ?? engine}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {queries.slice(0, 8).map((query, qi) => (
            <tr
              key={query.id}
              className="border-b last:border-0 hover:bg-[#F9FAFB] transition-colors"
              style={{ borderColor: BORDER_COLOR }}
            >
              <td className="px-5 py-3">
                <span className="text-sm font-medium truncate block max-w-[240px]" style={{ color: TEXT_PRIMARY }}>
                  {query.query_text}
                </span>
                {!query.is_active && (
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>Inactive</span>
                )}
              </td>
              {displayEngines.map((engine, ei) => {
                // Deterministic mock: odd rows/cols = mentioned, even = not
                const mentioned = (qi + ei) % 3 !== 0
                return (
                  <td key={engine} className="px-3 py-3 text-center">
                    <span
                      className={cn('text-base leading-none', mentioned ? 'text-[#10B981]' : 'text-[#D1D5DB]')}
                      aria-label={mentioned ? 'Mentioned' : 'Not mentioned'}
                    >
                      {mentioned ? '●' : '○'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── "What AI Says About You" quote cards ────────────────────────────────────

interface QuoteCardsProps {
  details: EngineDetail[]
}

function QuoteCards({ details }: QuoteCardsProps) {
  const mentionedDetails = details.filter((d) => d.is_mentioned)

  if (mentionedDetails.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#D1D5DB]" aria-hidden="true" />
        <p className="text-sm" style={{ color: TEXT_MUTED }}>
          No AI responses yet — run a scan to see what engines say about you.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
      {mentionedDetails.map((detail) => {
        const label = PROVIDER_LABELS[detail.engine as LlmProvider] ?? detail.engine
        const snippet = AI_RESPONSE_SNIPPETS[detail.engine] ?? '"This business appears in AI search results."'
        return (
          <div
            key={detail.id}
            className="rounded-lg p-4"
            style={{ backgroundColor: '#F9FAFB', border: `1px solid ${BORDER_COLOR}` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: engineColor(detail.engine) }}
                aria-hidden="true"
              >
                {label.charAt(0)}
              </span>
              <span className="text-xs font-semibold" style={{ color: TEXT_PRIMARY }}>{label}</span>
              <SentimentBadge sentiment={detail.sentiment} />
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: TEXT_MUTED }}>
              {snippet}
            </p>
            {detail.rank_position !== null && (
              <p className="text-xs mt-2 font-medium" style={{ color: ACCENT }}>
                Ranked #{detail.rank_position}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Competitors tab content ──────────────────────────────────────────────────

interface CompetitorsTabProps {
  competitors: Competitor[]
  businessId: string | null
  yourScore: number | null
}

function CompetitorsTab({ competitors, businessId, yourScore }: CompetitorsTabProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const competitorScores = useMemo(
    () => competitors.map((_, i) => mockCompetitorScore(i)),
    [competitors],
  )
  const userScoreValue = yourScore ?? 0
  const competitorsAbove = competitorScores.filter((s) => s > userScoreValue).length
  const yourRank = competitorsAbove + 1
  const avgCompetitorScore =
    competitorScores.length > 0
      ? Math.round(competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length)
      : 0
  const gap = avgCompetitorScore - userScoreValue

  // Market position bars data (you + competitors, sorted desc)
  const positionItems = useMemo(() => {
    const items = [
      { label: 'You', score: userScoreValue, isUser: true },
      ...competitors.map((c, i) => ({ label: c.name, score: mockCompetitorScore(i), isUser: false })),
    ].sort((a, b) => b.score - a.score)
    return items
  }, [competitors, userScoreValue])

  const maxScore = Math.max(...positionItems.map((i) => i.score), 1)

  // Share of voice donut data
  const totalScore = positionItems.reduce((sum, i) => sum + i.score, 0)
  const voiceData = positionItems.slice(0, 5).map((item) => ({
    name: item.label,
    value: totalScore > 0 ? Math.round((item.score / totalScore) * 100) : 0,
    isUser: item.isUser,
  }))
  const voiceColors = voiceData.map((d) => (d.isUser ? ACCENT : '#D1D5DB'))

  // Gap analysis: engines where competitors outperform you
  const gapItems = competitors.slice(0, 3).map((comp, i) => {
    const compScore = mockCompetitorScore(i)
    const delta = compScore - userScoreValue
    return { name: comp.name, compScore, yourScore: userScoreValue, delta }
  }).filter((g) => g.delta > 0)

  const handleAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim() || !domain.trim()) return
      if (!businessId) {
        setAddError('No business found. Complete onboarding first.')
        return
      }
      setIsAdding(true)
      setAddError(null)
      try {
        const res = await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), domain: domain.trim(), business_id: businessId }),
        })
        if (!res.ok) {
          const data = await res.json()
          setAddError((data as { error?: string }).error ?? 'Failed to add competitor')
          return
        }
        setName('')
        setDomain('')
        startTransition(() => router.refresh())
      } catch {
        setAddError('Network error. Please try again.')
      } finally {
        setIsAdding(false)
      }
    },
    [name, domain, businessId, router, startTransition],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id)
      setConfirmDeleteId(null)
      try {
        const res = await fetch(`/api/competitors/${id}`, { method: 'DELETE' })
        if (res.ok) startTransition(() => router.refresh())
      } finally {
        setDeletingId(null)
      }
    },
    [router, startTransition],
  )

  const competitorColumns: ColumnDef<Competitor & { rank: number; score: number }>[] = [
    {
      header: '#',
      accessorKey: 'rank',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="text-xs font-medium tabular-nums" style={{ color: TEXT_MUTED }}>
          {row.original.rank}
        </span>
      ),
    },
    {
      header: 'Business',
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ backgroundColor: ACCENT }}
            aria-hidden="true"
          >
            {row.original.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{row.original.name}</span>
        </span>
      ),
    },
    {
      header: 'Domain',
      accessorKey: 'domain',
      cell: ({ row }) =>
        row.original.domain ? (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: TEXT_MUTED }}>
            <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
            {row.original.domain}
          </span>
        ) : (
          <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
        ),
    },
    {
      header: 'Score',
      accessorKey: 'score',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="flex items-center justify-end gap-2">
          <div className="w-14 h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full"
              style={{ width: `${row.original.score}%`, backgroundColor: '#D1D5DB' }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums w-7 text-right" style={{ color: TEXT_PRIMARY }}>
            {row.original.score}
          </span>
        </span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      meta: { align: 'right' },
      cell: ({ row }) => {
        const id = row.original.id
        const isConfirming = confirmDeleteId === id
        return (
          <span className="flex items-center justify-end gap-2">
            {isConfirming ? (
              <>
                <button
                  onClick={() => handleDelete(id)}
                  disabled={deletingId === id}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                  aria-label={`Confirm remove ${row.original.name}`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-xs"
                  style={{ color: TEXT_MUTED }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(id)}
                disabled={deletingId === id}
                className="rounded-md p-1.5 transition-colors hover:bg-red-50 hover:text-red-600 text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] disabled:opacity-50"
                aria-label={`Remove ${row.original.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </span>
        )
      },
    },
  ]

  const tableRows = competitors.map((comp, i) => ({ ...comp, rank: i + 1, score: mockCompetitorScore(i) }))

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tracked Competitors"
          value={competitors.length}
          subtitle="actively monitored"
          icon={<Users />}
        />
        <StatCard
          label="Your Rank"
          value={competitors.length > 0 ? `#${yourRank}` : '—'}
          subtitle={competitors.length > 0 ? `of ${competitors.length + 1} tracked` : 'add competitors to rank'}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Average Gap"
          value={competitors.length > 0 ? (gap >= 0 ? `+${gap}` : `${gap}`) : '—'}
          subtitle={competitors.length > 0 ? 'pts vs competitors avg' : 'add competitors to compare'}
          scoreColor={gap > 0 ? '#EF4444' : gap < 0 ? '#10B981' : undefined}
          icon={<BarChart3 />}
        />
      </div>

      {/* Add competitor form */}
      <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Add Competitor</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <form onSubmit={handleAdd}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-enhanced flex-1"
                required
                aria-label="Competitor company name"
              />
              <input
                type="text"
                placeholder="domain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="input-enhanced flex-1"
                required
                aria-label="Competitor domain"
              />
              <Button
                type="submit"
                disabled={isAdding}
                className="shrink-0 rounded-[6px] text-xs font-medium"
                style={{ backgroundColor: TEXT_PRIMARY, color: '#FFFFFF' }}
                aria-label="Add competitor"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {isAdding ? 'Adding…' : 'Add'}
              </Button>
            </div>
            {addError && (
              <p className="mt-2 text-sm text-red-600" role="alert">{addError}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {competitors.length > 0 && (
        <>
          {/* Market position bars */}
          <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                    Market Position
                  </CardTitle>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                    AI visibility score comparison
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: TEXT_MUTED }}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} aria-hidden="true" />
                    You
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" aria-hidden="true" />
                    Competitors
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="space-y-0">
                {positionItems.map((item, i) => (
                  <MarketPositionBar
                    key={item.label + i}
                    label={item.label}
                    score={item.score}
                    maxScore={maxScore}
                    isUser={item.isUser}
                    index={i}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Head-to-head + Share of voice (grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Head-to-head */}
            <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                  Head-to-Head
                </CardTitle>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                  You vs top competitor
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <HeadToHead
                  yourScore={userScoreValue}
                  topCompetitor={competitors[0] ?? null}
                  topScore={mockCompetitorScore(0)}
                />
              </CardContent>
            </Card>

            {/* Share of voice */}
            <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                  Share of Voice
                </CardTitle>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                  AI visibility distribution
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <ShareOfVoice data={voiceData} colors={voiceColors} />
              </CardContent>
            </Card>
          </div>

          {/* Gap analysis */}
          {gapItems.length > 0 && (
            <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: TEXT_PRIMARY }}>
                  <Target className="h-4 w-4 text-[#EF4444]" aria-hidden="true" />
                  Gap Analysis
                </CardTitle>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                  Where competitors outrank you — fix these to close the gap
                </p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-3">
                {gapItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4 rounded-lg p-3.5"
                    style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                        {item.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                        Outranks you by <span className="font-semibold text-[#EF4444]">+{item.delta} pts</span>
                        {' '}— score {item.compScore} vs your {item.yourScore}
                      </p>
                    </div>
                    <Button asChild size="sm" className="shrink-0 h-7 text-xs rounded-[6px]" style={{ backgroundColor: ACCENT, color: '#FFFFFF' }}>
                      <Link href="/dashboard/action-center">
                        Fix This
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Competitor table */}
          <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                Competitor Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-0">
              <DataTable
                columns={competitorColumns}
                data={tableRows}
                emptyMessage="No competitors to display."
              />
            </CardContent>
          </Card>
        </>
      )}

      {competitors.length === 0 && (
        <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="No competitors tracked yet"
              description="Add your first competitor above to start tracking their AI visibility and see how you compare."
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Market position bar ──────────────────────────────────────────────────────

interface MarketPositionBarProps {
  label: string
  score: number
  maxScore: number
  isUser: boolean
  index: number
}

function MarketPositionBar({ label, score, maxScore, isUser, index }: MarketPositionBarProps) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0

  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: '#F3F4F6' }}>
      <div className="w-28 shrink-0 min-w-0">
        <p className={cn('text-sm truncate', isUser ? 'font-semibold' : 'font-normal')} style={{ color: isUser ? TEXT_PRIMARY : TEXT_MUTED }}>
          {label}
        </p>
        {isUser && (
          <Badge
            className="mt-0.5 rounded-full px-1.5 py-0 text-[10px] font-semibold border-0 h-4"
            style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
          >
            You
          </Badge>
        )}
      </div>
      <div className="relative flex-1 h-2.5 overflow-hidden rounded-full bg-[#F3F4F6]">
        <AnimatedBarInner
          pct={pct}
          color={isUser ? ACCENT : '#D1D5DB'}
          delay={index * 80 + 200}
        />
      </div>
      <span
        className={cn('w-8 shrink-0 text-right text-sm tabular-nums', isUser ? 'font-bold' : 'font-normal')}
        style={{ color: isUser ? TEXT_PRIMARY : TEXT_MUTED }}
      >
        {score}
      </span>
    </div>
  )
}

interface AnimatedBarInnerProps { pct: number; color: string; delay: number }
function AnimatedBarInner({ pct, color, delay }: AnimatedBarInnerProps) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay)
    return () => clearTimeout(t)
  }, [pct, delay])
  return (
    <div
      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
      style={{ width: `${width}%`, backgroundColor: color, transitionDelay: `${delay}ms` }}
    />
  )
}

// ─── Head-to-head ─────────────────────────────────────────────────────────────

interface HeadToHeadProps {
  yourScore: number
  topCompetitor: Competitor | null
  topScore: number
}

function HeadToHead({ yourScore, topCompetitor, topScore }: HeadToHeadProps) {
  if (!topCompetitor) {
    return (
      <p className="text-sm text-center py-8" style={{ color: TEXT_MUTED }}>
        Add competitors to see head-to-head comparison.
      </p>
    )
  }

  const data = [
    { name: 'You', score: yourScore },
    { name: topCompetitor.name, score: topScore },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-around gap-4 h-36">
        {data.map((item, i) => {
          const maxH = 120
          const h = Math.max(8, Math.round((item.score / 100) * maxH))
          const isYou = i === 0
          return (
            <div key={item.name} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-lg font-bold tabular-nums" style={{ color: isYou ? ACCENT : TEXT_MUTED }}>
                {item.score}
              </span>
              <div
                className="w-full max-w-[64px] rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: h,
                  backgroundColor: isYou ? ACCENT : '#E5E7EB',
                  opacity: 0.9,
                }}
                role="img"
                aria-label={`${item.name}: score ${item.score}`}
              />
              <span className="text-xs font-medium text-center" style={{ color: isYou ? TEXT_PRIMARY : TEXT_MUTED }}>
                {item.name}
              </span>
            </div>
          )
        })}
      </div>
      {yourScore < topScore && (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#EFF6FF', border: `1px solid #BFDBFE` }}>
          <p className="text-xs font-medium" style={{ color: '#1D4ED8' }}>
            {topCompetitor.name} outranks you by {topScore - yourScore} points.{' '}
            <Link href="/dashboard/action-center" className="underline font-semibold">
              See what to fix
            </Link>
          </p>
        </div>
      )}
      {yourScore >= topScore && (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#F0FDF4', border: `1px solid #BBF7D0` }}>
          <p className="text-xs font-medium" style={{ color: '#15803D' }}>
            You outrank {topCompetitor.name} by {yourScore - topScore} points. Keep it up!
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Share of voice ───────────────────────────────────────────────────────────

interface ShareOfVoiceProps {
  data: Array<{ name: string; value: number; isUser: boolean }>
  colors: string[]
}

function ShareOfVoice({ data, colors }: ShareOfVoiceProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: TEXT_MUTED }}>
        Add competitors to see share of voice.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={64}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            animationBegin={300}
            animationDuration={CHART_ANIMATION.duration}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i] ?? '#D1D5DB'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col gap-2 flex-1">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: colors[i] ?? '#D1D5DB' }}
                aria-hidden="true"
              />
              <span className="truncate font-medium" style={{ color: item.isUser ? TEXT_PRIMARY : TEXT_MUTED }}>
                {item.name}
              </span>
            </span>
            <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: TEXT_PRIMARY }}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── My Rankings tab content ──────────────────────────────────────────────────

interface MyRankingsTabProps {
  scans: ScanItem[]
  latestDetails: EngineDetail[]
  queries: QueryItem[]
}

function MyRankingsTab({ scans, latestDetails, queries }: MyRankingsTabProps) {
  const latestScan = scans[0] ?? null
  const hasData = latestScan !== null

  // ── Derived stats ─────────────────────────────────────────────────────────
  const mentionedEngines = latestDetails.filter((d) => d.is_mentioned)
  const scoreVal = latestScan?.overall_score ?? null
  const scoreTrend =
    scans.length >= 2 &&
    scans[0].overall_score !== null &&
    scans[1].overall_score !== null
      ? scans[0].overall_score - scans[1].overall_score
      : null

  const positiveCount = latestDetails.filter((d) => d.sentiment === 'positive').length
  const neutralCount  = latestDetails.filter((d) => d.sentiment === 'neutral').length
  const negativeCount = latestDetails.filter((d) => d.sentiment === 'negative').length
  const sentimentTotal = positiveCount + neutralCount + negativeCount
  const positivePct = sentimentTotal > 0 ? Math.round((positiveCount / sentimentTotal) * 100) : 0

  const lastScannedLabel = latestScan
    ? formatDistanceToNow(new Date(latestScan.created_at), { addSuffix: true })
    : null

  // ── Chart data ────────────────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState('All')
  const periodOptions = ['All', '30d', '7d']

  const allChartData = useMemo(
    () =>
      scans
        .slice()
        .reverse()
        .map((s) => ({
          date: format(new Date(s.created_at), 'MMM d'),
          score: s.overall_score ?? 0,
          mentions: s.mentions_count ?? 0,
        })),
    [scans],
  )

  const chartData = useMemo(() => {
    if (chartPeriod === 'All') return allChartData
    const days = chartPeriod === '7d' ? 7 : 30
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return allChartData.filter((d) => new Date(d.date) >= cutoff)
  }, [allChartData, chartPeriod])

  const engines = [...new Set(latestDetails.map((d) => d.engine))]

  if (!hasData) {
    return (
      <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
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
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Hero KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visibility Score */}
        <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                Visibility Score
              </span>
              {scoreTrend !== null && <TrendBadge value={scoreTrend} suffix=" pts" size="sm" />}
            </div>
            <div className="flex items-center gap-4">
              <ScoreRing score={scoreVal} size="md" showLabel={false} animate />
              <div>
                <p className="text-3xl font-bold tabular-nums" style={{ color: TEXT_PRIMARY }}>
                  {scoreVal ?? '—'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>out of 100</p>
                {lastScannedLabel && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#9CA3AF' }}>
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{lastScannedLabel}</span>
                  </div>
                )}
              </div>
            </div>
            <Button asChild size="sm" className="w-full rounded-[6px] text-xs font-medium" style={{ backgroundColor: TEXT_PRIMARY, color: '#FFFFFF' }}>
              <Link href="/scan">
                <Zap className="h-3 w-3 mr-1.5" aria-hidden="true" />
                Rescan Now
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Engines mentioning */}
        <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
              Engines Mentioning
            </span>
            <div className="flex items-end gap-1.5 mt-2">
              <span className="text-4xl font-bold tabular-nums leading-none" style={{ color: TEXT_PRIMARY }}>
                {mentionedEngines.length}
              </span>
              <span className="text-xl font-medium pb-0.5" style={{ color: TEXT_MUTED }}>
                / {latestDetails.length}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mentionedEngines.length > 0
                ? mentionedEngines.map((d) => {
                    const label = PROVIDER_LABELS[d.engine as LlmProvider] ?? d.engine
                    return (
                      <span
                        key={d.id}
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                        style={{ backgroundColor: engineColor(d.engine) }}
                      >
                        {label}
                      </span>
                    )
                  })
                : (
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>No engines mention you yet</p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment */}
        <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
              Sentiment
            </span>
            <div className="flex items-end gap-1.5 mt-2">
              <span className="text-4xl font-bold tabular-nums leading-none" style={{ color: '#10B981' }}>
                {positivePct}%
              </span>
              <span className="text-sm pb-0.5" style={{ color: TEXT_MUTED }}>positive</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span style={{ color: TEXT_MUTED }}>Positive</span>
                </span>
                <span className="tabular-nums font-medium" style={{ color: TEXT_PRIMARY }}>{positiveCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden="true" />
                  <span style={{ color: TEXT_MUTED }}>Neutral</span>
                </span>
                <span className="tabular-nums font-medium" style={{ color: TEXT_PRIMARY }}>{neutralCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
                  <span style={{ color: TEXT_MUTED }}>Negative</span>
                </span>
                <span className="tabular-nums font-medium" style={{ color: TEXT_PRIMARY }}>{negativeCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Score history chart ───────────────────────────────────────────────── */}
      {scans.length > 1 && (
        <ChartCard
          title="Score History"
          subtitle={`${scans.length} scans tracked`}
          period={chartPeriod}
          periods={periodOptions}
          onPeriodChange={setChartPeriod}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={CHART_MARGINS.default}>
              <defs>
                <linearGradient id="scoreHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
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
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#scoreHistGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                animationDuration={CHART_ANIMATION.duration}
                animationEasing={CHART_ANIMATION.easing}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Engine performance table ──────────────────────────────────────────── */}
      <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                Performance by Engine
              </CardTitle>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                {latestDetails.length} engines scanned — click any row to expand
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-[6px]"
                style={{ borderColor: BORDER_COLOR, color: TEXT_MUTED }}
                onClick={() => exportEngineResultsCSV(latestDetails)}
                aria-label="Export rankings as CSV"
              >
                <Download className="h-3 w-3 mr-1.5" aria-hidden="true" />
                Export CSV
              </Button>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-[6px]" style={{ borderColor: BORDER_COLOR, color: TEXT_MUTED }}>
                <Link href="/scan">
                  <ScanSearch className="h-3 w-3 mr-1.5" aria-hidden="true" />
                  Rescan
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {latestDetails.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm" style={{ color: TEXT_MUTED }}>No engine data available. Run a scan to see detailed results.</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div
                className="flex items-center gap-4 px-5 py-2.5 border-b"
                style={{ borderColor: BORDER_COLOR, backgroundColor: '#F9FAFB' }}
              >
                <div className="w-36 shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Engine</span>
                </div>
                <div className="w-24 shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Status</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Score</span>
                </div>
                <div className="w-24 shrink-0 text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Sentiment</span>
                </div>
                <div className="w-10 shrink-0 text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Pos.</span>
                </div>
                <div className="w-6 shrink-0" aria-hidden="true" />
              </div>
              <div role="list" aria-label="Engine performance">
                {latestDetails.map((detail, i) => (
                  <EngineRow key={detail.id} detail={detail} index={i} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Query performance ────────────────────────────────────────────────── */}
      <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: TEXT_PRIMARY }}>
                <Search className="h-4 w-4" style={{ color: ACCENT }} aria-hidden="true" />
                Query Performance
              </CardTitle>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                Per-query results across engines
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          <QueryPerformanceGrid queries={queries} engines={engines} />
        </CardContent>
      </Card>

      {/* ── What AI Says About You ────────────────────────────────────────────── */}
      <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: TEXT_PRIMARY }}>
                <MessageSquare className="h-4 w-4" style={{ color: ACCENT }} aria-hidden="true" />
                What AI Says About You
              </CardTitle>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                AI engine responses mentioning your business
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0 pb-0">
          <QuoteCards details={latestDetails} />
        </CardContent>
      </Card>

      {/* ── Scan history ─────────────────────────────────────────────────────── */}
      <Card className="rounded-[8px]" style={{ border: `1px solid ${BORDER_COLOR}` }}>
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: TEXT_PRIMARY }}>
                <Activity className="h-4 w-4" style={{ color: ACCENT }} aria-hidden="true" />
                Scan History
              </CardTitle>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
                Last {Math.min(scans.length, 10)} scans
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {scans.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: TEXT_MUTED }}>No scan history yet.</p>
          ) : (
            <div className="space-y-0">
              {scans.slice(0, 10).map((scan, i) => {
                const prevScore = scans[i + 1]?.overall_score ?? null
                const delta =
                  prevScore !== null && scan.overall_score !== null
                    ? scan.overall_score - prevScore
                    : null
                return (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between py-2.5 border-b last:border-0"
                    style={{ borderColor: '#F3F4F6' }}
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status="completed" size="sm" />
                      <span className="text-sm" style={{ color: TEXT_PRIMARY }}>
                        {format(new Date(scan.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs" style={{ color: TEXT_MUTED }}>
                        {scan.mentions_count ?? 0} mentions
                      </span>
                      {delta !== null && <TrendBadge value={delta} suffix=" pts" size="sm" />}
                      <span className="text-sm font-bold tabular-nums" style={{ color: scan.overall_score !== null && scan.overall_score >= 70 ? '#10B981' : scan.overall_score !== null && scan.overall_score >= 40 ? '#F59E0B' : '#EF4444' }}>
                        {scan.overall_score ?? '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── RankingsView (root) ──────────────────────────────────────────────────────

export function RankingsView({
  scans,
  latestDetails,
  queries,
  competitors = [],
  businessId = null,
}: RankingsViewProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const activeTab: TabId =
    searchParams.get('tab') === 'competitors' ? 'competitors' : 'rankings'

  const handleTabChange = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'rankings') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const yourScore = scans[0]?.overall_score ?? null

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: TEXT_PRIMARY }}>
          Rankings &amp; Visibility
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: TEXT_MUTED }}>
          Track how your business appears across AI search engines.
        </p>
      </div>

      {/* Tab bar */}
      <div className="animate-fade-up [animation-delay:40ms]">
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Tab panels */}
      <div
        id={`tabpanel-rankings`}
        role="tabpanel"
        aria-labelledby="tab-rankings"
        hidden={activeTab !== 'rankings'}
        className="animate-fade-up [animation-delay:80ms]"
      >
        {activeTab === 'rankings' && (
          <MyRankingsTab scans={scans} latestDetails={latestDetails} queries={queries} />
        )}
      </div>

      <div
        id={`tabpanel-competitors`}
        role="tabpanel"
        aria-labelledby="tab-competitors"
        hidden={activeTab !== 'competitors'}
        className="animate-fade-up [animation-delay:80ms]"
      >
        {activeTab === 'competitors' && (
          <CompetitorsTab
            competitors={competitors}
            businessId={businessId}
            yourScore={yourScore}
          />
        )}
      </div>
    </div>
  )
}
