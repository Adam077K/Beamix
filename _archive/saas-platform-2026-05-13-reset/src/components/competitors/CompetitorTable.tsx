'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'

export interface Competitor {
  id: string
  name: string
  url: string
  appearanceRate: number
  queriesWhereAppears: string[]
  fourWeekTrend: number[]
}

interface CompetitorTableProps {
  competitors: Competitor[]
  sortKey: 'appearanceRate' | 'name'
  onSortChange: (key: 'appearanceRate' | 'name') => void
  onSelectCompetitor: (competitor: Competitor) => void
}

// ─── Favicon ──────────────────────────────────────────────────────────────────

function Favicon({ domain }: { domain: string }) {
  const [errored, setErrored] = React.useState(false)
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  if (errored) {
    return (
      <div className="size-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-400 shrink-0">
        {domain.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      className="size-4 rounded shrink-0"
      onError={() => setErrored(true)}
    />
  )
}

// ─── SoV bar ──────────────────────────────────────────────────────────────────

function SovBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="h-1.5 w-24 rounded-full bg-gray-100 shrink-0 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#3370FF] transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="presentation"
        />
      </div>
      <span className="text-xs tabular-nums font-medium text-gray-700 shrink-0 w-8 text-right">
        {pct}%
      </span>
    </div>
  )
}

// ─── Trend arrow + sparkline ──────────────────────────────────────────────────

function TrendCell({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="text-gray-300">—</span>

  const first = values[0]
  const last = values[values.length - 1]
  const delta = last - first

  const isRising = delta > 0
  const isFalling = delta < 0

  // Mini sparkline
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 48
  const H = 16
  const step = W / (values.length - 1)

  const points = values
    .map((v, i) => {
      const x = i * step
      const y = H - ((v - min) / range) * (H - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const strokeColor = isRising ? '#10b981' : isFalling ? '#ef4444' : '#9ca3af'

  return (
    <div className="flex items-center gap-1.5">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {isRising ? (
        <TrendingUp className="size-3.5 text-emerald-500 shrink-0" />
      ) : isFalling ? (
        <TrendingDown className="size-3.5 text-red-400 shrink-0" />
      ) : (
        <Minus className="size-3.5 text-gray-400 shrink-0" />
      )}
    </div>
  )
}

// ─── Sort header ──────────────────────────────────────────────────────────────

interface SortHeaderProps {
  label: string
  field: 'appearanceRate' | 'name'
  current: 'appearanceRate' | 'name'
  onSort: (field: 'appearanceRate' | 'name') => void
}

function SortHeader({ label, field, current, onSort }: SortHeaderProps) {
  const active = field === current
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors duration-100',
        active ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600',
      )}
    >
      {label}
      <span
        className={cn(
          'inline-block transition-opacity duration-100',
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        {active ? ' ↓' : ''}
      </span>
    </button>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function CompetitorTable({
  competitors,
  sortKey,
  onSortChange,
  onSelectCompetitor,
}: CompetitorTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Competitor"
                  field="name"
                  current={sortKey}
                  onSort={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Share of voice"
                  field="appearanceRate"
                  current={sortKey}
                  onSort={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden md:table-cell">
                4-week trend
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 hidden lg:table-cell">
                Top queries
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {competitors.map((competitor) => (
              <tr
                key={competitor.id}
                className="group cursor-pointer hover:bg-gray-50/60 transition-colors duration-100"
                onClick={() => onSelectCompetitor(competitor)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectCompetitor(competitor)
                  }
                }}
                aria-label={`View details for ${competitor.name}`}
              >
                {/* Competitor identity */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Favicon domain={competitor.url} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {competitor.name}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{competitor.url}</p>
                    </div>
                  </div>
                </td>

                {/* SoV bar */}
                <td className="px-4 py-3.5">
                  <SovBar rate={competitor.appearanceRate} />
                </td>

                {/* Trend */}
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <TrendCell values={competitor.fourWeekTrend} />
                </td>

                {/* Query count */}
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="text-xs text-gray-500 tabular-nums">
                    {competitor.queriesWhereAppears.length} quer
                    {competitor.queriesWhereAppears.length !== 1 ? 'ies' : 'y'}
                  </span>
                </td>

                {/* Chevron */}
                <td className="px-3 py-3.5">
                  <ChevronRight className="size-4 text-gray-300 group-hover:text-gray-500 transition-colors duration-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
