'use client'

import { useRef, useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { format } from 'date-fns'

interface TrendDataPoint {
  created_at: string
  overall_score: number
}

interface BlueTrendChartProps {
  data: TrendDataPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full shrink-0 bg-[#3370FF]" />
        <span className="text-slate-500">Visibility:</span>
        <span className="font-semibold text-slate-800">{payload[0].value}</span>
      </div>
    </div>
  )
}

export function BlueTrendChart({ data }: BlueTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const CHART_HEIGHT = 240

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height: CHART_HEIGHT }}>
        <p className="text-sm text-slate-500">Run 2+ scans to see trends</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.created_at), 'MMM d'),
    Visibility: d.overall_score,
  }))

  return (
    <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }}>
      {width > 0 && (
        <AreaChart
          width={width}
          height={CHART_HEIGHT}
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="blueVisibilityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3370FF" stopOpacity={0.22} />
              <stop offset="60%" stopColor="#3370FF" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#3370FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Visibility"
            stroke="#3370FF"
            strokeWidth={2.5}
            fill="url(#blueVisibilityGrad)"
            dot={{ r: 3.5, fill: '#3370FF', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    </div>
  )
}
