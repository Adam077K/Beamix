'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ScanSummary } from '@/lib/types/shared'
import { ScanDrilldown } from './ScanDrilldown'

interface ScansClientProps {
  scans: ScanSummary[]
}

// ─── Utilities ──────────────────────────────────────────────────────────────

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

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function scoreVerdict(score: number): { label: string; classes: string } {
  if (score >= 70) return { label: 'Good', classes: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  if (score >= 50) return { label: 'Fair', classes: 'text-amber-700 bg-amber-50 border-amber-200' }
  return { label: 'Critical', classes: 'text-red-700 bg-red-50 border-red-200' }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ScanSummary['status'] }) {
  if (status === 'completed') {
    return (
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#3370FF] opacity-20 animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-[#3370FF]" />
      </span>
    )
  }
  if (status === 'failed') {
    return <span className="size-2 shrink-0 rounded-full bg-red-500" />
  }
  return (
    <span className="relative flex size-2 shrink-0">
      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30 animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
    </span>
  )
}

function ScoreChip({ score, delta }: { score: number | null; delta: number | null }) {
  if (score === null) return null
  const { label, classes } = scoreVerdict(score)

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className={cn('rounded border px-2 py-0.5 text-xs font-semibold tabular-nums leading-5', classes)}>
        {score} <span className="font-normal opacity-70">{label}</span>
      </span>
      {delta !== null && delta !== 0 && (
        <span
          className={cn(
            'flex items-center gap-0.5 text-[11px] font-medium tabular-nums',
            delta > 0 ? 'text-emerald-600' : 'text-red-500',
          )}
        >
          {delta > 0 ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2" role="separator">
      <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{label}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  )
}

// ─── Skeleton rows ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2.5 animate-pulse">
      <span className="size-2 shrink-0 rounded-full bg-gray-200" />
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="h-3.5 w-28 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <div className="h-5 w-20 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-100 hidden sm:block" />
        <div className="size-4 rounded bg-gray-100" />
      </div>
    </div>
  )
}

// ─── Filter chip types ────────────────────────────────────────────────────────

type FilterKey = 'all' | 'completed' | 'running' | 'failed'

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ScansClient({ scans }: ScansClientProps) {
  const [selectedScan, setSelectedScan] = React.useState<ScanSummary | null>(null)
  const [isRunning, setIsRunning] = React.useState(false)
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all')
  const [isLoading] = React.useState(false)

  function handleRunScan() {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2500)
  }

  // Build counts per status
  const counts = React.useMemo<Record<FilterKey, number>>(() => {
    return {
      all: scans.length,
      completed: scans.filter((s) => s.status === 'completed').length,
      running: scans.filter((s) => s.status === 'running').length,
      failed: scans.filter((s) => s.status === 'failed').length,
    }
  }, [scans])

  const filteredScans = React.useMemo(() => {
    if (activeFilter === 'all') return scans
    return scans.filter((s) => s.status === activeFilter)
  }, [scans, activeFilter])

  // Group by day
  const grouped = React.useMemo(() => {
    const groups: Array<{ dayKey: string; label: string; items: ScanSummary[] }> = []
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
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Scans</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {scans.length > 0
              ? `${scans.length} scan${scans.length !== 1 ? 's' : ''} — AI visibility across all engines`
              : 'Visibility checks across all AI engines'}
          </p>
        </div>
        <Button
          onClick={handleRunScan}
          disabled={isRunning}
          size="sm"
          className="shrink-0 bg-[#3370FF] hover:bg-[#2558e0] active:scale-[0.98] transition-transform"
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
              Run scan
            </>
          )}
        </Button>
      </div>

      {/* Filter chips */}
      {scans.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter scans by status">
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
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {counts[key]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-0.5" aria-busy="true" aria-label="Loading scans">
          {[0, 1, 2].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
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
          <p className="text-sm font-medium text-gray-900">No scans yet</p>
          <p className="mt-1 max-w-xs text-xs text-gray-500">
            Run your first scan to measure how often AI engines surface your business for relevant queries.
          </p>
          <Button
            onClick={handleRunScan}
            className="mt-6 bg-[#3370FF] hover:bg-[#2558e0] active:scale-[0.98] transition-transform"
            size="sm"
          >
            Run first scan
          </Button>
        </motion.div>
      )}

      {/* Empty filter state */}
      {!isLoading && scans.length > 0 && filteredScans.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center py-16 text-center"
          role="status"
        >
          <p className="text-sm font-medium text-gray-500">
            No {FILTER_LABELS[activeFilter].toLowerCase()} scans
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-2 text-xs text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
          >
            View all scans
          </button>
        </motion.div>
      )}

      {/* Scan timeline */}
      {!isLoading && filteredScans.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
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
                        onSelect={() => setSelectedScan(scan)}
                      />
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Drilldown dialog */}
      <ScanDrilldown scan={selectedScan} onClose={() => setSelectedScan(null)} />
    </main>
  )
}

// ─── Scan row (isolated client leaf) ─────────────────────────────────────────

interface ScanRowProps {
  scan: ScanSummary
  index: number
  onSelect: () => void
}

function ScanRow({ scan, index, onSelect }: ScanRowProps) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.28,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <button
        onClick={onSelect}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left',
          'transition-colors duration-100 hover:bg-gray-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
          // Selected accent bar applied when drilldown opens — done via CSS class on parent
        )}
        aria-label={`Scan from ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(scan.startedAt))}, score ${scan.score ?? 'pending'}`}
      >
        {/* Status dot */}
        <StatusDot status={scan.status} />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 tabular-nums">
              {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(
                new Date(scan.startedAt),
              )}
            </span>
            <span className="text-xs text-gray-400">
              {scan.enginesSucceeded}/{scan.enginesTotal} engines
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <ScoreChip score={scan.score} delta={scan.scoreDelta} />
          <span className="hidden text-[11px] text-gray-400 sm:block">
            {relativeTime(scan.startedAt)}
          </span>
          <span
            className="text-[11px] text-[#3370FF] opacity-0 transition-opacity duration-150 group-hover:opacity-100 flex items-center gap-0.5"
            aria-hidden="true"
          >
            View
            <ChevronRight className="size-3" />
          </span>
        </div>
      </button>
    </motion.li>
  )
}
