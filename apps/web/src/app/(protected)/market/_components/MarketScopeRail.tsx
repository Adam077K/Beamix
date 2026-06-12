'use client'

import { cn } from '@/lib/utils'
import { useAnalyticsFilter, type Timeframe } from '@/components/console/AnalyticsFilterContext'
import {
  REGION_ORDER,
  REGION_COLORS,
  INTENT_ORDER,
  INTENT_LABELS,
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
      {/* Group 1 — Regions (primary scope dimension) */}
      <div>
        <GroupLabel>Region</GroupLabel>
        <div className="space-y-1.5">
          {REGION_ORDER.map((region) => {
            const key = `${REGION_PREFIX}${region}`
            const active = isActive(topics, key)
            const color = REGION_COLORS[region] ?? '#9CA3AF'
            return (
              <button
                key={region}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`Toggle ${region}`}
                onClick={() => toggleTopic(key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  active
                    ? 'bg-[#EEF2FF] text-[#3370FF]'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? color : '#D1D5DB' }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-left">{region}</span>
              </button>
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

      {/* Group 3 — Intent (injected topic group) */}
      <div>
        <GroupLabel>Intent</GroupLabel>
        <div className="space-y-1.5">
          {INTENT_ORDER.map((intent) => {
            const key = `${INTENT_PREFIX}${intent}`
            const active = isActive(topics, key)
            return (
              <button
                key={intent}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`Toggle ${INTENT_LABELS[intent]}`}
                onClick={() => toggleTopic(key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  active
                    ? 'bg-[#EEF2FF] text-[#3370FF]'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    active ? 'bg-[#3370FF]' : 'bg-[#D1D5DB]',
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-left">{INTENT_LABELS[intent]}</span>
              </button>
            )
          })}
        </div>
      </div>

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
