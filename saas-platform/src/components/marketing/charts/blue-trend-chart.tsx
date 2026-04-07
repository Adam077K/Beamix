'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface TrendDataPoint {
  created_at: string
  overall_score: number
}

interface BlueTrendChartProps {
  data: TrendDataPoint[]
  height?: number
}

// ─── Premium dark tooltip (Attio-style) ──────────────────────────────────────

function PremiumTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-900 bg-gray-900 px-3.5 py-2.5 shadow-xl">
      <p className="text-[10px] text-gray-400 mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full shrink-0 bg-[#3370FF] shadow-[0_0_6px_rgba(51,112,255,0.6)]" />
        <span className="text-[11px] text-gray-400">Score</span>
        <span className="text-sm font-semibold text-white tabular-nums ml-auto">{payload[0].value}%</span>
      </div>
    </div>
  )
}

// ─── Cursor line (vertical guide on hover) ───────────────────────────────────

function CursorLine({ points, height }: { points?: Array<{ x: number }>; height?: number }) {
  if (!points?.length) return null
  return (
    <line
      x1={points[0].x}
      y1={0}
      x2={points[0].x}
      y2={height ?? 200}
      stroke="#3370FF"
      strokeWidth={1}
      strokeOpacity={0.2}
      strokeDasharray="4 4"
    />
  )
}

export function BlueTrendChart({ data, height = 220 }: BlueTrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-gray-400">Run 2+ scans to see trends</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.created_at), 'MMM d'),
    Visibility: d.overall_score,
  }))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="blueVisGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3370FF" stopOpacity={0.18} />
              <stop offset="50%" stopColor="#3370FF" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#3370FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={<PremiumTooltip />}
            cursor={<CursorLine />}
          />
          <Area
            type="monotone"
            dataKey="Visibility"
            stroke="#3370FF"
            strokeWidth={2}
            fill="url(#blueVisGrad)"
            dot={false}
            activeDot={{
              r: 4.5,
              fill: '#3370FF',
              stroke: '#fff',
              strokeWidth: 2,
              style: { filter: 'drop-shadow(0 0 4px rgba(51,112,255,0.4))' },
            }}
            connectNulls
            isAnimationActive
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
