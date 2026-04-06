'use client'

import { useRef, useState, useEffect } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { format } from 'date-fns'

interface TrendDataPoint {
  created_at: string
  overall_score: number | null
  mentions_count: number
  avg_position: number | null
  sentiment_positive_pct: number | null
}

interface VisibilityTrendChartProps {
  data: TrendDataPoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg text-xs">
      <p className="mb-1.5 font-semibold text-slate-700">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color || p.stroke }}
          />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">
            {p.value ?? '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function VisibilityTrendChart({ data }: VisibilityTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 260 })

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: 260 })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  if (data.length < 2) {
    return (
      <div className="flex h-[260px] items-center justify-center text-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Run 2+ scans to see trends
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Each scan adds a data point to your visibility history
          </p>
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.created_at), 'MMM d'),
    Visibility: d.overall_score,
    Sentiment: d.sentiment_positive_pct,
    Position:
      d.avg_position != null ? Math.round((10 - d.avg_position) * 10) : null,
  }))

  return (
    <div ref={containerRef} className="w-full" style={{ height: 260 }}>
      {dimensions.width > 0 && (
        <ComposedChart
          width={dimensions.width}
          height={260}
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="visibilityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0077b6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0077b6" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            strokeOpacity={0.5}
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
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="Visibility"
            stroke="#0077b6"
            strokeWidth={2.5}
            fill="url(#visibilityGrad)"
            dot={{ r: 3.5, fill: '#0077b6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="Sentiment"
            stroke="#00b4d8"
            strokeWidth={2}
            dot={{ r: 3, fill: '#00b4d8', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="Position"
            stroke="#48cae4"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={{ r: 2.5, fill: '#48cae4', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      )}
    </div>
  )
}
