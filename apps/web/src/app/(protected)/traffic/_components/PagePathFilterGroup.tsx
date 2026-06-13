'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { FilterChip } from '@/components/console/FilterChip'

/**
 * PagePathFilterGroup — the page-path filter group injected into TrafficScopeRail.
 *
 * Mirrors /analytics' TopicFilterGroup: checkbox-chips that drive the shared
 * `topics` record via toggleTopic. Filtering a path dims the matching
 * ContentPerformanceTable rows in the same 200ms gesture as the bot toggles.
 *
 * Page-path strings match the leading segment of a content row's `path`
 * (e.g. "/emergency-*" groups every emergency page).
 */

interface PagePathFilterGroupProps {
  paths: string[]
}

export function PagePathFilterGroup({ paths }: PagePathFilterGroupProps) {
  const { topics, toggleTopic } = useAnalyticsFilter()

  return (
    <div>
      {/* STEP-3 eyebrow — matches the rail's GroupLabel */}
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Page path
      </p>
      <div className="space-y-1.5">
        {paths.map((path) => {
          const active = topics[path] !== false
          return (
            <FilterChip
              key={path}
              active={active}
              onToggle={() => toggleTopic(path)}
              ariaLabel={`Toggle ${path}`}
              marker="none"
            >
              <span className="font-mono text-[13px] tabular-nums">{path}</span>
            </FilterChip>
          )
        })}
      </div>
    </div>
  )
}
