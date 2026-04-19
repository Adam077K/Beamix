'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Minus } from 'lucide-react'
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

const ENGINE_MOCK_DATA: ScanEngineResult[] = [
  { engine: 'ChatGPT', status: 'completed', mentionedCount: 31, totalQueries: 50, avgRankPosition: 2.1 },
  { engine: 'Gemini', status: 'completed', mentionedCount: 28, totalQueries: 50, avgRankPosition: 2.7 },
  { engine: 'Perplexity', status: 'completed', mentionedCount: 34, totalQueries: 50, avgRankPosition: 1.9 },
  { engine: 'Claude', status: 'completed', mentionedCount: 26, totalQueries: 50, avgRankPosition: 3.2 },
  { engine: 'Google AI Overview', status: 'completed', mentionedCount: 22, totalQueries: 50, avgRankPosition: 3.8 },
  { engine: 'Grok', status: 'completed', mentionedCount: 19, totalQueries: 50, avgRankPosition: 4.1 },
  { engine: 'You.com', status: 'completed', mentionedCount: 17, totalQueries: 50, avgRankPosition: 4.6 },
]

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function EngineCard({ result, index }: { result: ScanEngineResult; index: number }) {
  const pct = Math.round((result.mentionedCount / result.totalQueries) * 100)

  const barColor =
    pct >= 60
      ? 'bg-[#3370FF]'
      : pct >= 40
        ? 'bg-amber-400'
        : 'bg-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-800">{result.engine}</span>
        <span className="tabular-nums text-xs font-semibold text-gray-900">{pct}%</span>
      </div>

      {/* Mini bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <p className="mt-1.5 text-xs text-gray-500">
        {result.mentionedCount} of {result.totalQueries} queries
      </p>
    </motion.div>
  )
}

export function ScanDrilldown({ scan, onClose }: ScanDrilldownProps) {
  const isOpen = scan !== null

  // Stable mock deltas derived from scoreDelta
  const queriesGained = scan?.scoreDelta !== null && scan?.scoreDelta !== undefined && scan.scoreDelta > 0
    ? scan.scoreDelta + 1
    : scan?.scoreDelta !== null && scan?.scoreDelta !== undefined && scan.scoreDelta < 0
      ? 0
      : 3

  const queriesLost = scan?.scoreDelta !== null && scan?.scoreDelta !== undefined && scan.scoreDelta < 0
    ? Math.abs(scan.scoreDelta)
    : scan?.scoreDelta !== null && scan?.scoreDelta !== undefined && scan.scoreDelta > 0
      ? 1
      : 1

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {scan && (
          <>
            {/* Modal header with score */}
            <div className="border-b border-gray-200 px-6 py-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-base font-semibold text-gray-900">
                      Scan results
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-xs text-gray-500">
                      {formatDate(scan.startedAt)}
                    </DialogDescription>
                  </div>

                  {/* Score summary */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Visibility score</p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-2xl font-bold tabular-nums text-gray-900">
                          {scan.score}
                        </span>
                        {scan.scoreDelta !== null && (
                          <span
                            className={cn(
                              'flex items-center gap-0.5 text-sm font-medium',
                              scan.scoreDelta > 0
                                ? 'text-emerald-600'
                                : scan.scoreDelta < 0
                                  ? 'text-red-500'
                                  : 'text-gray-400',
                            )}
                          >
                            {scan.scoreDelta > 0 ? (
                              <TrendingUp className="size-3.5" />
                            ) : scan.scoreDelta < 0 ? (
                              <TrendingDown className="size-3.5" />
                            ) : (
                              <Minus className="size-3.5" />
                            )}
                            {scan.scoreDelta > 0 ? `+${scan.scoreDelta}` : scan.scoreDelta}
                            {' '}vs previous
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Query movement row */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">
                    Queries gained +{queriesGained}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1">
                  <XCircle className="size-3.5 text-red-500" />
                  <span className="text-xs font-medium text-red-600">
                    Queries lost -{queriesLost}
                  </span>
                </div>
              </div>
            </div>

            {/* Engine grid */}
            <div className="px-6 py-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                Engine breakdown
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {ENGINE_MOCK_DATA.map((result, i) => (
                  <EngineCard key={result.engine} result={result} index={i} />
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
