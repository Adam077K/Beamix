'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AnalyticsFilterProvider } from '@/components/console/AnalyticsFilterContext'
import { BOT_ORDER } from './bot-colors'

/**
 * TrafficLayout — the /traffic mirror of AnalyticsLayout.
 *
 * Identical grid shell, sticky rail, and craft-enter stagger as AnalyticsLayout
 * (verbatim contract). The ONLY difference: it seeds AnalyticsFilterProvider's
 * `engines` record with the BOT id set instead of the analytics engine set, so
 * the inherited filter machinery (toggleEngine / engineOpacity) operates on
 * bots. This honors "don't edit console/*" — AnalyticsLayout hard-codes the
 * analytics engine defaults, so /traffic needs its own thin wrapper.
 *
 * Grid contract (M3 intentional asymmetry):
 *   lg: `grid-cols-[240px_minmax(0,1fr)]` — fixed rail, fluid main
 *   <lg: single-column stacked
 */

const INITIAL_BOTS: Record<string, boolean> = Object.fromEntries(
  BOT_ORDER.map((bot) => [bot, true]),
)

interface TrafficLayoutProps {
  header: ReactNode
  scopeRail: ReactNode
  children: ReactNode
  className?: string
}

export function TrafficLayout({ header, scopeRail, children, className }: TrafficLayoutProps) {
  return (
    <AnalyticsFilterProvider initialEngines={INITIAL_BOTS}>
      <div className={cn('w-full px-4 pb-16 pt-8 sm:px-6', className)}>
        {/* Full-width page header */}
        <div className="craft-enter craft-enter-1 mb-8">{header}</div>

        {/* Two-column grid at lg+; single-column below */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Scope Rail — sticky on desktop */}
          <div className="craft-enter craft-enter-2 lg:sticky lg:top-6 lg:self-start">
            {scopeRail}
          </div>

          {/* Main content — hero + viz family */}
          <div className="craft-enter craft-enter-3 min-w-0 space-y-8">{children}</div>
        </div>
      </div>
    </AnalyticsFilterProvider>
  )
}
