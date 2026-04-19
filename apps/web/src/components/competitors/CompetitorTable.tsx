'use client'

import { cn } from '@/lib/utils'

interface Competitor {
  id: string
  name: string
  url: string
  appearanceRate: number
  queriesWhereAppears: string[]
  fourWeekTrend: number[]
}

interface CompetitorTableProps {
  competitors: Competitor[]
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 60
  const height = 20
  const step = width / (values.length - 1)

  const points = values
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const isRising = values[values.length - 1] > values[0]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={isRising ? '#10b981' : '#6b7280'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AppearanceBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-1.5 w-20 rounded-full bg-gray-100 shrink-0">
        <div
          className="h-full rounded-full bg-[#3370FF] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-gray-600 shrink-0">{pct}%</span>
    </div>
  )
}

export function CompetitorTable({ competitors }: CompetitorTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Competitor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden sm:table-cell">
              URL
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Appearance rate
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">
              4-week trend
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {competitors.map((competitor) => (
            <tr
              key={competitor.id}
              className={cn(
                'transition-colors duration-150',
                'hover:bg-gray-50'
              )}
            >
              <td className="px-4 py-3.5">
                <span className="font-medium text-gray-900">{competitor.name}</span>
              </td>
              <td className="px-4 py-3.5 hidden sm:table-cell">
                <a
                  href={`https://${competitor.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#3370FF] transition-colors duration-150 text-xs"
                >
                  {competitor.url}
                </a>
              </td>
              <td className="px-4 py-3.5">
                <AppearanceBar rate={competitor.appearanceRate} />
              </td>
              <td className="px-4 py-3.5 hidden md:table-cell">
                <Sparkline values={competitor.fourWeekTrend} />
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
                  aria-label={`View details for ${competitor.name}`}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
