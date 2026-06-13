'use client'

import { useMemo } from 'react'
import { engineOpacity, useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { cn } from '@/lib/utils'
import { ENGINE_ORDER, scoreBandTint } from './engine-colors'
import type { TopicRankCell } from '@/lib/demo/surfaces/types'

/**
 * TopicRankMatrix — TIER-2, full-width heatmap table.
 *
 * Rows = topics, columns = engines. Each cell = avg rank, ground tinted by score
 * band at low opacity, number in Geist Mono. Click a cell → drill drawer.
 *
 * Linked-instrument: toggling an engine fades its whole column to 40%
 * (engineOpacity + 200ms transition). Topic toggles fade rows.
 */

interface TopicRankMatrixProps {
  cells: TopicRankCell[]
  /** Fires with topic+engine when a cell is clicked → opens the drill drawer. */
  onCellClick: (topic: string, engine: string) => void
}

export function TopicRankMatrix({ cells, onCellClick }: TopicRankMatrixProps) {
  const filter = useAnalyticsFilter()

  const { topics, byKey } = useMemo(() => {
    const topics: string[] = []
    const byKey: Record<string, TopicRankCell> = {}
    for (const c of cells) {
      if (!topics.includes(c.topic)) topics.push(c.topic)
      byKey[`${c.topic}__${c.engine}`] = c
    }
    return { topics, byKey }
  }, [cells])

  /** A topic is hidden only when an explicit false toggle exists for it. */
  const topicVisible = (topic: string) => filter.topics[topic] !== false

  return (
    <div className="card-console overflow-hidden p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Rankings by topic
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Your average rank per topic, per engine. Click any cell to see the prompts behind it.
        </p>
      </div>

      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[640px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-[180px] pb-2 text-left align-bottom">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                  Topic
                </span>
              </th>
              {ENGINE_ORDER.map((engine) => (
                <th
                  key={engine}
                  className={cn(
                    'pb-2 align-bottom transition-opacity duration-200 ease-out',
                    engineOpacity(engine, filter),
                  )}
                >
                  <span className="block text-center text-[11px] font-medium text-[#6B7280]">
                    {engine}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr
                key={topic}
                className={cn(
                  'transition-opacity duration-200 ease-out',
                  topicVisible(topic) ? 'opacity-100' : 'opacity-40',
                )}
              >
                <th
                  scope="row"
                  className="py-1 pr-3 text-left align-middle text-[13px] font-medium text-[#374151]"
                >
                  {topic}
                </th>
                {ENGINE_ORDER.map((engine) => {
                  const cell = byKey[`${topic}__${engine}`]
                  const tint = cell ? scoreBandTint(cell.scoreBand) : null
                  const engineVisible = filter.engines[engine] !== false
                  return (
                    <td
                      key={engine}
                      className={cn(
                        'transition-opacity duration-200 ease-out',
                        engineOpacity(engine, filter),
                      )}
                    >
                      {cell ? (
                        <button
                          type="button"
                          onClick={() => onCellClick(topic, engine)}
                          aria-label={`${topic} on ${engine}: average rank ${cell.avgRank.toFixed(
                            1,
                          )}. View details.`}
                          className="flex h-11 w-full items-center justify-center rounded-md text-[15px] font-medium transition-[transform,box-shadow] duration-150 ease-out hover:scale-[1.03] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
                          style={{ backgroundColor: tint!.bg }}
                        >
                          <span
                            className="font-mono tabular-nums"
                            style={{ color: engineVisible ? tint!.text : '#9CA3AF' }}
                          >
                            #{cell.avgRank.toFixed(1)}
                          </span>
                        </button>
                      ) : (
                        <div
                          className="flex h-11 w-full items-center justify-center rounded-md bg-[#F7F7F7]"
                          aria-hidden="true"
                        >
                          <span className="font-mono text-[13px] text-[#D1D5DB]">—</span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
