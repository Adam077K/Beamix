'use client'

import { useMemo } from 'react'
import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { cn } from '@/lib/utils'
import type { ContentPerformance } from '@/lib/demo/surfaces/types'

/**
 * ContentPerformanceTable — TIER-2, full-width.
 *
 * YOUR pages ranked by AI crawl frequency. Columns:
 *   Page path | Crawls (+ in-row share bar) | Citations | (row → drill)
 *
 * In-row texture (M4-adjacent dense-row pattern): each row carries a thin
 * crawl-share bar derived from REAL crawlHits (share of the top page's hits) —
 * the column reads as live data, not a wall of bare numbers, with zero fabricated
 * series. The previous "Top bot" (index % n fiction) and the all-null flat Trend
 * column were dropped — a column that LOOKS measured but is index-derived, and a
 * column of identical flat baselines, are exactly the tells the rubric forbids.
 *
 * Row hover ground #F4F6FA + a left status-color hairline (M7). Rows dim to 40%
 * when their page-path filter is off — the linked gesture reaches the table too.
 *
 * Responsive: a fixed 3-col grid at sm+ (path / crawls / citations), and a
 * stacked 2-line card below sm so the row never overflows a 375px viewport.
 */

interface ContentPerformanceTableProps {
  data: ContentPerformance[]
  onRowClick: (path: string) => void
}

/** Tabular figures in Geist Mono tabular-nums (M11 — every real number is mono). */
function Figure({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>{value.toLocaleString()}</span>
  )
}

export function ContentPerformanceTable({ data, onRowClick }: ContentPerformanceTableProps) {
  const { topics } = useAnalyticsFilter()

  // Real crawl-share baseline: the most-crawled page anchors the bar scale.
  const maxCrawls = useMemo(
    () => Math.max(1, ...data.map((d) => d.crawlHits)),
    [data],
  )
  const totalCrawls = useMemo(
    () => data.reduce((s, d) => s + d.crawlHits, 0),
    [data],
  )

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

      {/* Header row — sm+ only; the stacked mobile cards carry their own labels */}
      <div className="hidden grid-cols-[minmax(0,1fr)_180px_96px] items-center gap-4 border-b border-[#E5E7EB] px-3 pb-2.5 sm:grid">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Page
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Crawl hits
        </span>
        <span className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Citations
        </span>
      </div>

      <ul>
        {data.map((row) => {
          const pathActive = topics[row.path] !== false
          const share = Math.round((row.crawlHits / totalCrawls) * 100)
          const barPct = Math.max(4, Math.round((row.crawlHits / maxCrawls) * 100))
          return (
            <li key={row.path}>
              <button
                type="button"
                onClick={() => onRowClick(row.path)}
                aria-label={`Open detail for ${row.path} — ${row.crawlHits.toLocaleString()} crawl hits, ${row.citations.toLocaleString()} citations`}
                className={cn(
                  'group relative w-full px-3 py-3.5 text-left transition-opacity duration-200 ease-out',
                  'border-b border-[#F0F1F3] last:border-b-0 hover:bg-[#F4F6FA]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-inset',
                  // sm+: fixed 3-col grid. <sm: two stacked rows.
                  'flex flex-col gap-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_180px_96px] sm:items-center sm:gap-4',
                  pathActive ? 'opacity-100' : 'opacity-40',
                )}
              >
                {/* M7 left status hairline on hover */}
                <span
                  className="absolute inset-y-0 left-0 w-[2px] bg-[#3370FF] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />

                {/* Page path */}
                <span className="min-w-0 truncate font-mono text-[14px] text-[#0A0A0A]">
                  {row.path}
                </span>

                {/* Crawl hits — figure + in-row share bar (real data texture, M4) */}
                <div className="flex items-center gap-2.5">
                  <Figure
                    value={row.crawlHits}
                    className="w-12 shrink-0 text-[14px] text-[#374151] sm:text-right"
                  />
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0F1F3] sm:max-w-[96px]"
                    role="img"
                    aria-label={`${share}% of crawl volume`}
                  >
                    <div
                      className="h-full rounded-full bg-[#3370FF]/70 transition-[width] duration-200 ease-out"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular-nums text-[#9CA3AF]">
                    {share}%
                  </span>
                </div>

                {/* Citations */}
                <div className="flex items-baseline justify-between gap-2 sm:block sm:text-right">
                  <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9CA3AF] sm:hidden">
                    Citations
                  </span>
                  <Figure value={row.citations} className="text-[14px] text-[#374151]" />
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
