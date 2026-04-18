'use client'

import * as React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { CHART_COLOR_LIST, CHART_ANIMATION } from '@/lib/chart-theme'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DonutSegment {
  label: string
  value: number
  /** CSS var or hex; falls back to CHART_COLOR_LIST[index] */
  color?: string
}

export interface BeamixDonutChartProps {
  data: DonutSegment[]
  /** Large text in the center hole, e.g. '72%' */
  centerLabel?: string
  /** Small text below the center label */
  centerSubLabel?: string
  /** Chart height in px; defaults to 200 */
  height?: number
  valueFormatter?: (value: number) => string
  className?: string
}

// ─── BeamixDonutChart ─────────────────────────────────────────────────────────

export function BeamixDonutChart({
  data,
  centerLabel,
  centerSubLabel,
  height = 200,
  valueFormatter,
  className,
}: BeamixDonutChartProps) {
  const hasCenterContent = centerLabel || centerSubLabel

  return (
    <div
      className={cn('relative w-full', className)}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
            valueFormatter={valueFormatter}
            indicator="dot"
          />

          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
            animationDuration={CHART_ANIMATION.duration}
            animationEasing={CHART_ANIMATION.easing}
            strokeWidth={0}
          >
            {data.map((segment, index) => (
              <Cell
                key={`cell-${segment.label}-${index}`}
                fill={segment.color ?? CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center overlay — absolutely positioned on top of the SVG */}
      {hasCenterContent && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          {centerLabel && (
            <span className="text-xl font-bold tabular-nums leading-none text-foreground">
              {centerLabel}
            </span>
          )}
          {centerSubLabel && (
            <span className="mt-0.5 text-xs text-muted-foreground">
              {centerSubLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
