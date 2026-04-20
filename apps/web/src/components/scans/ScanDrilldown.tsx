'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, getScoreColor } from '@/lib/utils'
import { ENGINE_CONFIG } from './ScansClient'

// ─── Prop types (exported for the server page to import) ──────────────────────

export interface ScanPageScan {
  id: string
  businessId: string
  overallScore: number | null
  startedAt: string
  completedAt: string | null
  status: 'running' | 'completed' | 'failed'
  enginesQueried: string[]
  enginesScanned: string[]
  scanType: 'initial' | 'manual' | 'scheduled'
  mentionsCount: number
}

export interface ScanPageEngineResult {
  id: string
  engine: string
  isMentioned: boolean
  rankPosition: number | null
  sentimentScore: number | null
  mentionContext: string | null
  competitorsMentioned: string[]
  queriesChecked: number
  queriesMentioned: number
}

export interface ScanPagePrevScan {
  id: string
  overallScore: number | null
  startedAt: string
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

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-3">
      {children}
    </p>
  )
}

// ─── Engine summary row ────────────────────────────────────────────────────────

interface EngineRowProps {
  result: ScanPageEngineResult
  index: number
}

function EngineRow({ result, index }: EngineRowProps) {
  const config = ENGINE_CONFIG.find((e) => e.key === result.engine)
  const label = config?.label ?? result.engine
  const color = config?.color ?? '#9CA3AF'

  const mentionRate =
    result.queriesChecked > 0
      ? Math.round((result.queriesMentioned / result.queriesChecked) * 100)
      : 0

  const barColor =
    mentionRate >= 60 ? '#3370FF' : mentionRate >= 35 ? '#F59E0B' : mentionRate > 0 ? '#EF4444' : '#E5E7EB'
  const textColor =
    mentionRate >= 60
      ? 'text-[#3370FF]'
      : mentionRate >= 35
        ? 'text-amber-600'
        : mentionRate > 0
          ? 'text-red-500'
          : 'text-gray-300'

  const sentimentColor =
    result.sentimentScore !== null
      ? result.sentimentScore >= 0.6
        ? 'text-emerald-600'
        : result.sentimentScore >= 0.35
          ? 'text-amber-600'
          : 'text-red-500'
      : 'text-gray-300'

  return (
    <motion.div
      key={result.engine}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: 0.06 + index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <div className="flex items-center gap-3 py-2.5">
        <div className="w-28 shrink-0 flex items-center gap-1.5">
          <span
            className="block size-[6px] rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium text-gray-700 truncate">{label}</span>
        </div>

        <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${mentionRate}%` }}
            transition={{
              duration: 0.5,
              delay: 0.1 + index * 0.04,
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
          {mentionRate > 0 ? `${mentionRate}%` : '—'}
        </span>

        <span className="hidden w-16 shrink-0 text-right text-xs text-gray-400 font-mono sm:block">
          {result.rankPosition !== null ? `#${result.rankPosition}` : '—'}
        </span>

        <span
          className={cn(
            'hidden w-16 shrink-0 text-right text-xs font-mono sm:block',
            sentimentColor,
          )}
        >
          {result.sentimentScore !== null ? result.sentimentScore.toFixed(2) : '—'}
        </span>
      </div>
      <div className="h-px bg-gray-50 group-last:hidden" />
    </motion.div>
  )
}

// ─── Engine breakdown table ───────────────────────────────────────────────────

type SortKey = 'engine' | 'mentionRate' | 'rank' | 'sentiment'

