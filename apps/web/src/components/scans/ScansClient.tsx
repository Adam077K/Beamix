'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanIcon,
  ChevronRight,
  RefreshCw,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, getScoreColor } from '@/lib/utils'

// ─── Engine config ────────────────────────────────────────────────────────────

export const ENGINE_CONFIG = [
  { key: 'chatgpt', label: 'ChatGPT', color: '#10A37F' },
  { key: 'gemini', label: 'Gemini', color: '#4285F4' },
  { key: 'perplexity', label: 'Perplexity', color: '#20B2AA' },
  { key: 'claude', label: 'Claude', color: '#D97757' },
  { key: 'aio', label: 'AI Overviews', color: '#EA4335' },
  { key: 'grok', label: 'Grok', color: '#1DA1F2' },
  { key: 'youcom', label: 'You.com', color: '#7C3AED' },
] as const

export type EngineKey = (typeof ENGINE_CONFIG)[number]['key']

// ─── Real DB row shape ────────────────────────────────────────────────────────

/** Mapped from the `scans` Supabase table row. */
export interface ScanRow {
  id: string
  overallScore: number | null
  /** Computed client-side from previous scan comparison. null from server. */
  scoreDelta: number | null
  startedAt: string
  completedAt: string | null
  status: 'running' | 'completed' | 'failed'
  /** Array of engine keys queried, e.g. ['chatgpt', 'gemini', ...] */
  enginesQueried: string[]
  /** Array of engine keys that succeeded. Derived from engines_scanned column. */
  enginesScanned: string[]
  scanType: 'initial' | 'manual' | 'scheduled'
}

// ─── Legacy extended type (kept for ScanDrilldown dialog compatibility) ───────

/** @deprecated Use ScanRow for list; ScanDrilldown has its own props now. */
export type EngineStatus = Record<string, 'mentioned' | 'not_mentioned' | 'not_tested'>

// ─── Utilities ────────────────────────────────────────────────────────────────

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

function formatDayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'TODAY'
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY'

  // Check if within this week (Mon–Sun)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  if (date >= startOfWeek) return 'EARLIER THIS WEEK'

  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
    .format(date)
    .toUpperCase()
}

function scoreVerdict(score: number): {
  label: string
  textClass: string
  bgClass: string
  borderClass: string
} {
  if (score >= 75)
    return {
      label: 'Excellent',
      textClass: 'text-[#06B6D4]',
      bgClass: 'bg-[#06B6D4]/8',
      borderClass: 'border-[#06B6D4]/20',
    }
  if (score >= 50)
    return {
      label: 'Good',
      textClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
    }
  if (score >= 25)
    return {
      label: 'Fair',
      textClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
    }
  return {
    label: 'Critical',
    textClass: 'text-red-600',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
  }
}

function computeAvgScore(scans: ScanRow[]): number | null {
  const completed = scans.filter((s) => s.overallScore !== null && s.status === 'completed')
  if (completed.length === 0) return null
  const sum = completed.reduce((acc, s) => acc + (s.overallScore ?? 0), 0)
  return Math.round(sum / completed.length)
}

function computeScoreDelta(scans: ScanRow[]): number | null {
  const completed = scans.filter((s) => s.overallScore !== null && s.status === 'completed')
  if (completed.length < 2) return null
  const latest = completed[0]?.overallScore ?? 0
  const oldest = completed[completed.length - 1]?.overallScore ?? 0
  return latest - oldest
}

function buildLastScanCtx(scans: ScanRow[]): string {
  const latest = scans[0]
  if (!latest) return ''
  return relativeTime(latest.startedAt)
}

// ─── Score-over-time mini chart ───────────────────────────────────────────────

