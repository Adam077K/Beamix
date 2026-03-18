'use client'

import * as React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import {
  DEFAULT_GRID_PROPS,
  DEFAULT_XAXIS_PROPS,
  DEFAULT_YAXIS_PROPS,
  CHART_ANIMATION,
  CHART_MARGINS,
} from '@/lib/chart-theme'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BeamixAreaChartProps {
  data: Record<string, unknown>[]
  /** Data key for the Y-axis series, e.g. 'score' */
  dataKey: string
  /** Data key for the X-axis labels, e.g. 'date' */
  xAxisKey: string
  /** CSS var or hex color; defaults to 'var(--chart-1)' */
  color?: string
  /** Chart height in px; defaults to 300 */
  height?: number
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
  className?: string
}

// ─── BeamixAreaChart ──────────────────────────────────────────────────────────

export function BeamixAreaChart({
  data,
  dataKey,
  xAxisKey,
  color = 'var(--chart-1)',
  height = 300,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  labelFormatter,
  valueFormatter,
  className,
}: BeamixAreaChartProps) {
  // Stable gradient id — key off dataKey so multiple instances on a page
  // each get a unique gradient and don't bleed into each other.
  const gradientId = `area-gradient-${dataKey}`

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={CHART_MARGINS.default}
        >
          {/* Gradient fill definition */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid
              vertical={DEFAULT_GRID_PROPS.vertical}
              stroke={DEFAULT_GRID_PROPS.stroke}
              strokeDasharray={DEFAULT_GRID_PROPS.strokeDasharray}
              strokeOpacity={DEFAULT_GRID_PROPS.strokeOpacity}
            />
          )}

          {showXAxis && (
            <XAxis
              dataKey={xAxisKey}
              axisLine={DEFAULT_XAXIS_PROPS.axisLine}
              tickLine={DEFAULT_XAXIS_PROPS.tickLine}
              tick={DEFAULT_XAXIS_PROPS.tick}
              tickMargin={DEFAULT_XAXIS_PROPS.tickMargin}
              dy={DEFAULT_XAXIS_PROPS.dy}
            />
          )}

          {showYAxis && (
            <YAxis
              axisLine={DEFAULT_YAXIS_PROPS.axisLine}
              tickLine={DEFAULT_YAXIS_PROPS.tickLine}
              tick={DEFAULT_YAXIS_PROPS.tick}
              tickMargin={DEFAULT_YAXIS_PROPS.tickMargin}
              width={DEFAULT_YAXIS_PROPS.width}
            />
          )}

          <ChartTooltip
            labelFormatter={labelFormatter}
            valueFormatter={valueFormatter}
            indicator="line"
          />

          <Area
            type="natural"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            fill={`url(#${gradientId})`}
            animationDuration={CHART_ANIMATION.duration}
            animationEasing={CHART_ANIMATION.easing}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
