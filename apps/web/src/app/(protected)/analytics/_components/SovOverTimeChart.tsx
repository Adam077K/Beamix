'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { COMPETITOR_GREYS, shortDate } from './engine-colors'
import type { SovTrendPoint } from '@/lib/demo/surfaces/types'

/**
 * SovOverTimeChart — TIER-2, ~60% width of the weighted 2-up row.
 *
 * Stacked AreaChart: you (blue, top of stack) vs. competitors in descending grey
 * tints. The narrowing gap is the story — your blue band grows.
 */

interface SovOverTimeChartProps {
  data: SovTrendPoint[]
}

/** Order: competitors first (bottom→up), you on top so the blue caps the stack. */
const COMPETITOR_ORDER = ['Smile Center', 'Dental Plus', 'Ramat Gan Dental', 'Others'] as const

interface StackRow {
  label: string
  us: number
  [competitor: string]: string | number
}

function SovTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
        {label}
      </p>
      <ul className="space-y-0.5">
        {[...payload].reverse().map((p) => (
          <li key={p.name} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
              aria-hidden="true"
            />
            <span
              className={p.name === 'You' ? 'flex-1 font-medium text-[#0A0A0A]' : 'flex-1 text-[#374151]'}
            >
              {p.name}
            </span>
            <span className="font-mono tabular-nums text-[#0A0A0A]">{p.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SovOverTimeChart({ data }: SovOverTimeChartProps) {
  const rows = useMemo<StackRow[]>(
    () =>
      data.map((pt) => {
        const row: StackRow = { label: shortDate(pt.date), us: pt.us }
        for (const c of COMPETITOR_ORDER) {
          row[c] = pt.competitors[c] ?? 0
        }
        return row
      }),
    [data],
  )

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Share of voice over time
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Your slice (blue) against the field.
        </p>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
            <CartesianGrid stroke="var(--color-data-grid)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              dy={6}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip content={<SovTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />

            {/* Competitors stacked at the bottom (descending greys) */}
            {COMPETITOR_ORDER.map((c) => (
              <Area
                key={c}
                type="monotone"
                dataKey={c}
                name={c}
                stackId="sov"
                stroke={COMPETITOR_GREYS[c]}
                strokeWidth={1}
                fill={COMPETITOR_GREYS[c]}
                fillOpacity={0.55}
                isAnimationActive={false}
              />
            ))}
            {/* You — blue, caps the stack */}
            <Area
              type="monotone"
              dataKey="us"
              name="You"
              stackId="sov"
              stroke="#3370FF"
              strokeWidth={1.5}
              fill="#3370FF"
              fillOpacity={0.85}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
