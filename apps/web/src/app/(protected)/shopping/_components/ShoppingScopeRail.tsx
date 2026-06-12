'use client'

import { cn } from '@/lib/utils'
import { useAnalyticsFilter, type Timeframe } from '@/components/console/AnalyticsFilterContext'

// ---------------------------------------------------------------------------
// Shopping scope — three engines only (ChatGPT / Gemini / Perplexity), the
// Discover-tier set that the shop is measured against. Product-category lives
// in the shared `topics` slot of the filter context.
// ---------------------------------------------------------------------------

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#3370FF', // data-1 — brand blue
  Gemini: '#06B6D4', // data-3 — cyan
  Perplexity: '#10B981', // data-4 — green
}

const ENGINE_ORDER = ['ChatGPT', 'Gemini', 'Perplexity']

const CATEGORIES = ['Whitening', 'Brushes', 'Aligner-care'] as const

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
      {children}
    </p>
  )
}

/**
 * ShoppingScopeRail — TIER-3 .card-inset scope rail (right column, sticky).
 *
 * Three groups: Engines · Product category · Timeframe. Selecting re-scopes
 * every panel via the shared AnalyticsFilterContext (engineOpacity ripple).
 * Category toggles ride the context's `topics` map.
 */
export function ShoppingScopeRail() {
  const { engines, timeframe, topics, toggleEngine, setTimeframe, toggleTopic, resetFilters } =
    useAnalyticsFilter()

  return (
    <aside className="card-inset space-y-6 p-5" aria-label="Shopping filters">
      {/* Engines */}
      <div>
        <GroupLabel>Engines</GroupLabel>
        <div className="space-y-1.5">
          {ENGINE_ORDER.map((engine) => {
            const active = engines[engine] !== false
            const color = ENGINE_COLORS[engine] ?? '#9CA3AF'
            return (
              <button
                key={engine}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`Toggle ${engine}`}
                onClick={() => toggleEngine(engine)}
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
                <span className="flex-1 truncate text-left">{engine}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Product category */}
      <div>
        <GroupLabel>Product category</GroupLabel>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => {
            // Category is "active" when it has not been explicitly toggled off.
            const active = topics[cat] !== false
            return (
              <button
                key={cat}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`Toggle ${cat}`}
                onClick={() => toggleTopic(cat)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  active
                    ? 'bg-[#EEF2FF] text-[#3370FF]'
                    : 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-[3px]',
                    active ? 'bg-[#3370FF]' : 'bg-[#D1D5DB]',
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-left">{cat}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeframe */}
      <div>
        <GroupLabel>Timeframe</GroupLabel>
        <div
          role="group"
          aria-label="Timeframe selection"
          className="grid grid-cols-3 gap-1 rounded-lg bg-[#F3F4F6] p-1"
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
