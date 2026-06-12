'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { FilterChip } from '@/components/console/FilterChip'

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
            <FilterChip
              key={topic}
              active={active}
              onToggle={() => toggleTopic(topic)}
              ariaLabel={`Toggle ${topic}`}
              marker="none"
            >
              {topic}
            </FilterChip>
          )
        })}
      </div>
    </div>
  )
}