function EngineBreakdownTable({ results }: { results: ScanPageEngineResult[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>('mentionRate')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = React.useMemo(() => {
    return [...results].sort((a, b) => {
      let diff = 0
      if (sortKey === 'engine') diff = a.engine.localeCompare(b.engine)
      else if (sortKey === 'mentionRate') {
        const rateA = a.queriesChecked > 0 ? a.queriesMentioned / a.queriesChecked : 0
        const rateB = b.queriesChecked > 0 ? b.queriesMentioned / b.queriesChecked : 0
        diff = rateA - rateB
      } else if (sortKey === 'rank') {
        diff = (a.rankPosition ?? 999) - (b.rankPosition ?? 999)
      } else if (sortKey === 'sentiment') {
        diff = (a.sentimentScore ?? -1) - (b.sentimentScore ?? -1)
      }
      return sortDir === 'asc' ? diff : -diff
    })
  }, [results, sortKey, sortDir])

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <ChevronsUpDown className="size-3 text-gray-300" aria-hidden="true" />
    return sortDir === 'desc' ? (
      <ChevronDown className="size-3 text-gray-600" aria-hidden="true" />
    ) : (
      <ChevronUp className="size-3 text-gray-600" aria-hidden="true" />
    )
  }

  function ColHeader({ label, col, className }: { label: string; col: SortKey; className?: string }) {
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

  if (results.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-4 text-center">
        No engine results for this scan yet.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-3">
        <ColHeader label="Engine" col="engine" className="w-28 shrink-0" />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Mention rate
        </span>
        <ColHeader label="Rate" col="mentionRate" className="w-12 shrink-0 justify-end" />
        <ColHeader label="Avg rank" col="rank" className="hidden w-16 shrink-0 justify-end sm:flex" />
        <ColHeader label="Sentiment" col="sentiment" className="hidden w-16 shrink-0 justify-end sm:flex" />
      </div>
      {sorted.map((result, i) => (
        <EngineRow key={result.id} result={result} index={i} />
      ))}
    </div>
  )
}

// ─── Competitors spotted section ──────────────────────────────────────────────

function CompetitorsSection({ engineResults }: { engineResults: ScanPageEngineResult[] }) {
  // Aggregate competitors mentioned across all engine results
  const competitorCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const er of engineResults) {
      for (const comp of er.competitorsMentioned) {
        counts[comp] = (counts[comp] ?? 0) + 1
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [engineResults])

  if (competitorCounts.length === 0) {
    return <p className="text-xs text-gray-400">No competitors detected in this scan.</p>
  }

  return (
    <ul className="space-y-1.5">
      {competitorCounts.slice(0, 5).map(([name, count]) => (
        <li key={name} className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-700 truncate flex-1">{name}</span>
          <span className="text-[10px] font-mono text-gray-400 tabular-nums shrink-0">
            {count} engine{count !== 1 ? 's' : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ─── Main ScanDrilldown ───────────────────────────────────────────────────────

interface ScanDrilldownProps {
  scan: ScanPageScan
  engineResults: ScanPageEngineResult[]
  prevScan: ScanPagePrevScan | null
}

export function ScanDrilldown({ scan, engineResults, prevScan }: ScanDrilldownProps) {
  // Compute score delta vs previous scan
  const scoreDelta =
    prevScan?.overallScore !== null && prevScan?.overallScore !== undefined && scan.overallScore !== null
      ? scan.overallScore - prevScan.overallScore
      : null

  const mentionedCount = engineResults.filter((er) => er.isMentioned).length
  const totalEngines = Math.max(engineResults.length, scan.enginesQueried.length, 1)

  function handleExport() {
    window.open(`/api/scans/${scan.id}/pdf`, '_blank')
  }

  return (
    <main className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">

      {/* ── Back nav ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All scans
        </Link>
      </div>

      {/* ── Scan header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 rounded-xl border border-gray-100 bg-white p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900">
              We checked {scan.enginesQueried.length > 0 ? scan.enginesQueried.length : totalEngines} AI engines — here's what we found
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {formatDatetime(scan.startedAt)}
              {prevScan && (
                <span className="ml-2 text-gray-400">
                  · prev scan {relativeTime(prevScan.startedAt)}
                </span>
              )}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Score</p>
            <div className="mt-0.5 flex items-baseline justify-end gap-1.5">
              <span
                className="text-2xl font-bold tabular-nums"
                style={{
                  color: scan.overallScore !== null ? getScoreColor(scan.overallScore) : '#9CA3AF',
                }}
              >
                {scan.overallScore ?? '—'}
              </span>
              {scoreDelta !== null && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    scoreDelta > 0
                      ? 'text-emerald-600'
                      : scoreDelta < 0
                        ? 'text-red-500'
                        : 'text-gray-400',
                  )}
                >
                  {scoreDelta > 0 ? (
                    <TrendingUp className="size-3" aria-hidden="true" />
                  ) : scoreDelta < 0 ? (
                    <TrendingDown className="size-3" aria-hidden="true" />
                  ) : (
                    <Minus className="size-3" aria-hidden="true" />
                  )}
                  <span>
                    {scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`}
                  </span>
                </span>
              )}
            </div>
            {scan.overallScore !== null && (
              <p
                className="text-[11px] font-medium mt-0.5"
                style={{ color: getScoreColor(scan.overallScore) }}
              >
                {scan.overallScore >= 75
                  ? 'Excellent'
                  : scan.overallScore >= 50
                    ? 'Good'
                    : scan.overallScore >= 25
                      ? 'Fair'
                      : 'Critical'}
              </p>
            )}
          </div>
        </div>

        {/* Summary chips */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-1">
            <CheckCircle2 className="size-3 text-emerald-600" aria-hidden="true" />
            <span className="text-[11px] font-medium text-emerald-700">
              {mentionedCount} engine{mentionedCount !== 1 ? 's' : ''} mentioned you
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2 py-1">
            <XCircle className="size-3 text-red-500" aria-hidden="true" />
            <span className="text-[11px] font-medium text-red-600">
              {totalEngines - mentionedCount} missed you
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            {scan.enginesScanned.length}/{Math.max(scan.enginesQueried.length, scan.enginesScanned.length)} engines completed
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
      </motion.div>

      {/* ── Engine breakdown ──────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 rounded-xl border border-gray-100 bg-white p-5"
        aria-label="Engine mention breakdown"
      >
        <SectionLabel>Engine breakdown</SectionLabel>
        {/* W6 will add EngineBreakdownTable component here */}
        <EngineBreakdownTable results={engineResults} />
      </motion.section>

      {/* ── Query-by-query breakdown ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 rounded-xl border border-gray-100 bg-white p-5"
        aria-label="Query-by-query breakdown"
      >
        <SectionLabel>Query breakdown</SectionLabel>
        {/* W6 will add QueryByQueryTable component here */}
        <p className="text-xs text-gray-400">
          Query-level data will be available here (W6 component).
        </p>
      </motion.section>

      {/* ── Sentiment distribution ────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 rounded-xl border border-gray-100 bg-white p-5"
        aria-label="Sentiment distribution"
      >
        <SectionLabel>Sentiment distribution</SectionLabel>
        {/* W6 will add SentimentHistogram component here */}
        <p className="text-xs text-gray-400">
          Sentiment histogram will be available here (W6 component).
        </p>
      </motion.section>

      {/* ── Competitors spotted ───────────────────────────────────────────── */}
      {engineResults.some((er) => er.competitorsMentioned.length > 0) && (
        <motion.section
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 rounded-xl border border-gray-100 bg-white p-5"
          aria-label="Competitors mentioned"
        >
          <SectionLabel>Competitors spotted</SectionLabel>
          <CompetitorsSection engineResults={engineResults} />
        </motion.section>
      )}

      {/* ── Scan metadata ────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl border border-gray-100 bg-white p-5"
        aria-label="Scan metadata"
      >
        <SectionLabel>Details</SectionLabel>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] sm:grid-cols-3">
          <div>
            <dt className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Scan ID</dt>
            <dd className="mt-0.5 font-mono text-gray-600 truncate">{scan.id}</dd>
          </div>
          <div>
            <dt className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Type</dt>
            <dd className="mt-0.5 capitalize text-gray-700">{scan.scanType}</dd>
          </div>
          <div>
            <dt className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Status</dt>
            <dd className="mt-0.5 capitalize text-gray-700">{scan.status}</dd>
          </div>
          <div>
            <dt className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Total mentions</dt>
            <dd className="mt-0.5 tabular-nums font-mono text-gray-700">{scan.mentionsCount}</dd>
          </div>
          <div>
            <dt className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Completed</dt>
            <dd className="mt-0.5 text-gray-700">
              {scan.completedAt ? formatDatetime(scan.completedAt) : '—'}
            </dd>
          </div>
          {prevScan && (
            <div>
              <dt className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Prev score</dt>
              <dd
                className="mt-0.5 tabular-nums font-mono font-semibold"
                style={{
                  color: prevScan.overallScore !== null ? getScoreColor(prevScan.overallScore) : '#9CA3AF',
                }}
              >
                {prevScan.overallScore ?? '—'}
              </dd>
            </div>
          )}
        </dl>
      </motion.section>
    </main>
  )
}
