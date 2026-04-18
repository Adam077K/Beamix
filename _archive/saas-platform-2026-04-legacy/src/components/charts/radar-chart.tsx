'use client'

import * as React from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { CHART_ANIMATION } from '@/lib/chart-theme'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RadarDataPoint {
  /** Category name displayed on the polar axis */
  subject: string
  /** Value 0–100 */
  value: number
  /** Maximum value; defaults to 100 */
  fullMark?: number
}

export interface BeamixRadarChartProps {
  data: RadarDataPoint[]
  /** CSS var or hex; defaults to 'var(--chart-1)' */
  color?: string
  /** Chart height in px; defaults to 300 */
  height?: number
  valueFormatter?: (value: number) => string
  className?: string
}

// ─── BeamixRadarChart ─────────────────────────────────────────────────────────

export function BeamixRadarChart({
  data,
  color = 'var(--chart-1)',
  height = 300,
  valueFormatter,
  className,
}: BeamixRadarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
          {/* Grid lines */}
          <PolarGrid
            stroke="var(--border)"
            strokeOpacity={0.6}
          />

          {/* Axis labels */}
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontSize: 12,
              fill: 'var(--muted-foreground)',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
            }}
            tickLine={false}
          />

          <ChartTooltip
            valueFormatter={valueFormatter}
            indicator="dot"
          />

          <Radar
            dataKey="value"
            name="Score"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.1}
            animationDuration={CHART_ANIMATION.duration}
            animationEasing={CHART_ANIMATION.easing}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
