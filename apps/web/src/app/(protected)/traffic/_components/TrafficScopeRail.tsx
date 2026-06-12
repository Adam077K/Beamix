'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAnalyticsFilter, type Timeframe } from '@/components/console/AnalyticsFilterContext'
import { BOT_COLORS, BOT_ORDER } from './bot-colors'

/**
 * TrafficScopeRail — the /traffic mirror of AnalyticsScopeRail.
 *
 * Near-verbatim copy of the shared rail (same chip styling, swatch, active
 * states, timeframe segmented control, reset anchor) with exactly one swap: the
 * primary dimension is BOTS/crawlers (BOT_ORDER + BOT_COLORS) instead of engines.
 * Bot ids live in the same `engines` record on the shared filter context, so
 * toggleEngine / engineOpacity operate on bots unchanged.
 *
 * This honors "don't edit console/*" — the shared rail hard-codes the engine set,
 * so /traffic supplies its own thin rail while reusing the context 1:1.
 *
 * Groups:
 *   1. Crawlers — checkbox-chips w/ swatch, drives engineOpacity() across instruments
 *   2. Timeframe — segmented control 7d / 30d / 90d / Custom (inherited semantics)
 *   3. Page path — injected via topicGroup prop
 */

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'custom', label: 'Custom' },
]

interface TrafficScopeRailProps {
  /** Page-path toggles injected by the workbench (PagePathFilterGroup). */
  topicGroup?: ReactNode | null
  className?: string
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
      {children}
    </p>
  )
}

export function TrafficScopeRail({ topicGroup = null, className }: TrafficScopeRailProps) {
  const { engines, timeframe, toggleEngine, setTimeframe, resetFilters } = useAnalyticsFilter()

  return (
    <aside className={cn('card-inset space-y-6 p-5', className)} aria-label="Traffic filters">
      {/* Group 1 — Crawlers (bots) */}
      <div>
        <GroupLabel>Crawlers</GroupLabel>
        <div className="space-y-1.5">
          {BOT_ORDER.map((bot) => {
            const active = engines[bot] !== false
            const color = BOT_COLORS[bot] ?? '#9CA3AF'

            return (
              <button
                key={bot}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`Toggle ${bot}`}
                onClick={() => toggleEngine(bot)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  active
                    ? 'bg-[#EEF2FF] text-[#3370FF]'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
                )}
              >
                {/* 8px color swatch */}
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? color : '#D1D5DB' }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-left font-mono text-[13px]">{bot}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Group 2 — Timeframe */}
      <div>
        <GroupLabel>Timeframe</GroupLabel>
        <div
          role="group"
          aria-label="Timeframe selection"
          className="grid grid-cols-4 gap-1 rounded-lg bg-[#F3F4F6] p-1"
        >
          {TIMEFRAMES.map(({ value, label }) => {
            const active = timeframe === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTimeframe(value)}
                aria-pressed={active}
                className={cn(
                  'rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-sm ring-1 ring-inset ring-[#E5E7EB]'
                    : 'text-[#6B7280] hover:text-[#0A0A0A]',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Group 3 — Page path (injected) */}
      {topicGroup && <div>{topicGroup}</div>}

      {/* Quiet reset anchor */}
      <button
        type="button"
        onClick={resetFilters}
        className="text-[12px] text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        aria-label="Reset all filters to default"
      >
        Reset filters
      </button>
    </aside>
  )
}
