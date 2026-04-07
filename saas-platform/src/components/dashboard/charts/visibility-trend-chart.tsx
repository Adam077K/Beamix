'use client'

import { useRef, useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
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
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm text-xs">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: '#3370FF' }}
        />
        <span className="text-muted-foreground">Score:</span>
        <span className="font-medium text-foreground tabular-nums">
          {payload[0]?.value ?? '\u2014'}
        </span>
      </div>
    </div>
  )
}

export function VisibilityTrendChart({ data }: VisibilityTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 220 })

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: 220 })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  if (data.length < 2) {
    return (
      <div className="flex h-[220px] items-center justify-center text-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Run 2+ scans to see trends
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Each scan adds a data point to your visibility history
          </p>
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.created_at), 'MMM d'),
    score: d.overall_score ?? 0,
  }))

  const scores = chartData.map((d) => d.score).filter((s) => s > 0)
  const yMin = scores.length > 0 ? Math.max(0, Math.min(...scores) - 10) : 0
  const yMax = scores.length > 0 ? Math.max(...scores) + 5 : 100

  // Last data point for the "current value" dot
  const lastPoint = chartData[chartData.length - 1]

  if (dimensions.width === 0) {
    return <div ref={containerRef} className="w-full h-[220px] animate-pulse bg-muted/30 rounded-lg" />
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height: 220 }}>
      {dimensions.width > 0 && (
        <AreaChart
          width={dimensions.width}
          height={220}
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="visibilityAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3370FF" stopOpacity={0.08} />
              <stop offset="80%" stopColor="#3370FF" stopOpacity={0.01} />
              <stop offset="100%" stopColor="#3370FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="var(--color-border, #E5E7EB)"
            strokeOpacity={0.3}
            vertical={false}
            horizontalCoordinatesGenerator={(props) => {
              const { height } = props
              const count = 4
              return Array.from({ length: count }, (_, i) =>
                Math.round((height / (count + 1)) * (i + 1))
              )
            }}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground, #6B7280)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground, #6B7280)' }}
            axisLine={false}
            tickLine={false}
            domain={[yMin, yMax]}
            tickCount={5}
            tickFormatter={(val: number) => Math.round(val).toString()}
            width={32}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'var(--color-border, #E5E7EB)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3370FF"
            strokeWidth={1.5}
            fill="url(#visibilityAreaFill)"
            dot={false}
            activeDot={{
              r: 3.5,
              fill: '#3370FF',
              strokeWidth: 2,
              stroke: 'var(--color-card, #FFFFFF)',
            }}
            connectNulls
            isAnimationActive={false}
          />
          {/* Current value dot on the last data point */}
          {lastPoint && (
            <ReferenceDot
              x={lastPoint.date}
              y={lastPoint.score}
              r={4}
              fill="#3370FF"
              stroke="var(--color-card, #FFFFFF)"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
          )}
        </AreaChart>
      )}
    </div>
  )
}
