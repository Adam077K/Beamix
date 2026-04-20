'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn, getScoreColor } from '@/lib/utils'
import type { ScanSummary } from '@/lib/types/shared'
import { ENGINE_CONFIG } from './ScansClient'
import type { ScanSummaryExtended, EngineStatus } from './ScansClient'

// ─── Mock query data ──────────────────────────────────────────────────────────

interface QueryRow {
  id: string
  text: string
  hits: Partial<Record<string, boolean>>
  bestRank: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
}

const MOCK_QUERIES: QueryRow[] = [
  {
    id: 'q1',
    text: 'best accountant in Tel Aviv for startups',
    hits: { chatgpt: true, gemini: true, perplexity: true, claude: false, aio: true, grok: false, youcom: false },
    bestRank: 2,
    sentiment: 'positive',
  },
  {
    id: 'q2',
    text: 'accounting firm startup equity Israel',
    hits: { chatgpt: true, gemini: false, perplexity: true, claude: true, aio: false, grok: false, youcom: true },
    bestRank: 3,
    sentiment: 'neutral',
  },
  {
    id: 'q3',
    text: 'bookkeeping services small business Tel Aviv',
    hits: { chatgpt: false, gemini: true, perplexity: false, claude: false, aio: false, grok: false, youcom: false },
    bestRank: 4,
    sentiment: 'positive',
  },
  {
    id: 'q4',
    text: 'CPA firm R&D tax grants Israel',
    hits: { chatgpt: true, gemini: true, perplexity: true, claude: true, aio: true, grok: true, youcom: true },
    bestRank: 1,
    sentiment: 'positive',
  },
  {
    id: 'q5',
    text: 'payroll services SMB Israel',
    hits: { chatgpt: false, gemini: false, perplexity: false, claude: false, aio: false, grok: false, youcom: false },
    bestRank: null,
    sentiment: null,
  },
  {
    id: 'q6',
    text: 'VAT consultation startup Israel',
    hits: { chatgpt: true, gemini: false, perplexity: true, claude: false, aio: false, grok: false, youcom: false },
    bestRank: 5,
    sentiment: 'neutral',
  },
  {
    id: 'q7',
    text: 'tax accountant recommendation near me',
    hits: { chatgpt: false, gemini: true, perplexity: false, claude: false, aio: true, grok: false, youcom: false },
    bestRank: 6,
    sentiment: 'negative',
  },
  {
    id: 'q8',
    text: 'audit services growth stage startup',
    hits: { chatgpt: true, gemini: true, perplexity: false, claude: true, aio: false, grok: false, youcom: false },
    bestRank: 3,
    sentiment: 'positive',
  },
]

// ─── Engine result rows ───────────────────────────────────────────────────────

interface EngineTableRow {
  key: string
  label: string
  color: string
  mentionRate: number
  avgRank: number | null
  sentimentScore: number | null
}

