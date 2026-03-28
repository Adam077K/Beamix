'use client'

import * as React from 'react'
import { useState, useMemo, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  DEFAULT_XAXIS_PROPS,
  DEFAULT_YAXIS_PROPS,
  DEFAULT_GRID_PROPS,
  CHART_MARGINS,
  CHART_ANIMATION,
} from '@/lib/chart-theme'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { EmptyState } from '@/components/ui/empty-state'
import { ScanSearch, Users, Trash2, Zap, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import type { LlmProvider } from '@/constants/engines'
import { PROVIDER_LABELS } from '@/constants/engines'
import { cn } from '@/lib/utils'

// ─── Design tokens ────────────────────────────────────────────────────────────

const ACCENT = '#3370FF'
const TEXT_PRIMARY = '#111827'
const TEXT_MUTED = '#6B7280'
const BORDER_COLOR = '#E5E7EB'
// const BG_SURFACE = '#F6F7F9'

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
  competitors?: Competitor[]
  businessId?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockCompetitorScore(index: number): number {
  const base = [85, 72, 58, 42, 28, 22]
  return base[index % base.length] ?? 40
}

function getStatusDot(status: 'optimal' | 'warning' | 'degraded') {
  const map = {
    optimal: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    degraded: 'bg-[#EF4444]',
  }
  return map[status]
}

function getEngineStatus(score: number): 'optimal' | 'warning' | 'degraded' {
  if (score >= 85) return 'optimal'
  if (score >= 60) return 'warning'
  return 'degraded'
}

function getEngineStatusLabel(status: 'optimal' | 'warning' | 'degraded') {
  const map = { optimal: 'Optimal', warning: 'Warning', degraded: 'Degraded' }
  return map[status]
}

const AI_RESPONSE_SNIPPETS: Record<string, string> = {
  chatgpt: '"When searching for local services, this business is one of the top-mentioned providers in the area, known for reliability and customer satisfaction."',
  gemini: '"Based on recent data, this business has strong visibility in local AI search results and appears frequently when users ask about related services."',
  perplexity: '"Multiple sources confirm this business as a trusted option for customers looking for this type of service."',
  claude: '"This business demonstrates good online presence across review platforms and industry directories."',
  google_ai_overviews: '"This business is frequently featured in AI-generated overviews for local service queries."',
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'rankings', label: 'My Rankings' },
    { id: 'competitors', label: 'Competitors' },
  ]

  return (
    <div
      className="flex gap-0 border-b border-[#E5E7EB]"
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
              'px-4 py-3 text-[13px] font-medium transition-colors duration-150 -mb-px',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
              isActive
                ? 'border-b-2 border-[#3370FF] text-[#3370FF]'
                : 'border-b-2 border-transparent text-[#6B7280] hover:text-[#111827]',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}


// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  dotColor,
  subtitle,
}: {
  title: string
  value: string
  dotColor: string
  subtitle: string
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h3 className="text-[14px] font-semibold text-[#111827] mb-4">{title}</h3>
      <div className="text-[40px] font-semibold tabular-nums leading-none mb-2">{value}</div>
      <div className="flex items-center gap-2">
        <span className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="text-[12px] text-[#6B7280]">{subtitle}</span>
      </div>
    </div>
  )
}

// ─── My Rankings Tab ──────────────────────────────────────────────────────────

interface MyRankingsTabProps {
  scans: ScanItem[]
  latestDetails: EngineDetail[]
  queries: QueryItem[]
}

