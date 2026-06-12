'use client'

import { cn } from '@/lib/utils'
import { useAnalyticsFilter, type Timeframe } from '@/components/console/AnalyticsFilterContext'
import { FilterChip } from '@/components/console/FilterChip'
import {
  REGION_ORDER,
  REGION_COLORS,
  INTENT_ORDER,
  INTENT_LABELS,
  INTENT_PILL,
} from './market-colors'

/**
 * MarketScopeRail — a near-verbatim page-local copy of AnalyticsScopeRail with
 * the scope dimension swapped from ENGINE to REGION (primary) + INTENT (the
 * injected topic group). This honors "don't edit shared console/*" while
 * reusing the FilterContext + chip styling 1:1.
 *
 * Region + intent toggles both live in the shared `topics` record, namespaced
 * (`region:Israel`, `intent:transactional`) so they never collide. Toggling a
 * region or intent drives engineOpacity-style row dimming in the prompt table
 * and the volume chart (linked-instrument, 200ms, no refetch).
 *
 * Active chip: bg #EEF2FF / text #3370FF. Inactive: muted surface + hover.
 */

export const REGION_PREFIX = 'region:'
export const INTENT_PREFIX = 'intent:'

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'custom', label: 'Custom' },
]

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
      {children}
    </p>
  )
}

/** A region or intent toggle key is "on" unless explicitly false. */
export function isActive(topics: Record<string, boolean>, key: string): boolean {
  return topics[key] !== false
}

export function MarketScopeRail() {
  const { topics, timeframe, toggleTopic, setTimeframe, resetFilters } = useAnalyticsFilter()

  return (
    <aside className="card-inset space-y-6 p-5" aria-label="Market intelligence filters">
      {/* Group 1 — Regions (primary scope dimension). FilterChip: neutral ink +
          colored swatch; blue only on hover/focus — kills the wall-of-blue and
          differentiates the rail from the global-nav active state (tell #8). */}
      <div>
        <GroupLabel>Region</GroupLabel>
        <div className="space-y-0.5">
          {REGION_ORDER.map((region) => {
            const key = `${REGION_PREFIX}${region}`
            const active = isActive(topics, key)
            const color = REGION_COLORS[region] ?? '#9CA3AF'
            return (
              <FilterChip
                key={region}
                active={active}
                onToggle={() => toggleTopic(key)}
                ariaLabel={`Toggle ${region}`}
                color={color}
                marker="swatch"
              >
                {region}
              </FilterChip>
            )
          })}
        </div>
      </div>

      {/* Group 2 — Timeframe (inherited segmented control) */}
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
                  'rounded-md px-1.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-[0_1px_2px_rgba(10,10,10,0.10),0_0_0_1px_rgba(10,10,10,0.06)]'
                    : 'font-medium text-[#6B7280] hover:text-[#0A0A0A]',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Group 3 — Intent (injected topic group). Swatch carries the intent
          status color so it reads as the same data band as the donut/chart. */}
      <div>
        <GroupLabel>Intent</GroupLabel>
        <div className="space-y-0.5">
          {INTENT_ORDER.map((intent) => {
            const key = `${INTENT_PREFIX}${intent}`
            const active = isActive(topics, key)
            return (
              <FilterChip
                key={intent}
                active={active}
                onToggle={() => toggleTopic(key)}
                ariaLabel={`Toggle ${INTENT_LABELS[intent]}`}
                color={INTENT_PILL[intent].text}
                marker="swatch"
              >
                {INTENT_LABELS[intent]}
              </FilterChip>
            )
          })}
        </div>
      </div>

      {/* Quiet reset anchor — tied to the rail with a top hairline so it reads
          as a deliberate footer action, not orphaned text (M12). */}
      <div className="border-t border-[#F0F1F3] pt-4">
        <button
          type="button"
          onClick={resetFilters}
          className="text-[12px] text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          aria-label="Reset all filters to default"
        >
          Reset filters
        </button>
      </div>
    </aside>
  )
}
