'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { cn } from '@/lib/utils'

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
            <button
              key={path}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-label={`Toggle ${path}`}
              onClick={() => toggleTopic(path)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                active
                  ? 'bg-[#EEF2FF] text-[#3370FF]'
                  : 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
              )}
            >
              <span className="flex-1 truncate text-left font-mono text-[13px] tabular-nums">
                {path}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