function ScoreOverTimeChart({ scans }: { scans: ScanRow[] }) {
  const points = scans
    .slice(0, 12)
    .reverse()
    .filter((s) => s.overallScore !== null)
    .map((s) => s.overallScore as number)

  if (points.length < 2) return null

  const W = 280
  const H = 36
  const padV = H * 0.1
  const lo = Math.max(0, Math.min(...points) - 5)
  const hi = Math.min(100, Math.max(...points) + 5)
  const range = hi - lo || 1

  const coords = points.map((v, i) => ({
    x: (i / (points.length - 1)) * W,
    y: H - padV - ((v - lo) / range) * (H - padV * 2),
  }))

  const polyline = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const first = coords[0]!
  const last = coords[coords.length - 1]!
  const area = `M ${polyline.replace(/,/g, ' ')} L ${last.x.toFixed(1)} ${H} L ${first.x.toFixed(1)} ${H} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: H }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sot-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3370FF" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#3370FF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sot-grad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#3370FF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Engine pips (5-7 dots showing which engines ran) ────────────────────────

function EnginePips({
  enginesQueried,
  enginesScanned,
}: {
  enginesQueried: string[]
  enginesScanned: string[]
}) {
  // Show up to 5 most-known engines
  const queried = enginesQueried.length > 0 ? enginesQueried : ENGINE_CONFIG.map((e) => e.key)
  const scannedSet = new Set(enginesScanned)

  return (
    <div className="flex items-center gap-[3px] shrink-0" aria-label="Engine coverage">
      {queried.slice(0, 7).map((engineKey) => {
        const config = ENGINE_CONFIG.find((e) => e.key === engineKey)
        const succeeded = scannedSet.has(engineKey)
        return (
          <span
            key={engineKey}
            title={`${config?.label ?? engineKey}: ${succeeded ? 'succeeded' : 'failed'}`}
            className="block rounded-full"
            style={{
              width: 7,
              height: 7,
              backgroundColor: succeeded ? (config?.color ?? '#3370FF') : '#EF4444',
              opacity: 1,
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Scan type badge ──────────────────────────────────────────────────────────

function ScanTypeBadge({ scanType }: { scanType: ScanRow['scanType'] }) {
  const labels: Record<ScanRow['scanType'], string> = {
    initial: 'Initial',
    manual: 'Manual',
    scheduled: 'Scheduled',
  }
  const colors: Record<ScanRow['scanType'], string> = {
    initial: 'bg-purple-50 text-purple-600 border-purple-200',
    manual: 'bg-blue-50 text-[#3370FF] border-blue-200',
    scheduled: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium leading-4',
        colors[scanType],
      )}
    >
      {labels[scanType]}
    </span>
  )
}

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ScanRow['status'] }) {
  if (status === 'completed') {
    return <span className="size-[7px] shrink-0 rounded-full bg-[#3370FF]" />
  }
  if (status === 'failed') {
    return <span className="size-[7px] shrink-0 rounded-full bg-red-500" />
  }
  return (
    <span className="relative flex size-[7px] shrink-0">
      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40 animate-ping" />
      <span className="relative inline-flex size-[7px] rounded-full bg-amber-400" />
    </span>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
      <span className="size-[7px] shrink-0 rounded-full bg-gray-200" />
      <div className="w-[88px] shrink-0 space-y-1">
        <div className="h-3 w-10 rounded bg-gray-200" />
        <div className="h-2.5 w-8 rounded bg-gray-100" />
      </div>
      <div className="hidden sm:flex w-[88px] shrink-0 gap-1.5 items-center">
        <div className="h-5 w-14 rounded bg-gray-200" />
      </div>
      <div className="hidden md:flex flex-1 items-center gap-4">
        <div className="flex gap-[3px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="size-[7px] rounded-full bg-gray-200" />
          ))}
        </div>
      </div>
      <div className="hidden lg:block w-14 h-4 rounded bg-gray-100 shrink-0" />
      <div className="ml-auto size-4 rounded bg-gray-100 shrink-0" />
    </div>
  )
}

// ─── Day separator ────────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5" role="separator">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400/70">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  )
}

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'completed' | 'running' | 'failed'

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
}

// ─── Main ScansClient ─────────────────────────────────────────────────────────

interface ScansClientProps {
  scans: ScanRow[]
  /** User's plan tier — used to gate manual re-scan CTA. null = no active plan. */
  planTier: 'discover' | 'build' | 'scale' | null
}

export function ScansClient({ scans, planTier }: ScansClientProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all')
  const [isLoading] = React.useState(false)

  // Discover plan cannot trigger manual re-scans
  const canRunManualScan = planTier !== null && planTier !== 'discover'

  function handleRunScan() {
    if (!canRunManualScan) return
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2500)
  }

  // KPI derivations
  const kpiTotalScans = scans.length
  const kpiAvgScore = computeAvgScore(scans)
  const kpiDelta = computeScoreDelta(scans)
  const lastScanCtx = scans.length > 0 ? buildLastScanCtx(scans) : null

  const counts = React.useMemo<Record<FilterKey, number>>(
    () => ({
      all: scans.length,
      completed: scans.filter((s) => s.status === 'completed').length,
      running: scans.filter((s) => s.status === 'running').length,
      failed: scans.filter((s) => s.status === 'failed').length,
    }),
    [scans],
  )

  const filteredScans = React.useMemo(() => {
    if (activeFilter === 'all') return scans
    return scans.filter((s) => s.status === activeFilter)
  }, [scans, activeFilter])

  // Group scans by date bucket: TODAY / YESTERDAY / EARLIER THIS WEEK / OLDER
  const grouped = React.useMemo(() => {
    const groups: Array<{
      dayKey: string
      label: string
      items: ScanRow[]
    }> = []
    let currentDayKey = ''
    for (const scan of filteredScans) {
      const dayKey = new Date(scan.startedAt).toDateString()
      if (dayKey !== currentDayKey) {
        currentDayKey = dayKey
        groups.push({ dayKey, label: formatDayLabel(scan.startedAt), items: [scan] })
      } else {
        groups[groups.length - 1].items.push(scan)
      }
    }
    return groups
  }, [filteredScans])

  const filterKeys = Object.keys(FILTER_LABELS) as FilterKey[]

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">

      {/* ── Page header + CTA ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Scans</h1>
          {scans.length > 0 && lastScanCtx ? (
            <p className="mt-0.5 text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {scans.length} scan{scans.length !== 1 ? 's' : ''}
              </span>
              {' · '}
              {lastScanCtx}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-gray-500">
              AI visibility across all engines
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {canRunManualScan ? (
            <Button
              onClick={handleRunScan}
              disabled={isRunning}
              size="sm"
              className="bg-[#3370FF] hover:bg-[#2558e0] active:scale-[0.98] transition-transform h-8 px-3 text-sm gap-1.5"
              aria-label="Run a new scan"
            >
              {isRunning ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  Running…
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Run scan now
                </>
              )}
            </Button>
          ) : planTier === 'discover' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-sm gap-1.5 text-gray-400 border-gray-200 cursor-not-allowed"
              disabled
              aria-label="Upgrade to run manual scans"
              title="Manual scans require Build or Scale plan"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Run scan now
            </Button>
          ) : null}
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Calendar className="size-3" aria-hidden="true" />
            <span>Next scheduled: Thursday</span>
          </div>
        </div>
      </div>

      {/* ── KPI strip + trend chart ───────────────────────────────────────── */}
      {scans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 rounded-xl border border-gray-100 bg-white overflow-hidden"
        >
          {/* KPI row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {/* Total scans */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">
                Total scans
              </p>
              <p className="text-2xl font-semibold tabular-nums text-gray-900 leading-tight">
                {kpiTotalScans}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">All time</p>
            </div>

            {/* Avg score */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">
                Avg score (30d)
              </p>
              <div className="flex items-baseline gap-1.5">
                <p
                  className="text-2xl font-semibold tabular-nums leading-tight"
                  style={{
                    color:
                      kpiAvgScore !== null ? getScoreColor(kpiAvgScore) : '#9CA3AF',
                  }}
                >
                  {kpiAvgScore ?? '—'}
                </p>
                {kpiAvgScore !== null && (
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: getScoreColor(kpiAvgScore) }}
                  >
                    {scoreVerdict(kpiAvgScore).label}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Visibility score</p>
            </div>

            {/* Delta */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">
                Score delta
              </p>
              <p
                className={cn(
                  'text-2xl font-semibold tabular-nums leading-tight',
                  kpiDelta === null
                    ? 'text-gray-400'
                    : kpiDelta > 0
                      ? 'text-emerald-600'
                      : kpiDelta < 0
                        ? 'text-red-500'
                        : 'text-gray-400',
                )}
              >
                {kpiDelta === null
                  ? '—'
                  : kpiDelta > 0
                    ? `+${kpiDelta}`
                    : `${kpiDelta}`}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Last vs oldest</p>
            </div>
          </div>

          {/* Score trend sparkline */}
          <div className="border-t border-gray-50 px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
              Score trend —{' '}
              {Math.min(
                scans.filter((s) => s.overallScore !== null).length,
                12,
              )}{' '}
              scans
            </p>
            <ScoreOverTimeChart scans={scans} />
          </div>
        </motion.div>
      )}

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      {scans.length > 0 && (
        <div
          className="mb-4 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Filter scans by status"
        >
          {filterKeys.map((key) => {
            const isActive = activeFilter === key
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800',
                )}
              >
                {FILTER_LABELS[key]}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {counts[key]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div
          className="mx-auto max-w-[860px] space-y-0.5"
          aria-busy="true"
          aria-label="Loading scans"
        >
          {[0, 1, 2, 3].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* ── Empty — no scans ─────────────────────────────────────────────── */}
      {!isLoading && scans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center py-20 text-center"
          role="status"
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <ScanIcon className="size-5 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-gray-900">Run your first check</p>
          <p className="mt-1 max-w-xs text-xs text-gray-500">
            Takes 90 seconds — we scan 7 AI engines and show you exactly where you show up.
          </p>
          {canRunManualScan && (
            <Button
              onClick={handleRunScan}
              className="mt-6 bg-[#3370FF] hover:bg-[#2558e0] active:scale-[0.98] transition-transform h-8 px-4"
              size="sm"
            >
              Run scan now
            </Button>
          )}
        </motion.div>
      )}

      {/* ── Empty filter state ────────────────────────────────────────────── */}
      {!isLoading && scans.length > 0 && filteredScans.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center py-12 text-center"
          role="status"
        >
          <p className="text-sm text-gray-500">
            No {FILTER_LABELS[activeFilter].toLowerCase()} scans
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-2 text-xs text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
          >
            View all
          </button>
        </motion.div>
      )}

      {/* ── Scan timeline ─────────────────────────────────────────────────── */}
      {!isLoading && filteredScans.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mx-auto max-w-[860px]"
          >
            <ol role="list" aria-label="Scan timeline">
              {grouped.map(({ dayKey, label, items }) => (
                <li key={dayKey}>
                  <DateSeparator label={label} />
                  <ol role="list">
                    {items.map((scan, index) => (
                      <ScanRow
                        key={scan.id}
                        scan={scan}
                        index={index}
                      />
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  )
}

// ─── Dense scan row ────────────────────────────────────────────────────────────

interface ScanRowProps {
  scan: ScanRow
  index: number
}

function ScanRow({ scan, index }: ScanRowProps) {
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(scan.startedAt))

  const verdict = scan.overallScore !== null ? scoreVerdict(scan.overallScore) : null

  return (
    <motion.li
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.25,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/scans/${scan.id}`}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-md px-2 py-2 text-left',
          'transition-colors duration-100 hover:bg-gray-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
        )}
        aria-label={`Scan from ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(scan.startedAt))}, score ${scan.overallScore ?? 'pending'}`}
      >
        {/* Status dot */}
        <StatusDot status={scan.status} />

        {/* Time column */}
        <div className="w-[80px] shrink-0 flex flex-col gap-px">
          <span className="text-[12px] font-mono font-medium text-gray-800 tabular-nums leading-tight">
            {time}
          </span>
          <span className="text-[10px] text-gray-400 leading-tight">
            {relativeTime(scan.startedAt)}
          </span>
        </div>

        {/* Score pill */}
        <div className="hidden sm:flex items-center gap-1.5 w-[90px] shrink-0">
          {verdict !== null && scan.overallScore !== null ? (
            <>
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums leading-4',
                  verdict.textClass,
                  verdict.bgClass,
                  verdict.borderClass,
                )}
              >
                {scan.overallScore}
              </span>
              <span className={cn('text-[10px] font-medium', verdict.textClass)}>
                {verdict.label}
              </span>
            </>
          ) : scan.status === 'running' ? (
            <span className="text-[11px] text-amber-500 font-medium">Running…</span>
          ) : (
            <span className="text-[11px] text-gray-400">—</span>
          )}
        </div>

        {/* Score delta */}
        <div className="hidden sm:flex w-[36px] shrink-0 justify-start">
          {scan.scoreDelta !== null && scan.scoreDelta !== 0 && (
            <span
              className={cn(
                'text-[11px] font-semibold tabular-nums flex items-center gap-0.5',
                scan.scoreDelta > 0 ? 'text-emerald-600' : 'text-red-500',
              )}
            >
              {scan.scoreDelta > 0 ? (
                <ArrowUpRight className="size-3" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3" aria-hidden="true" />
              )}
              {scan.scoreDelta > 0 ? `+${scan.scoreDelta}` : scan.scoreDelta}
            </span>
          )}
        </div>

        {/* Engine pips */}
        <div className="hidden md:flex flex-1 items-center gap-4">
          <EnginePips
            enginesQueried={scan.enginesQueried}
            enginesScanned={scan.enginesScanned}
          />
          <span className="text-[10px] text-gray-400 font-mono tabular-nums">
            {scan.enginesScanned.length}/{Math.max(scan.enginesQueried.length, scan.enginesScanned.length)} engines
          </span>
        </div>

        {/* Scan type badge */}
        <div className="hidden lg:flex shrink-0">
          <ScanTypeBadge scanType={scan.scanType} />
        </div>

        {/* View chevron */}
        <div className="ml-auto shrink-0">
          <span
            className={cn(
              'text-[11px] text-[#3370FF] flex items-center gap-0.5 transition-opacity duration-150',
              'opacity-0 group-hover:opacity-100',
            )}
          >
            <span className="hidden sm:inline text-xs">View details</span>
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.li>
  )
}
