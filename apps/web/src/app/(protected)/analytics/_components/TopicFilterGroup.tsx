'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { cn } from '@/lib/utils'

/**
 * TopicFilterGroup — page-specific topic toggles injected into the ScopeRail.
 *
 * Mirrors the rail's engine-chip styling (active = blue tint). Toggling a topic
 * fades its row in the matrix (linked-instrument).
 */

interface TopicFilterGroupProps {
  topics: string[]
}

export function TopicFilterGroup({ topics }: TopicFilterGroupProps) {
  const { topics: topicState, toggleTopic } = useAnalyticsFilter()

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        Topics
      </p>
      <div className="space-y-1.5">
        {topics.map((topic) => {
          const active = topicState[topic] !== false
          return (
            <button
              key={topic}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-label={`Toggle ${topic}`}
              onClick={() => toggleTopic(topic)}
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
              <span className="flex-1 truncate text-left">{topic}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
