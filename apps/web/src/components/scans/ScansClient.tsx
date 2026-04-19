'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ScanSummary } from '@/lib/types/shared'
import { ScanDrilldown } from './ScanDrilldown'

interface ScansClientProps {
  scans: ScanSummary[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatDuration(startedAt: string, completedAt: string | null): string | null {
  if (!completedAt) return null
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const secs = Math.round(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreChip({ score, delta }: { score: number | null; delta: number | null }) {
  if (score === null) return null

  const { bg, text, border } =
    score >= 75
      ? { bg: 'bg-[#ecfdf5]', text: 'text-[#10B981]', border: 'border-[#a7f3d0]' }
      : score >= 50
        ? { bg: 'bg-amber-50', text: 'text-[#F59E0B]', border: 'border-amber-200' }
        : score >= 25
          ? { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' }
          : { bg: 'bg-red-50', text: 'text-[#EF4444]', border: 'border-red-200' }

  const trendColor =
    delta !== null && delta > 0
      ? 'text-[#10B981]'
      : delta !== null && delta < 0
        ? 'text-[#EF4444]'
        : 'text-gray-400'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex items-baseline gap-0.5 rounded-md border px-2.5 py-0.5', bg, border)}>
        <span className={cn('text-sm font-semibold tabular-nums', text)}>{score}</span>
        <span className={cn('text-[10px] font-medium', text)}>/100</span>
      </div>
      {delta !== null && (
        <span
          className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}
          aria-label={
            delta > 0
              ? `Score improved by ${delta} points`
              : delta < 0
                ? `Score dropped by ${Math.abs(delta)} points`
                : 'Score unchanged'
          }
        >
          {delta > 0 ? (
            <ArrowUp className="size-3" aria-hidden="true" />
          ) : delta < 0 ? (
            <ArrowDown className="size-3" aria-hidden="true" />
          ) : (
            <Minus className="size-3" aria-hidden="true" />
          )}
          <span>{delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'}</span>
        </span>
      )}
    </div>
  )
}

// ─── Status icon ─────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: ScanSummary['status'] }) {
  if (status === 'completed')
    return <CheckCircle2 className="size-3 text-[#3370FF]" aria-hidden="true" />
  if (status === 'failed')
    return <AlertCircle className="size-3 text-[#EF4444]" aria-hidden="true" />
  return <Loader2 className="size-3 animate-spin text-gray-400" aria-hidden="true" />
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function ScanRowSkeleton({ index }: { index: number }) {
  return (
    <li
      className="relative pl-14"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        aria-hidden="true"
        className="absolute left-[18px] top-4 size-3 -translate-x-1/2 rounded-full bg-gray-200 animate-pulse"
      />
      <div className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3.5 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="ml-4 flex items-center gap-3">
          <div className="h-6 w-16 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </li>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyScans({ onRun }: { onRun: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <ScanIcon className="size-6 text-gray-400" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-gray-900">No scans yet</p>
      <p className="mt-2 max-w-[280px] text-sm text-gray-500 leading-relaxed">
        Run your first scan to see trends over time — visibility score, engine breakdown, and more.
      </p>
      <Button
        onClick={onRun}
        className="mt-6 gap-1.5 bg-[#3370FF] text-white hover:bg-[#2558e0] active:scale-[0.98] rounded-lg focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        size="sm"
      >
        <ScanIcon className="size-3.5" aria-hidden="true" />
        Run first scan
      </Button>
    </motion.div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
        <AlertCircle className="size-6 text-[#EF4444]" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-gray-900">Could not load scan history</p>
      <p className="mt-2 max-w-[260px] text-sm text-gray-500 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 gap-1.5 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          size="sm"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      )}
    </motion.div>
  )
}

// ─── Individual scan row ──────────────────────────────────────────────────────

interface ScanRowProps {
  scan: ScanSummary
  index: number
  isLast: boolean
  onSelect: (scan: ScanSummary) => void
}

function ScanRow({ scan, index, isLast, onSelect }: ScanRowProps) {
  const duration = formatDuration(scan.startedAt, scan.completedAt)

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative pl-14"
    >
      {/* Timeline dot */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute left-[18px] top-4 flex size-3 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-colors',
          scan.status === 'completed'
            ? 'border-[#3370FF] bg-[#3370FF]'
            : scan.status === 'failed'
              ? 'border-[#EF4444] bg-[#EF4444]'
              : 'border-gray-300 bg-white',
        )}
      />

      {/* Clickable row */}
      <button
        onClick={() => onSelect(scan)}
        aria-label={`View scan from ${formatDate(scan.startedAt)}, score ${scan.score ?? 'pending'}`}
        className="group mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        {/* Left: date/time + engines + duration */}
        <div className="min-w-0 flex-1">
          {/* Mobile: stacked. sm+: inline */}
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusIcon status={scan.status} />
            <span className="text-sm font-medium text-gray-900">
              {formatDate(scan.startedAt)}
            </span>
            <span className="text-xs text-gray-400">{formatTime(scan.startedAt)}</span>
            {scan.score !== null && (
              <span className="hidden text-xs text-gray-400 sm:inline" aria-hidden="true">
                · {scoreLabel(scan.score)}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-xs text-gray-500">
              {scan.enginesSucceeded} of {scan.enginesTotal} engines
            </p>
            {duration && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="size-3" aria-hidden="true" />
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Right: score + chevron */}
        <div className="ms-4 flex shrink-0 items-center gap-2">
          <ScoreChip score={scan.score} delta={scan.scoreDelta} />
          <ChevronRight
            className="size-4 text-gray-300 transition-all duration-150 group-hover:text-gray-500 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </button>

      {!isLast && <div className="ms-3 h-1" />}
    </motion.li>
  )
}

// ─── Loading skeleton list ────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="relative" aria-busy="true" aria-label="Loading scan history">
      <div
        aria-hidden="true"
        className="absolute top-2 left-6 h-[calc(100%-1.5rem)] w-px bg-gray-200"
      />
      <ol className="space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <ScanRowSkeleton key={i} index={i} />
        ))}
      </ol>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ScansClient({
  scans,
  isLoading = false,
  error = null,
  onRetry,
}: ScansClientProps) {
  const [selectedScan, setSelectedScan] = React.useState<ScanSummary | null>(null)
  const [isRunning, setIsRunning] = React.useState(false)

  function handleRunScan() {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2200)
  }