function buildEngineRows(engineStatus: EngineStatus): EngineTableRow[] {
  return ENGINE_CONFIG.map((e) => {
    const status = engineStatus[e.key] ?? 'not_tested'
    const seed = e.key.length
    const mentionRate =
      status === 'mentioned'
        ? Math.min(40 + seed * 7, 98)
        : status === 'not_mentioned'
          ? seed * 4
          : 0
    const avgRank = status === 'mentioned' ? +(1.5 + seed * 0.3).toFixed(1) : null
    const sentimentScore =
      status === 'mentioned' ? +(0.3 + seed * 0.08).toFixed(2) : null

    return { key: e.key, label: e.label, color: e.color, mentionRate, avgRank, sentimentScore }
  })
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDatetime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function countHits(hits: Partial<Record<string, boolean>>): number {
  return Object.values(hits).filter(Boolean).length
}

function sentimentMeta(s: QueryRow['sentiment']): { icon: string; color: string } {
  if (s === 'positive') return { icon: '+', color: 'text-emerald-600' }
  if (s === 'negative') return { icon: '−', color: 'text-red-500' }
  return { icon: '·', color: 'text-gray-400' }
}

// ─── Sentiment histogram ──────────────────────────────────────────────────────

function SentimentHistogram({ queries }: { queries: QueryRow[] }) {
  const buckets = [
    {
      label: 'Positive',
      count: queries.filter((q) => q.sentiment === 'positive').length,
      color: '#10B981',
    },
    {
      label: 'Neutral',
      count: queries.filter((q) => q.sentiment === 'neutral').length,
      color: '#9CA3AF',
    },
    {
      label: 'Negative',
      count: queries.filter((q) => q.sentiment === 'negative').length,
      color: '#EF4444',
    },
    {
      label: 'No data',
      count: queries.filter((q) => q.sentiment === null).length,
      color: '#E5E7EB',
    },
  ]
  const max = Math.max(...buckets.map((b) => b.count), 1)

  return (
    <div className="flex items-end gap-2 h-14" aria-label="Sentiment distribution">
      {buckets.map((b) => {
        const pct = (b.count / max) * 100
        return (
          <div key={b.label} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-mono text-gray-500 tabular-nums">
              {b.count}
            </span>
            <div
              className="w-full rounded-sm bg-gray-100 relative overflow-hidden"
              style={{ height: 28 }}
            >
              <div
                className="w-full absolute bottom-0 rounded-sm"
                style={{
                  height: `${Math.max(pct, b.count > 0 ? 8 : 0)}%`,
                  backgroundColor: b.color,
                }}
              />
            </div>
            <span className="text-[9px] text-gray-400">{b.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Engine breakdown table ───────────────────────────────────────────────────

function EngineBreakdownTable({ rows }: { rows: EngineTableRow[] }) {
  return (
    <div>
      {/* Column headers */}
      <div className="mb-1 flex items-center gap-3">
        <span className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Engine
        </span>
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Mention rate
        </span>
        <span className="w-12 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Rate
        </span>
        <span className="hidden w-16 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:block">
          Avg rank
        </span>
        <span className="hidden w-16 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:block">
          Sentiment
        </span>
      </div>

      {rows.map((row, i) => {
        const pct = row.mentionRate
        const barColor =
          pct >= 60 ? '#3370FF' : pct >= 35 ? '#F59E0B' : pct > 0 ? '#EF4444' : '#E5E7EB'
        const textColor =
          pct >= 60
            ? 'text-[#3370FF]'
            : pct >= 35
              ? 'text-amber-600'
              : pct > 0
                ? 'text-red-500'
                : 'text-gray-300'

        return (
          <motion.div
            key={row.key}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: 0.06 + i * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group"
          >
            <div className="flex items-center gap-3 py-2.5">
              <div className="w-28 shrink-0 flex items-center gap-1.5">
                <span
                  className="block size-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-xs font-medium text-gray-700 truncate">
                  {row.label}
                </span>
              </div>

              <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + i * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ backgroundColor: barColor }}
                />
              </div>

              <span
                className={cn(
                  'w-12 shrink-0 text-right text-xs font-semibold tabular-nums',
                  textColor,
                )}
              >
                {pct > 0 ? `${pct}%` : '—'}
              </span>

              <span className="hidden w-16 shrink-0 text-right text-xs text-gray-400 font-mono sm:block">
                {row.avgRank !== null ? `#${row.avgRank}` : '—'}
              </span>

              <span
                className={cn(
                  'hidden w-16 shrink-0 text-right text-xs font-mono sm:block',
                  row.sentimentScore !== null
                    ? row.sentimentScore >= 0.6
                      ? 'text-emerald-600'
                      : row.sentimentScore >= 0.35
                        ? 'text-amber-600'
                        : 'text-red-500'
                    : 'text-gray-300',
                )}
              >
                {row.sentimentScore !== null ? row.sentimentScore.toFixed(2) : '—'}
              </span>
            </div>
            <div className="h-px bg-gray-50 group-last:hidden" />
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Query table ──────────────────────────────────────────────────────────────

type QuerySortKey = 'text' | 'hits' | 'rank' | 'sentiment'

function QueryTable({ queries }: { queries: QueryRow[] }) {
  const [sortKey, setSortKey] = React.useState<QuerySortKey>('hits')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  function toggleSort(key: QuerySortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = React.useMemo(() => {
    return [...queries].sort((a, b) => {
      let diff = 0
      if (sortKey === 'hits') diff = countHits(a.hits) - countHits(b.hits)
      else if (sortKey === 'rank') diff = (a.bestRank ?? 999) - (b.bestRank ?? 999)
      else if (sortKey === 'sentiment') {
        const order: Record<string, number> = { positive: 2, neutral: 1, negative: 0 }
        diff = (order[a.sentiment ?? ''] ?? -1) - (order[b.sentiment ?? ''] ?? -1)
      } else if (sortKey === 'text') diff = a.text.localeCompare(b.text)
      return sortDir === 'asc' ? diff : -diff
    })
  }, [queries, sortKey, sortDir])

  function SortIcon({ col }: { col: QuerySortKey }) {
    if (sortKey !== col)
      return <ChevronsUpDown className="size-3 text-gray-300" aria-hidden="true" />
    return sortDir === 'desc' ? (
      <ChevronDown className="size-3 text-gray-600" aria-hidden="true" />
    ) : (
      <ChevronUp className="size-3 text-gray-600" aria-hidden="true" />
    )
  }

  function ColHeader({
    label,
    col,
    className,
  }: {
    label: string
    col: QuerySortKey
    className?: string
  }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className={cn(
          'flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400',
          'hover:text-gray-600 transition-colors duration-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded',
          className,
        )}
      >
        {label}
        <SortIcon col={col} />
      </button>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <ColHeader label="Query" col="text" className="flex-1 min-w-0" />
        <ColHeader label="Engines" col="hits" className="shrink-0 w-[58px]" />
        <ColHeader label="Rank" col="rank" className="hidden sm:flex shrink-0 w-10" />
        <ColHeader
          label="Tone"
          col="sentiment"
          className="hidden sm:flex shrink-0 w-8 justify-end"
        />
      </div>

      {sorted.map((q) => {
        const sm = sentimentMeta(q.sentiment)
        return (
          <div
            key={q.id}
            className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0"
          >
            <span className="flex-1 min-w-0 text-[11px] text-gray-700 leading-snug truncate">
              {q.text}
            </span>

            <div className="flex items-center gap-[2px] shrink-0 w-[58px]">
              {ENGINE_CONFIG.map((e) => (
                <span
                  key={e.key}
                  title={`${e.label}: ${q.hits[e.key] ? 'hit' : 'miss'}`}
                  className="block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: q.hits[e.key] ? e.color : '#E5E7EB',
                  }}
                />
              ))}
            </div>

            <span className="hidden sm:block w-10 text-right shrink-0 text-[11px] font-mono text-gray-400 tabular-nums">
              {q.bestRank !== null ? `#${q.bestRank}` : '—'}
            </span>

            <span
              className={cn('hidden sm:block w-8 text-right shrink-0 text-xs font-bold', sm.color)}
              aria-label={q.sentiment ?? 'no data'}
            >
              {sm.icon}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Gain / loss section ──────────────────────────────────────────────────────

function GainLossSection({ queries }: { queries: QueryRow[] }) {
  const appearing = queries.filter(
    (q) => countHits(q.hits) >= 4 && q.sentiment !== 'negative',
  )
  const dropped = queries.filter(
    (q) => countHits(q.hits) === 0 || q.sentiment === 'negative',
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-1 mb-2">
          <ArrowUpRight className="size-3 text-emerald-600 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-emerald-700">
            Appearing ({appearing.length})
          </span>
        </div>
        {appearing.length === 0 ? (
          <p className="text-[11px] text-gray-400">None this scan</p>
        ) : (
          <ul className="space-y-1">
            {appearing.slice(0, 3).map((q) => (
              <li
                key={q.id}
                className="text-[11px] text-gray-600 leading-snug truncate"
              >
                {q.text}
              </li>
            ))}
            {appearing.length > 3 && (
              <li className="text-[11px] text-gray-400">+{appearing.length - 3} more</li>
            )}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1 mb-2">
          <ArrowDownRight className="size-3 text-red-500 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-red-600">
            Dropped out ({dropped.length})
          </span>
        </div>
        {dropped.length === 0 ? (
          <p className="text-[11px] text-gray-400">None this scan</p>
        ) : (
          <ul className="space-y-1">
            {dropped.slice(0, 3).map((q) => (
              <li
                key={q.id}
                className="text-[11px] text-gray-600 leading-snug truncate"
              >
                {q.text}
              </li>
            ))}
            {dropped.length > 3 && (
              <li className="text-[11px] text-gray-400">+{dropped.length - 3} more</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-3">
      {children}
    </p>
  )
}

// ─── Main ScanDrilldown ───────────────────────────────────────────────────────

interface ScanDrilldownProps {
  scan: ScanSummaryExtended | ScanSummary | null
  onClose: () => void
}

export function ScanDrilldown({ scan, onClose }: ScanDrilldownProps) {
  const isOpen = scan !== null

  const extendedScan = scan as ScanSummaryExtended | null
  const engineStatus: EngineStatus = extendedScan?.engineStatus ?? {}

  const engineRows = React.useMemo(
    () => buildEngineRows(engineStatus),
    [engineStatus],
  )

  const queriesGained = React.useMemo(() => {
    if (scan?.scoreDelta == null) return 3
    return scan.scoreDelta > 0 ? scan.scoreDelta + 1 : 0
  }, [scan?.scoreDelta])

  const queriesLost = React.useMemo(() => {
    if (scan?.scoreDelta == null) return 1
    return scan.scoreDelta < 0 ? Math.abs(scan.scoreDelta) : 1
  }, [scan?.scoreDelta])

  const creditsConsumed = React.useMemo(() => {
    if (!scan?.id) return 0
    return 4 + (scan.id.length % 7)
  }, [scan?.id])

  function handleExport() {
    if (!scan?.id) return
    window.open(`/api/scans/${scan.id}/pdf`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-[640px] overflow-hidden p-0 gap-0 max-h-[90dvh] flex flex-col">
        <AnimatePresence>
          {scan && (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              {/* ── Header ──────────────────────────────────────────────── */}
              <div className="border-b border-gray-100 px-5 py-4 shrink-0">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4 pr-6">
                    <div className="min-w-0">
                      <DialogTitle className="text-sm font-semibold text-gray-900">
                        We checked 7 AI engines — here's what we found
                      </DialogTitle>
                      <DialogDescription className="mt-0.5 text-xs text-gray-500">
                        {formatDatetime(scan.startedAt)}
                      </DialogDescription>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        Score
                      </p>
                      <div className="mt-0.5 flex items-baseline justify-end gap-1.5">
                        <span
                          className="text-2xl font-bold tabular-nums"
                          style={{
                            color:
                              scan.score !== null
                                ? getScoreColor(scan.score)
                                : '#9CA3AF',
                          }}
                        >
                          {scan.score ?? '—'}
                        </span>
                        {scan.scoreDelta !== null && (
                          <span
                            className={cn(
                              'flex items-center gap-0.5 text-xs font-medium',
                              scan.scoreDelta > 0
                                ? 'text-emerald-600'
                                : scan.scoreDelta < 0
                                  ? 'text-red-500'
                                  : 'text-gray-400',
                            )}
                          >
                            {scan.scoreDelta > 0 ? (
                              <TrendingUp className="size-3" aria-hidden="true" />
                            ) : scan.scoreDelta < 0 ? (
                              <TrendingDown className="size-3" aria-hidden="true" />
                            ) : (
                              <Minus className="size-3" aria-hidden="true" />
                            )}
                            <span>
                              {scan.scoreDelta > 0
                                ? `+${scan.scoreDelta}`
                                : `${scan.scoreDelta}`}
                            </span>
                          </span>
                        )}
                      </div>
                      {scan.score !== null && (
                        <p
                          className="text-[11px] font-medium mt-0.5"
                          style={{ color: getScoreColor(scan.score) }}
                        >
                          {scan.score >= 75
                            ? 'Excellent'
                            : scan.score >= 50
                              ? 'Good'
                              : scan.score >= 25
                                ? 'Fair'
                                : 'Critical'}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                {/* Summary chips */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-1">
                    <CheckCircle2 className="size-3 text-emerald-600" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-emerald-700">
                      +{queriesGained} queries gained
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2 py-1">
                    <XCircle className="size-3 text-red-500" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-red-600">
                      -{queriesLost} queries lost
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {scan.enginesSucceeded}/{scan.enginesTotal} engines
                  </span>

                  <Button
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                    className="ml-auto h-6 px-2 text-[11px] gap-1 border-gray-200 text-gray-600 hover:text-gray-900"
                    aria-label="Export scan as PDF"
                  >
                    <Download className="size-3" aria-hidden="true" />
                    Export PDF
                  </Button>
                </div>
              </div>

              {/* ── Scrollable body ──────────────────────────────────────── */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">

                {/* Engine breakdown */}
                <section aria-label="Engine mention breakdown">
                  <SectionLabel>Engine breakdown</SectionLabel>
                  <EngineBreakdownTable rows={engineRows} />
                </section>

                {/* Query movement: gain / loss */}
                <section
                  aria-label="Queries appearing and dropped"
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <SectionLabel>Query movement</SectionLabel>
                  <GainLossSection queries={MOCK_QUERIES} />
                </section>

                {/* Query-by-query breakdown */}
                <section aria-label="Query-by-query breakdown">
                  <SectionLabel>Query breakdown</SectionLabel>
                  <QueryTable queries={MOCK_QUERIES} />
                </section>

                {/* Sentiment histogram */}
                <section aria-label="Sentiment distribution">
                  <SectionLabel>Sentiment distribution</SectionLabel>
                  <SentimentHistogram queries={MOCK_QUERIES} />
                </section>

                {/* Credits consumed */}
                <section
                  aria-label="Credits consumed this scan"
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-700">Credits consumed</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Agent tasks triggered by this scan
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-gray-900">
                    {creditsConsumed}
                  </span>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
