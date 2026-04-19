'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Minus, ArrowUp, ArrowDown } from 'lucide-react'
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

// ─── Engine display config ────────────────────────────────────────────────────
// Clean text badges — brand-consistent, no emojis, no random icons

interface EngineConfig {
  label: string
  shortName: string
  badgeBg: string
  badgeText: string
}

const ENGINE_CONFIG: Record<string, EngineConfig> = {
  ChatGPT: { label: 'ChatGPT', shortName: 'GPT', badgeBg: 'bg-[#10a37f]/10', badgeText: 'text-[#0d8c6e]' },
  Gemini: { label: 'Gemini', shortName: 'GEM', badgeBg: 'bg-blue-50', badgeText: 'text-blue-600' },
  Perplexity: { label: 'Perplexity', shortName: 'PPX', badgeBg: 'bg-[#20b2aa]/10', badgeText: 'text-[#178a83]' },
  Claude: { label: 'Claude', shortName: 'CLD', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
  'Google AI Overview': { label: 'Google AI', shortName: 'GAI', badgeBg: 'bg-[#3370FF]/10', badgeText: 'text-[#3370FF]' },
  Grok: { label: 'Grok', shortName: 'GRK', badgeBg: 'bg-gray-100', badgeText: 'text-gray-700' },
  'You.com': { label: 'You.com', shortName: 'YOU', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700' },
}

function getEngineConfig(engine: string): EngineConfig {
  return ENGINE_CONFIG[engine] ?? {
    label: engine,
    shortName: engine.slice(0, 3).toUpperCase(),
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ENGINE_MOCK_DATA: ScanEngineResult[] = [
  { engine: 'ChatGPT', status: 'completed', mentionedCount: 31, totalQueries: 50, avgRankPosition: 2.1 },
  { engine: 'Gemini', status: 'completed', mentionedCount: 28, totalQueries: 50, avgRankPosition: 2.7 },
  { engine: 'Perplexity', status: 'completed', mentionedCount: 34, totalQueries: 50, avgRankPosition: 1.9 },
  { engine: 'Claude', status: 'completed', mentionedCount: 26, totalQueries: 50, avgRankPosition: 3.2 },
  { engine: 'Google AI Overview', status: 'completed', mentionedCount: 22, totalQueries: 50, avgRankPosition: 3.8 },
  { engine: 'Grok', status: 'completed', mentionedCount: 19, totalQueries: 50, avgRankPosition: 4.1 },
  { engine: 'You.com', status: 'completed', mentionedCount: 17, totalQueries: 50, avgRankPosition: 4.6 },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function mentionRateColor(pct: number): { bar: string; text: string } {
  if (pct >= 60) return { bar: 'bg-[#3370FF]', text: 'text-[#3370FF]' }
  if (pct >= 40) return { bar: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' }
  return { bar: 'bg-[#EF4444]', text: 'text-[#EF4444]' }
}

// ─── Engine row (horizontal table-style layout) ───────────────────────────────

function EngineRow({ result, index }: { result: ScanEngineResult; index: number }) {
  const pct = Math.round((result.mentionedCount / result.totalQueries) * 100)
  const config = getEngineConfig(result.engine)
  const { bar, text } = mentionRateColor(pct)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
    >
      {/* Engine badge */}
      <div
        className={cn(
          'flex items-center justify-center rounded px-1.5 py-0.5 min-w-[2.75rem] text-center',
          config.badgeBg,
        )}
        title={config.label}
      >
        <span className={cn('text-[10px] font-semibold tracking-wide', config.badgeText)}>
          {config.shortName}
        </span>
      </div>

      {/* Bar + engine name */}
      <div className="min-w-0">
        <p className="mb-1 text-xs font-medium text-gray-700">{config.label}</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className={cn('h-full rounded-full', bar)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.55, delay: 0.08 + index * 0.035, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Mention rate */}
      <div className="text-right">
        <span className={cn('text-xs font-semibold tabular-nums', text)}>{pct}%</span>
        <p className="mt-0.5 text-[10px] text-gray-400 tabular-nums">
          {result.mentionedCount}/{result.totalQueries}
        </p>
      </div>

      {/* Avg rank position */}
      <div className="text-right w-10">
        {result.avgRankPosition !== null ? (
          <>
            <span className="text-xs font-medium tabular-nums text-gray-700">
              #{result.avgRankPosition.toFixed(1)}
            </span>
            <p className="mt-0.5 text-[10px] text-gray-400">rank</p>
          </>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Engine card (mobile fallback — single column) ────────────────────────────

function EngineCard({ result, index }: { result: ScanEngineResult; index: number }) {
  const pct = Math.round((result.mentionedCount / result.totalQueries) * 100)
  const config = getEngineConfig(result.engine)
  const { bar } = mentionRateColor(pct)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-gray-200 bg-gray-50/60 p-3"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide',
              config.badgeBg,
              config.badgeText,
            )}
          >
            {config.shortName}
          </span>
          <span className="text-xs font-medium text-gray-800">{config.label}</span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-gray-900">{pct}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className={cn('h-full rounded-full', bar)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, delay: 0.08 + index * 0.035, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500">
        <span>{result.mentionedCount} of {result.totalQueries} queries</span>
        {result.avgRankPosition !== null && (
          <span>Avg rank #{result.avgRankPosition.toFixed(1)}</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main drilldown dialog ────────────────────────────────────────────────────

export function ScanDrilldown({ scan, onClose }: ScanDrilldownProps) {
  const isOpen = scan !== null

  // Derive query movement pills from scoreDelta
  const queriesGained =
    scan?.scoreDelta != null && scan.scoreDelta > 0
      ? scan.scoreDelta + 1
      : scan?.scoreDelta != null && scan.scoreDelta < 0
        ? 0
        : 3

  const queriesLost =
    scan?.scoreDelta != null && scan.scoreDelta < 0
      ? Math.abs(scan.scoreDelta)
      : scan?.scoreDelta != null && scan.scoreDelta > 0
        ? 1
        : 1

  const hasScoreDelta = scan?.scoreDelta != null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0">
        {scan && (
          <>
            {/* ── Modal header ─────────────────────────────────────────── */}
            <div className="border-b border-gray-200 px-6 py-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  {/* Title + date */}
                  <div>
                    <DialogTitle className="text-base font-semibold text-gray-900">
                      Scan results
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-xs text-gray-500">
                      {formatDate(scan.startedAt)}
                    </DialogDescription>
                  </div>

                  {/* Score summary */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500">Visibility score</p>
                    <div className="mt-0.5 flex items-baseline justify-end gap-2">
                      <span className="text-2xl font-bold tabular-nums text-gray-900">
                        {scan.score ?? '—'}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">/100</span>
                    </div>
                    {hasScoreDelta && scan.scoreDelta !== null && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 text-xs font-medium mt-0.5',
                          scan.scoreDelta > 0
                            ? 'text-[#10B981]'
                            : scan.scoreDelta < 0
                              ? 'text-[#EF4444]'
                              : 'text-gray-400',
                        )}
                        aria-label={
                          scan.scoreDelta > 0
                            ? `Score improved by ${scan.scoreDelta} points vs previous`
                            : scan.scoreDelta < 0
                              ? `Score dropped by ${Math.abs(scan.scoreDelta)} points vs previous`
                              : 'Score unchanged vs previous'
                        }
                      >
                        {scan.scoreDelta > 0 ? (
                          <ArrowUp className="size-3" aria-hidden="true" />
                        ) : scan.scoreDelta < 0 ? (
                          <ArrowDown className="size-3" aria-hidden="true" />
                        ) : (
                          <Minus className="size-3" aria-hidden="true" />
                        )}
                        {scan.scoreDelta > 0 ? `+${scan.scoreDelta}` : scan.scoreDelta} vs previous
                      </span>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Query movement pills */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-md border border-[#a7f3d0] bg-[#ecfdf5] px-2.5 py-1">
                  <CheckCircle2 className="size-3.5 text-[#10B981]" aria-hidden="true" />
                  <span className="text-xs font-medium text-[#065f46]">
                    +{queriesGained} queries gained
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1">
                  <XCircle className="size-3.5 text-[#EF4444]" aria-hidden="true" />
                  <span className="text-xs font-medium text-red-700">
                    -{queriesLost} queries lost
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {scan.enginesSucceeded} of {scan.enginesTotal} engines
                </span>
              </div>
            </div>

            {/* ── Engine breakdown ──────────────────────────────────────── */}
            <div className="px-6 py-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-400">
                Engine breakdown
              </p>

              {/* Desktop: horizontal rows with bar */}
              <div className="hidden sm:block">
                {ENGINE_MOCK_DATA.map((result, i) => (
                  <EngineRow key={result.engine} result={result} index={i} />
                ))}
              </div>

              {/* Mobile: card grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:hidden">
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
