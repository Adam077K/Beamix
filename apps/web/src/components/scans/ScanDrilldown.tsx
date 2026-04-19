'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Minus,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ScanSummary, ScanEngineResult } from '@/lib/types/shared'

interface ScanDrilldownProps {
  scan: ScanSummary | null
  onClose: () => void
}

// ─── Engine mock data ─────────────────────────────────────────────────────────

const ENGINE_MOCK_DATA: ScanEngineResult[] = [
  { engine: 'ChatGPT', status: 'completed', mentionedCount: 31, totalQueries: 50, avgRankPosition: 2.1 },
  { engine: 'Gemini', status: 'completed', mentionedCount: 28, totalQueries: 50, avgRankPosition: 2.7 },
  { engine: 'Perplexity', status: 'completed', mentionedCount: 34, totalQueries: 50, avgRankPosition: 1.9 },
  { engine: 'Claude', status: 'completed', mentionedCount: 26, totalQueries: 50, avgRankPosition: 3.2 },
  { engine: 'AI Overviews', status: 'completed', mentionedCount: 22, totalQueries: 50, avgRankPosition: 3.8 },
  { engine: 'Grok', status: 'completed', mentionedCount: 19, totalQueries: 50, avgRankPosition: 4.1 },
  { engine: 'You.com', status: 'completed', mentionedCount: 17, totalQueries: 50, avgRankPosition: 4.6 },
]

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

function engineBarColor(pct: number): string {
  if (pct >= 62) return 'bg-[#3370FF]'
  if (pct >= 42) return 'bg-amber-400'
  return 'bg-red-400'
}

function engineTextColor(pct: number): string {
  if (pct >= 62) return 'text-[#3370FF]'
  if (pct >= 42) return 'text-amber-600'
  return 'text-red-500'
}

// ─── Engine row ───────────────────────────────────────────────────────────────

function EngineRow({ result, index }: { result: ScanEngineResult; index: number }) {
  const pct = Math.round((result.mentionedCount / result.totalQueries) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.08 + index * 0.045, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="flex items-center gap-3 py-2.5">
        {/* Engine name */}
        <span className="w-28 shrink-0 text-xs font-medium text-gray-700 truncate">
          {result.engine}
        </span>

        {/* Progress bar */}
        <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className={cn('h-full rounded-full', engineBarColor(pct))}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.55, delay: 0.12 + index * 0.045, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Percentage */}
        <span className={cn('w-9 shrink-0 text-right text-xs font-semibold tabular-nums', engineTextColor(pct))}>
          {pct}%
        </span>

        {/* Rank position */}
        {result.avgRankPosition !== null && (
          <span className="hidden w-14 shrink-0 text-right text-xs text-gray-400 sm:block">
            #{result.avgRankPosition.toFixed(1)}
          </span>
        )}
      </div>

      {/* Subtle separator */}
      <div className="h-px bg-gray-50 group-last:hidden" />
    </motion.div>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function ScanDrilldown({ scan, onClose }: ScanDrilldownProps) {
  const isOpen = scan !== null

  const queriesGained = React.useMemo(() => {
    if (!scan?.scoreDelta) return 3
    return scan.scoreDelta > 0 ? scan.scoreDelta + 1 : 0
  }, [scan?.scoreDelta])

  const queriesLost = React.useMemo(() => {
    if (!scan?.scoreDelta) return 1
    return scan.scoreDelta < 0 ? Math.abs(scan.scoreDelta) : 1
  }, [scan?.scoreDelta])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg overflow-hidden p-0 gap-0">
        <AnimatePresence>
          {scan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="border-b border-gray-100 px-5 py-4">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4 pr-6">
                    <div className="min-w-0">
                      <DialogTitle className="text-sm font-semibold text-gray-900">
                        Scan results
                      </DialogTitle>
                      <DialogDescription className="mt-0.5 text-xs text-gray-500">
                        {formatDatetime(scan.startedAt)}
                      </DialogDescription>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Score</p>
                      <div className="mt-0.5 flex items-baseline justify-end gap-1.5">
                        <span className="text-2xl font-bold tabular-nums text-gray-900">
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
                            <span>{scan.scoreDelta > 0 ? `+${scan.scoreDelta}` : scan.scoreDelta}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {/* Query movement chips */}
                <div className="mt-3.5 flex items-center gap-2">
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
                  <div className="ml-auto flex items-center gap-1 text-[11px] text-gray-400">
                    <span>{scan.enginesSucceeded}/{scan.enginesTotal} engines</span>
                  </div>
                </div>
              </div>

              {/* Engine breakdown */}
              <div className="px-5 py-4">
                {/* Column labels */}
                <div className="mb-1 flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Engine
                  </span>
                  <span className="flex-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Mention rate
                  </span>
                  <span className="w-9 shrink-0 text-right text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Rate
                  </span>
                  <span className="hidden w-14 shrink-0 text-right text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:block">
                    Avg rank
                  </span>
                </div>

                <div>
                  {ENGINE_MOCK_DATA.map((result, i) => (
                    <EngineRow key={result.engine} result={result} index={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
