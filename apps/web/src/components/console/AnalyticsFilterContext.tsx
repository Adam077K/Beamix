'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Timeframe = '7d' | '30d' | '90d' | 'custom'

export interface AnalyticsFilterState {
  /** Per-engine toggle — true = visible */
  engines: Record<string, boolean>
  timeframe: Timeframe
  /** Page-specific topic toggles — true = visible */
  topics: Record<string, boolean>
  toggleEngine: (engineId: string) => void
  setTimeframe: (timeframe: Timeframe) => void
  toggleTopic: (topicId: string) => void
  resetFilters: () => void
}

// ---------------------------------------------------------------------------
// Default engine set (all on)
// ---------------------------------------------------------------------------

const DEFAULT_ENGINES: Record<string, boolean> = {
  ChatGPT: true,
  Gemini: true,
  Perplexity: true,
  Claude: true,
  'AI Overviews': true,
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AnalyticsFilterContext = createContext<AnalyticsFilterState | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface AnalyticsFilterProviderProps {
  children: ReactNode
  /** Optional initial engine toggles (defaults to all-on) */
  initialEngines?: Record<string, boolean>
  /** Optional initial topic toggles */
  initialTopics?: Record<string, boolean>
}

export function AnalyticsFilterProvider({
  children,
  initialEngines = DEFAULT_ENGINES,
  initialTopics = {},
}: AnalyticsFilterProviderProps) {
  const [engines, setEngines] = useState<Record<string, boolean>>(initialEngines)
  const [timeframe, setTimeframeState] = useState<Timeframe>('30d')
  const [topics, setTopics] = useState<Record<string, boolean>>(initialTopics)

  const toggleEngine = useCallback((engineId: string) => {
    setEngines((prev) => ({ ...prev, [engineId]: !prev[engineId] }))
  }, [])

  const setTimeframe = useCallback((t: Timeframe) => {
    setTimeframeState(t)
  }, [])

  const toggleTopic = useCallback((topicId: string) => {
    setTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }))
  }, [])

  const resetFilters = useCallback(() => {
    setEngines(initialEngines)
    setTimeframeState('30d')
    setTopics(initialTopics)
  }, [initialEngines, initialTopics])

  return (
    <AnalyticsFilterContext.Provider
      value={{ engines, timeframe, topics, toggleEngine, setTimeframe, toggleTopic, resetFilters }}
    >
      {children}
    </AnalyticsFilterContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAnalyticsFilter — consume the filter state from any child component.
 * Must be used inside <AnalyticsFilterProvider> (wrapped by AnalyticsLayout).
 */
export function useAnalyticsFilter(): AnalyticsFilterState {
  const ctx = useContext(AnalyticsFilterContext)
  if (!ctx) {
    throw new Error('useAnalyticsFilter must be used inside AnalyticsFilterProvider')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Helper — engine opacity class
// ---------------------------------------------------------------------------

/**
 * engineOpacity — returns the Tailwind opacity class for a series/column.
 *
 * Toggling an engine off fades it to 40% via `transition-opacity duration-200 ease-out`.
 * NO refetch, NO unmount, NO animation lib — pure CSS transition.
 *
 * Usage:
 *   <div className={cn('transition-opacity duration-200 ease-out', engineOpacity('ChatGPT', filter))}>
 */
export function engineOpacity(
  engineId: string,
  filter: Pick<AnalyticsFilterState, 'engines'>,
): 'opacity-100' | 'opacity-40' {
  return filter.engines[engineId] === false ? 'opacity-40' : 'opacity-100'
}
