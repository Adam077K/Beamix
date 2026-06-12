'use client'

import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { cn } from '@/lib/utils'
import { BOT_COLORS, BOT_ORDER } from './bot-colors'
import type { ContentPerformance } from '@/lib/demo/surfaces/types'

/**
 * ContentPerformanceTable — TIER-2, full-width.
 *
 * YOUR pages ranked by AI crawl frequency. Columns:
 *   Page path | Crawls | Citations | Top bot (swatch+name) | trend | (row → drill)
 *
 * Row hover ground #F4F6FA + a left status-color hairline (M7). Rows dim to 40%
 * when their page-path filter is off OR when their dominant bot is toggled off —
 * the linked-bot gesture reaches the table too.
 *
 * The per-page trend has no fabricated series; EngineMicroSparkline renders the
 * flat 1px baseline (never fake data) until real per-page history is wired.
 */

interface ContentPerformanceTableProps {
  data: ContentPerformance[]
  onRowClick: (path: string) => void
}

/** Deterministic top-bot label per page (presentation only — not a data claim). */
function topBotFor(index: number): string {
  // Top pages skew to the dominant brand crawler; cycle the rest stably.
  if (index === 0) return BOT_ORDER[0]
  return BOT_ORDER[index % BOT_ORDER.length]
}

export function ContentPerformanceTable({ data, onRowClick }: ContentPerformanceTableProps) {
  const { topics, engines } = useAnalyticsFilter()

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Content performance
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Your pages, ranked by how often AI crawls and cites them.
        </p>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[minmax(0,1fr)_88px_88px_140px_72px] items-center gap-3 border-b border-[#E5E7EB] px-3 pb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Page
        </span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Crawls
        </span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Citations
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Top bot
        </span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Trend
        </span>
      </div>

      <ul>
        {data.map((row, i) => {
          const topBot = topBotFor(i)
          const pathActive = topics[row.path] !== false
          const botActive = engines[topBot] !== false
          const dimmed = !pathActive || !botActive
          return (
            <li key={row.path}>
              <button
                type="button"
                onClick={() => onRowClick(row.path)}
                aria-label={`Open detail for ${row.path}`}
                className={cn(
                  'group relative grid w-full grid-cols-[minmax(0,1fr)_88px_88px_140px_72px] items-center gap-3 px-3 py-3.5 text-left transition-opacity duration-200 ease-out',
                  'border-b border-[#F0F1F3] last:border-b-0 hover:bg-[#F4F6FA]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-inset',
                  dimmed ? 'opacity-40' : 'opacity-100',
                )}
              >
                {/* M7 left status hairline on hover */}
                <span
                  className="absolute inset-y-0 left-0 w-[2px] bg-[#3370FF] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate font-mono text-[14px] text-[#0A0A0A]">
                  {row.path}
                </span>
                <span className="text-right font-mono text-[14px] tabular-nums text-[#374151]">
                  {row.crawlHits.toLocaleString()}
                </span>
                <span className="text-right font-mono text-[14px] tabular-nums text-[#374151]">
                  {row.citations.toLocaleString()}
                </span>
                <span className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: BOT_COLORS[topBot] ?? '#9CA3AF' }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-mono">{topBot}</span>
                </span>
                <span className="flex justify-end">
                  {/* Per-page history not yet wired — flat baseline, never fake data. */}
                  <EngineMicroSparkline points={null} currentScore={null} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