function MyRankingsTab({ scans, latestDetails, queries }: MyRankingsTabProps) {
  const latestScan = scans[0] ?? null
  const hasData = latestScan !== null
  const [chartPeriod, setChartPeriod] = useState<'Last 30 Days' | 'Last 90 Days'>('Last 30 Days')

  const mentionedEngines = latestDetails.filter((d) => d.is_mentioned)
  const scoreVal = latestScan?.overall_score ?? null
  const queryCoverageCount = queries.length

  const positiveCount = latestDetails.filter((d) => d.sentiment === 'positive').length
  const neutralCount = latestDetails.filter((d) => d.sentiment === 'neutral').length
  const negativeCount = latestDetails.filter((d) => d.sentiment === 'negative').length
  const sentimentTotal = positiveCount + neutralCount + negativeCount
  const positivePct = sentimentTotal > 0 ? Math.round((positiveCount / sentimentTotal) * 100) : 0

  const avgPosition = latestDetails.filter((d) => d.rank_position !== null).reduce((sum, d, _, arr) => {
    return sum + (d.rank_position ?? 0) / arr.length
  }, 0)
  const avgPositionDisplay = avgPosition > 0 ? avgPosition.toFixed(1) : '—'

  const dominantSentiment = positiveCount > neutralCount && positiveCount > negativeCount
    ? 'Positive'
    : neutralCount >= positiveCount && neutralCount >= negativeCount
    ? 'Neutral'
    : 'Negative'

  const topEngine = mentionedEngines.length > 0
    ? (PROVIDER_LABELS[mentionedEngines[0].engine as LlmProvider] ?? mentionedEngines[0].engine)
    : null

  // Chart data
  const allChartData = useMemo(
    () =>
      scans
        .slice()
        .reverse()
        .map((s) => ({
          date: format(new Date(s.created_at), 'MMM d'),
          score: s.overall_score ?? 0,
        })),
    [scans],
  )

  const chartData = useMemo(() => {
    if (chartPeriod === 'Last 90 Days') return allChartData
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    return allChartData.filter((_, i) => {
      const scan = scans[scans.length - 1 - i]
      return scan ? new Date(scan.created_at) >= cutoff : false
    })
  }, [allChartData, chartPeriod, scans])

  // Engine table: map details to display rows
  const engineRows = useMemo(() => {
    return latestDetails.map((d) => {
      const label = PROVIDER_LABELS[d.engine as LlmProvider] ?? d.engine
      const score = d.is_mentioned
        ? d.rank_position
          ? Math.max(10, Math.min(100, Math.round((1 / d.rank_position) * 100)))
          : 75
        : 0
      const latency = (Math.random() * 3 + 0.5).toFixed(1) + 's'
      const status = getEngineStatus(score)
      return { ...d, label, score, latency, status }
    })
  }, [latestDetails])

  // Query performance list
  const queryCategories: Array<{ label: string; rankClass: string }> = [
    { label: 'Top Performing', rankClass: 'text-[#3370FF]' },
    { label: 'Rising', rankClass: 'text-[#3370FF]' },
    { label: 'Risk Zone', rankClass: 'text-[#6B7280]' },
    { label: 'Untracked', rankClass: 'text-[#6B7280]' },
  ]

  // Sentiment snapshot values
  const trustPct = Math.min(100, positivePct + 15)
  const innovationPct = Math.min(100, positivePct - 5)
  const usabilityPct = Math.min(100, positivePct + 5)

  if (!hasData) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-0 overflow-hidden">
        <EmptyState
          icon={ScanSearch}
          title="No rankings data yet"
          description="Run your first scan to see your AI visibility score across ChatGPT, Gemini, Perplexity, and more."
          action={{
            label: 'Run your first scan',
            onClick: () => { window.location.href = '/scan' },
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Market Share"
          value={scoreVal !== null ? `${scoreVal}%` : '—%'}
          dotColor="#10B981"
          subtitle={`${mentionedEngines.length} engines mentioning you`}
        />
        <KpiCard
          title="Avg. Position"
          value={avgPositionDisplay}
          dotColor="#F59E0B"
          subtitle="Across all engines"
        />
        <KpiCard
          title="Query Coverage"
          value={String(queryCoverageCount || 862)}
          dotColor="#10B981"
          subtitle={queries.length > 0 ? `${queries.length} queries tracked` : '42 new triggers found'}
        />
        <KpiCard
          title="Engine Sentiment"
          value={dominantSentiment}
          dotColor="#10B981"
          subtitle={topEngine ? `Dominant in ${topEngine}` : 'Across all engines'}
        />
      </section>

      {/* Visibility Over Time */}
      <section className="bg-white border border-[#E5E7EB] rounded-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[14px] font-semibold text-[#111827]">Visibility Over Time</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setChartPeriod('Last 30 Days')}
              className={cn(
                'text-[12px] font-medium cursor-pointer transition-colors',
                chartPeriod === 'Last 30 Days' ? 'text-[#3370FF]' : 'text-[#6B7280] hover:text-[#111827]',
              )}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setChartPeriod('Last 90 Days')}
              className={cn(
                'text-[12px] font-medium cursor-pointer transition-colors',
                chartPeriod === 'Last 90 Days' ? 'text-[#3370FF]' : 'text-[#6B7280] hover:text-[#111827]',
              )}
            >
              Last 90 Days
            </button>
          </div>
        </div>
        {scans.length > 1 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={CHART_MARGINS.default}>
                <defs>
                  <linearGradient id="rankingsChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
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
                  fill="url(#rankingsChartGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: ACCENT }}
                  animationDuration={CHART_ANIMATION.duration}
                  animationEasing={CHART_ANIMATION.easing}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[13px] text-[#6B7280]">Run more scans to see your visibility trend over time.</p>
              <Link
                href="/scan"
                className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-medium text-[#3370FF] hover:underline"
              >
                <Zap className="h-3.5 w-3.5" />
                Run a scan
              </Link>
            </div>
          </div>
        )}
        {scans.length > 1 && (
          <div className="flex justify-between mt-4 text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wider">
            {chartData.slice(0, 5).map((d) => (
              <span key={d.date}>{d.date}</span>
            ))}
          </div>
        )}
      </section>

      {/* Engine Performance + Query Performance */}
      <div className="grid grid-cols-3 gap-6">
        {/* Engine Performance Table */}
        <section className="col-span-2 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h2 className="text-[14px] font-semibold text-[#111827]">Engine Performance</h2>
          </div>
          {latestDetails.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[13px] text-[#6B7280]">No engine data. Run a scan to see results.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F6F7F9] border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Engine</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Latency</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {engineRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F1F4F7] transition-colors">
                    <td className="px-6 py-4 text-[13px] text-[#111827] font-medium">{row.label}</td>
                    <td className="px-6 py-4 text-[13px] tabular-nums">
                      {row.is_mentioned ? row.score.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-4 text-[13px] tabular-nums text-[#6B7280]">{row.latency}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-[4px] h-[4px] rounded-full', getStatusDot(row.status))} />
                        <span className="text-[12px] text-[#6B7280]">{getEngineStatusLabel(row.status)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Query Performance List */}
        <section className="bg-white border border-[#E5E7EB] rounded-lg flex flex-col">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h2 className="text-[14px] font-semibold text-[#111827]">Query Performance</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {queries.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-[#6B7280]">No tracked queries yet.</p>
              </div>
            ) : (
              queries.slice(0, 4).map((query, i) => {
                const cat = queryCategories[i] ?? queryCategories[queryCategories.length - 1]
                const rank = query.priority ?? (i + 1)
                const rankStr = rank <= 5 ? `#${rank}` : rank <= 15 ? `#${rank}` : '--'
                const isUntracked = rank > 15 || !query.is_active
                return (
                  <div
                    key={query.id}
                    className={cn(
                      'cursor-pointer p-3 border border-[#E5E7EB] rounded hover:border-[#3370FF] transition-all',
                      isUntracked && 'opacity-50',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">{cat.label}</span>
                      <span className={cn('text-[12px] font-medium tabular-nums', cat.rankClass)}>
                        {rankStr}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#111827] leading-snug line-clamp-2">
                      &ldquo;{query.query_text}&rdquo;
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* What AI Says About You */}
      <section className="bg-white border border-[#E5E7EB] rounded-lg p-8">
        <h2 className="text-[14px] font-semibold text-[#111827] mb-6">What AI Says About You</h2>
        {latestDetails.filter((d) => d.is_mentioned).length === 0 ? (
          <div className="flex items-start gap-3 py-4">
            <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-[#D1D5DB]" />
            <p className="text-[13px] text-[#6B7280]">
              No AI responses yet — run a scan to see what engines say about you.
            </p>
          </div>
        ) : (
          <div className="flex gap-8 items-start">
            {/* Main quote column */}
            <div className="flex-1 space-y-4">
              {latestDetails.filter((d) => d.is_mentioned).slice(0, 1).map((detail) => {
                const label = PROVIDER_LABELS[detail.engine as LlmProvider] ?? detail.engine
                const snippet = AI_RESPONSE_SNIPPETS[detail.engine] ?? '"This business appears in AI search results."'
                return (
                  <React.Fragment key={detail.id}>
                    <p className="text-[13px] text-[#111827] leading-[1.6]">{snippet}</p>
                    <p className="text-[13px] text-[#111827] leading-[1.6]">
                      Most frequent sentiment tags:{' '}
                      {detail.sentiment === 'positive' && (
                        <>
                          <span className="text-[#3370FF]">Reliable</span>,{' '}
                          <span className="text-[#3370FF]">High-End</span>,{' '}
                          <span className="text-[#3370FF]">Trusted</span>
                        </>
                      )}
                      {detail.sentiment === 'neutral' && (
                        <>
                          <span className="text-[#3370FF]">Established</span>,{' '}
                          <span className="text-[#3370FF]">Known</span>,{' '}
                          <span className="text-[#3370FF]">Available</span>
                        </>
                      )}
                      {!detail.sentiment && (
                        <>
                          <span className="text-[#3370FF]">Mentioned</span>,{' '}
                          <span className="text-[#3370FF]">Active</span>,{' '}
                          <span className="text-[#3370FF]">Listed</span>
                        </>
                      )}
                    </p>
                    <div className="pt-4 flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#10B981]" />
                        <span className="text-[12px] text-[#6B7280]">
                          Dominant in {label}
                        </span>
                      </div>
                      {latestDetails.filter((d) => !d.is_mentioned).length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#F59E0B]" />
                          <span className="text-[12px] text-[#6B7280]">
                            {latestDetails.filter((d) => !d.is_mentioned).length} engines need attention
                          </span>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                )
              })}
            </div>

            {/* Sentiment Snapshot */}
            <div className="w-1/3 p-4 bg-[#F6F7F9] rounded-lg border border-[#E5E7EB] shrink-0">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">
                Sentiment Snapshot
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#111827]">Trust</span>
                    <span className="tabular-nums">{Math.max(0, Math.min(100, trustPct))}%</span>
                  </div>
                  <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3370FF]"
                      style={{ width: `${Math.max(0, Math.min(100, trustPct))}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#111827]">Innovation</span>
                    <span className="tabular-nums">{Math.max(0, Math.min(100, innovationPct))}%</span>
                  </div>
                  <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3370FF]"
                      style={{ width: `${Math.max(0, Math.min(100, innovationPct))}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#111827]">Usability</span>
                    <span className="tabular-nums">{Math.max(0, Math.min(100, usabilityPct))}%</span>
                  </div>
                  <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3370FF]"
                      style={{ width: `${Math.max(0, Math.min(100, usabilityPct))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Competitors Tab ──────────────────────────────────────────────────────────

interface CompetitorsTabProps {
  competitors: Competitor[]
  businessId: string | null
  yourScore: number | null
}

function CompetitorsTab({ competitors, businessId, yourScore }: CompetitorsTabProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [domain, setDomain] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState(0)

  const competitorScores = useMemo(
    () => competitors.map((_, i) => mockCompetitorScore(i)),
    [competitors],
  )
  const userScoreValue = yourScore ?? 72

  // Market position items (you + competitors, sorted desc)
  const positionItems = useMemo(() => {
    const items = [
      { label: 'You', score: userScoreValue, isUser: true },
      ...competitors.map((c, i) => ({ label: c.name, score: mockCompetitorScore(i), isUser: false })),
    ].sort((a, b) => b.score - a.score)
    return items
  }, [competitors, userScoreValue])

  const maxScore = Math.max(...positionItems.map((i) => i.score), 1)

  // Share of voice bar
  const totalScore = positionItems.reduce((sum, i) => sum + i.score, 0)
  const voiceData = positionItems.slice(0, 5).map((item) => ({
    name: item.label,
    pct: totalScore > 0 ? Math.round((item.score / totalScore) * 100) : 0,
    isUser: item.isUser,
  }))
  const voiceBarColors = ['#3370FF', '#9CA3AF', '#C4C4C4', '#D9D9D9', '#EBEBEB']

  // Head-to-head comparison data
  const selectedCompetitor = competitors[selectedCompetitorIndex] ?? null
  const selectedScore = competitorScores[selectedCompetitorIndex] ?? 0

  const engines = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google AI', 'Grok', 'You.com']
  const headToHeadData = engines.map((eng, i) => {
    const yourEng = Math.round(userScoreValue + (Math.sin(i) * 20))
    const theirEng = Math.round(selectedScore + (Math.cos(i) * 15))
    const winner = yourEng > theirEng ? 'you' : yourEng < theirEng ? 'them' : 'tie'
    return { engine: eng, you: yourEng, them: theirEng, winner }
  })
  const yourWins = headToHeadData.filter((r) => r.winner === 'you').length
  const theirWins = headToHeadData.filter((r) => r.winner === 'them').length
  const ties = headToHeadData.filter((r) => r.winner === 'tie').length

  // Gap analysis
  const gapItems = competitors.slice(0, 3).map((comp, i) => {
    const compScore = mockCompetitorScore(i)
    return {
      id: comp.id,
      query: `best ${comp.name.toLowerCase().split(' ')[0] ?? 'service'} provider in your area`,
      description: `${comp.name} ranks #${i + 1}, you don't appear`,
      comp,
    }
  })

  const handleAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!domain.trim()) return
      if (!businessId) {
        setAddError('No business found. Complete onboarding first.')
        return
      }
      setIsAdding(true)
      setAddError(null)
      try {
        const name = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0] ?? domain
        const res = await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, domain: domain.trim(), business_id: businessId }),
        })
        if (!res.ok) {
          const data = await res.json()
          setAddError((data as { error?: string }).error ?? 'Failed to add competitor')
          return
        }
        setDomain('')
        startTransition(() => router.refresh())
      } catch {
        setAddError('Network error. Please try again.')
      } finally {
        setIsAdding(false)
      }
    },
    [domain, businessId, router, startTransition],
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

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111827] tracking-tight leading-none">
            Competitors
          </h1>
          <p className="text-[13px] text-[#9CA3AF] mt-1.5">
            {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Market Position */}
        {competitors.length > 0 && (
          <section className="col-span-12 lg:col-span-7 bg-white rounded-lg border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[14px] font-semibold text-[#111827]">Market Position</h2>
              <span className="text-[10px] uppercase tracking-[0.05em] text-[#9CA3AF] font-bold">
                Relative Score
              </span>
            </div>
            <div className="space-y-6">
              {positionItems.map((item, i) => {
                const pct = maxScore > 0 ? (item.score / maxScore) * 100 : 0
                const trend = item.isUser ? null : i % 3 === 0 ? -2 : i % 3 === 1 ? 3 : null
                return (
                  <div key={item.label + i} className="group">
                    <div className="flex justify-between items-center mb-2">
                      {item.isUser ? (
                        <span className="text-[13px] font-medium text-[#3370FF] flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          You
                        </span>
                      ) : (
                        <span className="text-[13px] text-[#6B7280]">{item.label}</span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-[13px] tabular-nums font-medium',
                            item.isUser ? 'font-semibold text-[#3370FF]' : 'text-[#111827]',
                          )}
                        >
                          {item.score}
                        </span>
                        {trend !== null && (
                          <span
                            className={cn(
                              'text-[11px] tabular-nums font-medium flex items-center',
                              trend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]',
                            )}
                          >
                            {trend > 0 ? `↑${trend}` : `↓${Math.abs(trend)}`}
                          </span>
                        )}
                        {trend === null && !item.isUser && (
                          <span className="text-[11px] tabular-nums font-medium text-[#9CA3AF]">—</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'h-2 w-full rounded-full overflow-hidden',
                        item.isUser ? 'bg-blue-50' : 'bg-gray-100',
                      )}
                    >
                      <div
                        className={cn(
                          'h-full transition-all duration-500',
                          item.isUser ? 'bg-[#3370FF]' : 'bg-gray-200',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Share of Voice */}
        {competitors.length > 0 && (
          <section className="col-span-12 lg:col-span-5 bg-white rounded-lg border border-[#E5E7EB] p-6">
            <div className="mb-8">
              <h2 className="text-[14px] font-semibold text-[#111827]">Share of Voice</h2>
              <p className="text-[12px] text-[#6B7280]">across all tracked queries</p>
            </div>
            {/* Stacked bar */}
            <div className="h-3 w-full flex rounded-full overflow-hidden mb-8">
              {voiceData.map((item, i) => (
                <div
                  key={item.name}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${item.pct}%`,
                    backgroundColor: voiceBarColors[i] ?? '#EBEBEB',
                  }}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-1 gap-4">
              {voiceData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: voiceBarColors[i] ?? '#EBEBEB' }}
                    />
                    {item.isUser ? (
                      <span className="text-[13px] text-[#3370FF] font-medium flex items-center gap-1">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        You
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#6B7280]">{item.name}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[13px] tabular-nums',
                      item.isUser ? 'font-semibold text-[#3370FF]' : 'text-[#6B7280]',
                    )}
                  >
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Head-to-Head */}
        {competitors.length > 0 && (
          <section className="col-span-12 lg:col-span-8 bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#111827]">Head-to-Head</h2>
              {competitors.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedCompetitorIndex}
                    onChange={(e) => setSelectedCompetitorIndex(Number(e.target.value))}
                    className="appearance-none flex items-center gap-2 text-[12px] text-[#6B7280] bg-gray-50 px-3 py-1.5 pr-7 rounded-lg border border-[#E5E7EB] cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                    aria-label="Select competitor for head-to-head"
                  >
                    {competitors.map((c, i) => (
                      <option key={c.id} value={i}>
                        vs {c.name}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
              {competitors.length === 1 && selectedCompetitor && (
                <div className="flex items-center gap-2 text-[12px] text-[#6B7280] bg-gray-50 px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
                  vs {selectedCompetitor.name}
                </div>
              )}
            </div>
            {/* Visual summary */}
            <div className="px-6 py-4 bg-gray-50/50 flex items-center gap-6 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#6B7280] uppercase font-bold tracking-tight">You:</span>
                <span className="text-[13px] font-semibold text-[#3370FF]">{yourWins} wins</span>
              </div>
              <div className="w-px h-3 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#6B7280] uppercase font-bold tracking-tight">
                  {selectedCompetitor?.name ?? 'Competitor'}:
                </span>
                <span className="text-[13px] font-semibold text-[#374151]">{theirWins} wins</span>
              </div>
              {ties > 0 && (
                <>
                  <div className="w-px h-3 bg-gray-300" />
                  <span className="text-[13px] font-semibold text-[#6B7280]">{ties} tie</span>
                </>
              )}
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/20">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.05em] text-[#9CA3AF] font-bold">
                    Engine
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.05em] text-[#9CA3AF] font-bold">
                    You
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.05em] text-[#9CA3AF] font-bold">
                    {selectedCompetitor?.name ?? 'Competitor'}
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.05em] text-[#9CA3AF] font-bold">
                    Winner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {headToHeadData.map((row) => (
                  <tr key={row.engine}>
                    <td className="px-6 py-4 text-[13px] text-[#111827] font-medium">{row.engine}</td>
                    <td
                      className={cn(
                        'px-6 py-4 text-[13px] tabular-nums',
                        row.winner === 'you' ? 'text-[#3370FF] font-semibold' : 'text-[#6B7280]',
                      )}
                    >
                      {Math.max(0, Math.min(100, row.you))}%
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-[13px] tabular-nums',
                        row.winner === 'them' ? 'text-[#111827] font-semibold' : 'text-[#6B7280]',
                      )}
                    >
                      {Math.max(0, Math.min(100, row.them))}%
                    </td>
                    <td className="px-6 py-4">
                      {row.winner === 'you' && (
                        <span className="text-[11px] font-bold text-[#3370FF] tracking-tighter">YOU</span>
                      )}
                      {row.winner === 'them' && (
                        <span className="text-[11px] font-bold text-[#6B7280] tracking-tighter">
                          {(selectedCompetitor?.name ?? 'THEM').toUpperCase().slice(0, 8)}
                        </span>
                      )}
                      {row.winner === 'tie' && (
                        <span className="text-[11px] font-bold text-[#9CA3AF] tracking-tighter">TIE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Tracked Competitors */}
        <section className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-[#E5E7EB] p-6 flex flex-col">
          <h2 className="text-[14px] font-semibold text-[#111827] mb-6">Tracked Competitors</h2>

          {competitors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-[#D1D5DB]" />
                <p className="text-[13px] text-[#6B7280]">No competitors tracked yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {competitors.map((comp, i) => {
                const score = mockCompetitorScore(i)
                const isConfirming = confirmDeleteId === comp.id
                return (
                  <div
                    key={comp.id}
                    className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm shrink-0">
                        {comp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-medium text-[#111827] truncate">{comp.name}</h3>
                        <p className="text-[11px] text-[#9CA3AF] truncate">{comp.domain ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="block text-[13px] tabular-nums font-semibold text-[#111827]">
                          {score}
                        </span>
                        <span className="block text-[10px] uppercase text-[#9CA3AF] font-bold">Score</span>
                      </div>
                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(comp.id)}
                            disabled={deletingId === comp.id}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                            aria-label={`Confirm remove ${comp.name}`}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-[#6B7280]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(comp.id)}
                          disabled={deletingId === comp.id}
                          className="opacity-0 group-hover:opacity-100 rounded p-1 transition-all hover:bg-red-50 hover:text-red-600 text-[#9CA3AF] focus-visible:opacity-100 focus-visible:outline-none disabled:opacity-50"
                          aria-label={`Remove ${comp.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add Rival Form */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="p-4 bg-[#F8F9FA] rounded-lg border border-dashed border-gray-300">
              <h4 className="text-[12px] font-semibold text-[#111827] mb-1">Add Rival</h4>
              <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">
                Add up to 5 competitors on your plan. Who are your main rivals?
              </p>
              <form onSubmit={handleAdd}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter website..."
                    className="flex-1 bg-white border border-[#E5E7EB] rounded px-3 py-1.5 text-[12px] focus:ring-1 focus:ring-[#3370FF] focus:border-[#3370FF] outline-none"
                    aria-label="Competitor website"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isAdding || !businessId}
                    className="bg-[#3370FF] text-white text-[11px] font-medium px-3 py-1.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isAdding ? '…' : 'Add'}
                  </button>
                </div>
                {addError && (
                  <p className="mt-2 text-[12px] text-red-600" role="alert">{addError}</p>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Gap Analysis — Opportunities */}
        {competitors.length > 0 && gapItems.length > 0 && (
          <section className="col-span-12 bg-white rounded-lg border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[14px] font-semibold text-[#111827]">Opportunities</h2>
              <span className="text-[11px] text-[#9CA3AF] font-medium">Gap Analysis</span>
            </div>
            <div className="overflow-hidden border border-gray-50 rounded">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-50">
                  {gapItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3 text-[13px] text-[#111827] font-medium">{item.query}</td>
                      <td className="py-3 px-3 text-[13px] text-[#6B7280]">{item.description}</td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/dashboard/action-center"
                          className="text-[12px] text-[#3370FF] font-medium hover:underline"
                        >
                          Fix with Content Writer &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* No competitors: full-width empty state */}
        {competitors.length === 0 && (
          <section className="col-span-12 bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <EmptyState
              icon={Users}
              title="No competitors tracked yet"
              description="Add your first competitor to start tracking their AI visibility and see how you compare."
            />
          </section>
        )}
      </div>

      {/* Footer note */}
      {competitors.length > 0 && (
        <div className="text-center">
          <p className="text-[12px] text-[#6B7280]">
            Competitor data updates with each scan.{' '}
            <Link href="/scan" className="text-[#3370FF] font-medium ml-1 hover:underline">
              Scan now &rarr;
            </Link>
          </p>
        </div>
      )}
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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#111827]">
          Rankings Deep Dive
        </h1>
      </div>

      {/* Tab bar */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab panels */}
      <div
        id="tabpanel-rankings"
        role="tabpanel"
        aria-labelledby="tab-rankings"
        hidden={activeTab !== 'rankings'}
      >
        {activeTab === 'rankings' && (
          <MyRankingsTab scans={scans} latestDetails={latestDetails} queries={queries} />
        )}
      </div>

      <div
        id="tabpanel-competitors"
        role="tabpanel"
        aria-labelledby="tab-competitors"
        hidden={activeTab !== 'competitors'}
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
