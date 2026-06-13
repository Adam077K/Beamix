'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AnalyticsFilterProvider } from './AnalyticsFilterContext'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AnalyticsLayoutProps {
  /** The PageHeader node (TIER-3 .card-inset eyebrow+title+stat strip) */
  header: ReactNode
  /** The sticky Scope Rail (AnalyticsScopeRail or custom) */
  scopeRail: ReactNode
  /** The main content area — hero figure + viz family */
  children: ReactNode
  className?: string
}

/**
 * AnalyticsLayout — the Analytics Console grid shell.
 *
 * Structure: [PageHeader] (full width) → sticky Scope Rail (240px) + main content area.
 *
 * Grid contract (M3 intentional asymmetry):
 *   lg: `grid-cols-[240px_minmax(0,1fr)]` — fixed rail, fluid main
 *   <lg: single-column stacked (rail above content)
 *
 * Scope Rail: `lg:sticky lg:top-6 self-start` — fixed during scroll on desktop.
 *
 * FilterProvider wraps the entire layout so both the rail and the content
 * share the same engine/timeframe/topic state without prop-drilling.
 *
 * Entrance choreography (M9): header = craft-enter-1, rail = craft-enter-2,
 * content = craft-enter-3 (staggered fade-up 8px, ≤200ms).
 */
export function AnalyticsLayout({
  header,
  scopeRail,
  children,
  className,
}: AnalyticsLayoutProps) {
  return (
    <AnalyticsFilterProvider>
      <div className={cn('w-full px-4 pb-16 pt-8 sm:px-6', className)}>
        {/* Full-width page header */}
        <div className="craft-enter craft-enter-1 mb-8">
          {header}
        </div>

        {/* Two-column grid at lg+; single-column below */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Scope Rail — sticky on desktop */}
          <div className="craft-enter craft-enter-2 lg:sticky lg:top-6 lg:self-start">
            {scopeRail}
          </div>

          {/* Main content — hero + viz family */}
          <div className="craft-enter craft-enter-3 min-w-0 space-y-8">
            {children}
          </div>
        </div>
      </div>
    </AnalyticsFilterProvider>
  )
}
