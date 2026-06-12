'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAnalyticsFilter, type Timeframe } from './AnalyticsFilterContext'
import { FilterChip } from './FilterChip'

// ---------------------------------------------------------------------------
// Engine swatch colors — mapped to the data-viz series tokens
// data-1 #3370FF (blue — your-brand aggregate)
// data-2 #6E56F0 (violet — not used for engines; reserved for agent annotation)
// data-3 #06B6D4
// data-4 #10B981
// data-5 #F59E0B
// data-6 #EF4444
// ---------------------------------------------------------------------------

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#3370FF',       // data-1 — brand blue (aggregate)
  Gemini: '#06B6D4',        // data-3 — cyan
  Perplexity: '#10B981',    // data-4 — green
  Claude: '#F59E0B',        // data-5 — amber
  'AI Overviews': '#EF4444', // data-6 — red
}

const ENGINE_ORDER = ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'AI Overviews']

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'custom', label: 'Custom' },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AnalyticsScopeRailProps {
  /**
   * Page-specific topic/theme toggles injected by each surface worker.
   * Pass null to suppress the topic group entirely.
   */
  topicGroup?: ReactNode | null
  className?: string
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    // STEP-3 eyebrow
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// AnalyticsScopeRail
// ---------------------------------------------------------------------------

/**
 * AnalyticsScopeRail — TIER-3 .card-inset filter rail for Analytics surfaces.
 *
 * Three filter groups:
 *   1. Engines — checkbox-chips with 8px color swatch, drives engineOpacity()
 *   2. Timeframe — segmented control 7d / 30d / 90d / Custom
 *   3. Topics — injected via topicGroup prop (page-specific)
 *
 * Active chip: bg-status-info-bg text-status-info (#EEF2FF / #3370FF)
 * Inactive: neutral surface + muted text
 *
 * Reads and writes AnalyticsFilterContext (must be inside AnalyticsLayout).
 */
export function AnalyticsScopeRail({ topicGroup = null, className }: AnalyticsScopeRailProps) {
  const { engines, timeframe, toggleEngine, setTimeframe, resetFilters } = useAnalyticsFilter()

  return (
    <aside
      className={cn('card-inset p-5 space-y-6', className)}
      aria-label="Analytics filters"
    >
      {/* Group 1 — Engines */}
      <div>
        <GroupLabel>Engines</GroupLabel>
        <div className="space-y-1.5">
          {ENGINE_ORDER.map((engine) => {
            const active = engines[engine] !== false
            return (
              <FilterChip
                key={engine}
                active={active}
                onToggle={() => toggleEngine(engine)}
                ariaLabel={`Toggle ${engine}`}
                color={ENGINE_COLORS[engine] ?? '#9CA3AF'}
                marker="swatch"
              >
                {engine}
              </FilterChip>
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

      {/* Group 3 — Page-specific topics (injected by page worker) */}
      {topicGroup && (
        <div>
          {topicGroup}
        </div>
      )}

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
