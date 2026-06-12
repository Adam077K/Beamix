'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { regionKeyFor, type IntentKey } from './market-colors'
import { REGION_PREFIX, INTENT_PREFIX, isActive } from './MarketScopeRail'

/**
 * useMarketRowVisible — returns a predicate that reports whether a prompt row is
 * "in scope" under the current region + intent filters. A row dims (opacity-40)
 * when its region OR intent is toggled off in the rail. Pure derived state, no
 * refetch — the linked-instrument gesture.
 */
export function useMarketRowVisible() {
  const { topics } = useAnalyticsFilter()

  return (row: { region: string; intent: string }): boolean => {
    const regionKey = `${REGION_PREFIX}${regionKeyFor(row.region)}`
    const intentKey = `${INTENT_PREFIX}${row.intent}`
    return isActive(topics, regionKey) && isActive(topics, intentKey)
  }
}

/** Whether a given intent is currently visible (for chart/legend dimming). */
export function useIntentVisible() {
  const { topics } = useAnalyticsFilter()
  return (intent: IntentKey): boolean => isActive(topics, `${INTENT_PREFIX}${intent}`)
}
