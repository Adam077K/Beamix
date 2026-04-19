'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanIcon, CheckCircle2, AlertCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ScanSummary } from '@/lib/types/shared'
import { ScanDrilldown } from './ScanDrilldown'

interface ScansClientProps {
  scans: ScanSummary[]
}

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

function ScoreChip({ score, delta }: { score: number | null; delta: number | null }) {
  if (score === null) return null

  const color =
    score >= 70
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : score >= 50
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-red-700 bg-red-50 border-red-200'

  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded-md border px-2.5 py-0.5 text-sm font-semibold tabular-nums', color)}>
        {score}
      </span>
      {delta !== null && (
        <span
          className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-gray-400',
          )}
        >
          {delta > 0 ? (
            <TrendingUp className="size-3" />
          ) : delta < 0 ? (
            <TrendingDown className="size-3" />
          ) : null}
          {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'}
        </span>
      )}
    </div>
  )
}

function StatusDot({ status }: { status: ScanSummary['status'] }) {
  if (status === 'completed') {
    return <CheckCircle2 className="size-3 text-[#3370FF]" />
  }
  if (status === 'failed') {
    return <AlertCircle className="size-3 text-red-500" />
  }
  return <Loader2 className="size-3 animate-spin text-gray-400" />
}

// Empty state
function EmptyScans({ onRun }: { onRun: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <ScanIcon className="size-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900">No scans yet</p>
      <p className="mt-1 max-w-xs text-xs text-gray-500">
        Run your first scan to see how visible your business is in AI search results.
      </p>
      <Button onClick={onRun} className="mt-6 bg-[#3370FF] hover:bg-[#2558e0]" size="sm">
        Run first scan
      </Button>
    </motion.div>
  )
}

export function ScansClient({ scans }: ScansClientProps) {
  const [selectedScan, setSelectedScan] = React.useState<ScanSummary | null>(null)
  const [isRunning, setIsRunning] = React.useState(false)

  function handleRunScan() {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2000)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Scans</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {scans.length > 0
              ? `${scans.length} scan${scans.length !== 1 ? 's' : ''} — most recent first`
              : 'Visibility checks across all AI engines'}
          </p>
        </div>
        <Button
          onClick={handleRunScan}
          disabled={isRunning}
          size="sm"
          className="shrink-0 bg-[#3370FF] hover:bg-[#2558e0] active:scale-[0.98]"
        >
          {isRunning ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <ScanIcon className="size-3.5" />
              Run scan now
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      {scans.length === 0 ? (
        <EmptyScans onRun={handleRunScan} />
      ) : (
        <div className="relative">
          {/* Vertical timeline rail */}
          <div className="absolute top-2 start-6 h-[calc(100%-1.5rem)] w-px bg-gray-200" />

          <ol className="space-y-0">
            {scans.map((scan, index) => (
              <motion.li
                key={scan.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative ps-14"
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'absolute start-[18px] top-3.5 flex size-3 -translate-x-1/2 items-center justify-center rounded-full border-2',
                    scan.status === 'completed'
                      ? 'border-[#3370FF] bg-[#3370FF]'
                      : scan.status === 'failed'
                        ? 'border-red-400 bg-red-400'
                        : 'border-gray-300 bg-white',
                  )}
                />

                {/* Row card — subtle hover surface */}
                <button
                  onClick={() => setSelectedScan(scan)}
                  className="group mb-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-start transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={scan.status} />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(scan.startedAt)}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(scan.startedAt)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {scan.enginesSucceeded} of {scan.enginesTotal} engines passed
                    </p>
                  </div>

                  <div className="ms-4 flex items-center gap-3 shrink-0">
                    <ScoreChip score={scan.score} delta={scan.scoreDelta} />
                    <span className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                      View details
                    </span>
                  </div>
                </button>

                {/* Connector spacing between items */}
                {index < scans.length - 1 && <div className="ms-3 h-1" />}
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {/* Drilldown modal */}
      <ScanDrilldown scan={selectedScan} onClose={() => setSelectedScan(null)} />
    </main>
  )
}
