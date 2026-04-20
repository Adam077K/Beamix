'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import type { Competitor } from './types'

// ─── Per-competitor strategy card ────────────────────────────────────────────

interface StrategyCardProps {
  competitor: Competitor
  yourQueryCoverage: number
  yourPublishCadence: string
}

function StrategyCard({
  competitor,
  yourQueryCoverage,
  yourPublishCadence,
}: StrategyCardProps) {
  const trendDelta =
    competitor.fourWeekTrend.length >= 2
      ? competitor.fourWeekTrend[competitor.fourWeekTrend.length - 1]! -
        competitor.fourWeekTrend[0]!
      : 0

  const isRising = trendDelta > 0
  const isFalling = trendDelta < 0

  const theirCoverage = competitor.queryCoverage ?? competitor.queriesWhereAppears.length
  const coverageGap = theirCoverage - yourQueryCoverage

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0a0a0a] truncate">
            {competitor.name}
          </p>
          <a
            href={`https://${competitor.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#3370FF] hover:underline mt-0.5"
          >
            {competitor.url}
            <ExternalLink className="size-2.5" aria-hidden="true" />
          </a>
        </div>
        {/* Trend indicator */}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0',
            isRising
              ? 'bg-red-50 text-red-600'
              : isFalling
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-[#f7f7f7] text-[#6b7280]',
          )}
        >
          {isRising ? (
            <TrendingUp className="size-3" aria-hidden="true" />
          ) : isFalling ? (
            <TrendingDown className="size-3" aria-hidden="true" />
          ) : (
            <Minus className="size-3" aria-hidden="true" />
          )}
          {isRising ? '+' : ''}{trendDelta}
        </span>
      </div>

      {/* SoV */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-1.5 flex-1 rounded-full bg-[#f3f4f6] overflow-hidden">
          <div
            className="h-full rounded-full bg-red-400"
            style={{ width: `${Math.round(competitor.appearanceRate * 100)}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums text-[#0a0a0a] shrink-0">
          {Math.round(competitor.appearanceRate * 100)}% SoV
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-[#f9fafb] px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9ca3af] mb-0.5">
            Cadence
          </p>
          <p className="text-xs font-semibold text-[#0a0a0a]">
            {competitor.publishCadence ?? 'Unknown'}
          </p>
        </div>
        <div className="rounded-lg bg-[#f9fafb] px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9ca3af] mb-0.5">
            Queries
          </p>
          <p className="text-xs font-semibold text-[#0a0a0a]">
            {theirCoverage} covered
          </p>
        </div>
      </div>

      {/* Coverage gap narrative */}
      <p className="text-[11px] text-[#6b7280] leading-relaxed">
        {competitor.publishCadence ? (
          <>
            <span className="font-medium text-[#0a0a0a]">{competitor.name}</span>{' '}
            publishes {competitor.publishCadence}, covering{' '}
            <span className="font-medium text-[#0a0a0a]">{theirCoverage} queries</span>. You
            cover {yourQueryCoverage} at {yourPublishCadence}.
          </>
        ) : (
          <>
            They appear in{' '}
            <span className="font-medium text-[#0a0a0a]">{theirCoverage} queries</span> vs.
            your {yourQueryCoverage}.{' '}
            {coverageGap > 0 && (
              <span className="text-amber-600 font-medium">
                Close the {coverageGap}-query gap.
              </span>
            )}
          </>
        )}
      </p>
    </div>
  )
}

// ─── Main aside ──────────────────────────────────────────────────────────────

interface StrategyDeltaAsideProps {
  competitors: Competitor[]
  yourQueryCoverage: number
  yourPublishCadence?: string
}

export function StrategyDeltaAside({
  competitors,
  yourQueryCoverage,
  yourPublishCadence = '~1×/month',
}: StrategyDeltaAsideProps) {
  return (
    <aside>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[#0a0a0a]">
          Strategy delta
        </h2>
        <p className="text-xs text-[#6b7280] mt-0.5">
          Coverage and cadence gaps per competitor
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {competitors.map((c) => (
          <StrategyCard
            key={c.id}
            competitor={c}
            yourQueryCoverage={yourQueryCoverage}
            yourPublishCadence={yourPublishCadence}
          />
        ))}
      </div>
    </aside>
  )
}