  // Latest first — defensive sort
  const sorted = React.useMemo(
    () =>
      [...scans].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      ),
    [scans],
  )

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Scan history</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {isLoading
                ? 'Loading…'
                : error
                  ? 'Could not load scan history'
                  : sorted.length > 0
                    ? `${sorted.length} scan${sorted.length !== 1 ? 's' : ''} — latest first`
                    : 'No scans yet'}
            </p>
          </div>

          <Button
            onClick={handleRunScan}
            disabled={isRunning || isLoading}
            size="sm"
            className="shrink-0 gap-1.5 bg-[#3370FF] text-white hover:bg-[#2558e0] active:scale-[0.98] rounded-lg focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isRunning ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Running…</span>
              </>
            ) : (
              <>
                <ScanIcon className="size-3.5" aria-hidden="true" />
                <span>Run scan</span>
              </>
            )}
          </Button>
        </div>

        {/* Content — animated transitions between states */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ErrorState message={error} onRetry={onRetry} />
            </motion.div>
          ) : sorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyScans onRun={handleRunScan} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Vertical timeline rail */}
              <div
                aria-hidden="true"
                className="absolute top-2 left-6 h-[calc(100%-1.5rem)] w-px bg-gray-200"
              />

              <ol aria-label="Scan history, most recent first" className="space-y-0">
                {sorted.map((scan, index) => (
                  <ScanRow
                    key={scan.id}
                    scan={scan}
                    index={index}
                    isLast={index === sorted.length - 1}
                    onSelect={setSelectedScan}
                  />
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Drilldown modal — rendered outside main to avoid layout constraint */}
      <ScanDrilldown scan={selectedScan} onClose={() => setSelectedScan(null)} />
    </>
  )
}
