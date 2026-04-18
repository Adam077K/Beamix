'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { CHART_COLOR_LIST } from '@/lib/chart-theme'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BarItem {
  label: string
  value: number
  /** Optional Tailwind bg class or inline color. Falls back to CHART_COLOR_LIST. */
  color?: string
}

export interface BeamixBarChartProps {
  data: BarItem[]
  /** Fixed height in px per bar; defaults to 40px * bar count */
  height?: number
  /** Max value for scale; defaults to max(values) or 100 if values are small */
  maxValue?: number
  /** Show numeric value on the right of each bar; defaults to true */
  showValues?: boolean
  className?: string
}

// ─── Bar row ──────────────────────────────────────────────────────────────────

interface BarRowProps {
  label: string
  value: number
  maxValue: number
  color: string
  showValue: boolean
  /** Delay in ms for staggered mount animation */
  delay: number
}

function BarRow({ label, value, maxValue, color, showValue, delay }: BarRowProps) {
  const [width, setWidth] = React.useState(0)
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0

  // Trigger animation after mount
  React.useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), delay)
    return () => clearTimeout(timer)
  }, [pct, delay])

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span
        className="w-28 shrink-0 truncate text-right text-sm text-muted-foreground"
        title={label}
      >
        {label}
      </span>

      {/* Track */}
      <div className="relative flex-1 overflow-hidden rounded-r-md bg-muted/50 h-7">
        <div
          className={cn('h-full rounded-r-md', color)}
          style={{
            width: `${width}%`,
            transition: 'width 700ms ease-out',
          }}
          role="presentation"
        />
      </div>

      {/* Value */}
      {showValue && (
        <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
          {value}
        </span>
      )}
    </div>
  )
}

// ─── BeamixBarChart ───────────────────────────────────────────────────────────

export function BeamixBarChart({
  data,
  height,
  maxValue,
  showValues = true,
  className,
}: BeamixBarChartProps) {
  // Sort descending by value
  const sorted = React.useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data]
  )

  const max = React.useMemo(() => {
    if (maxValue !== undefined) return maxValue
    const maxVal = Math.max(...sorted.map((d) => d.value))
    return Math.max(maxVal, 100)
  }, [maxValue, sorted])

  // Default height: 40px per bar + 8px gap between
  const containerHeight = height ?? sorted.length * 48

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      style={{ minHeight: containerHeight }}
      role="list"
      aria-label="Bar chart"
    >
      {sorted.map((item, i) => {
        // Resolve color — accept Tailwind bg-* classes or fall back to chart palette
        const colorClass = item.color
          ? item.color.startsWith('bg-')
            ? item.color
            : item.color  // inline color passed as class string
          : 'bg-[var(--chart-1)]'

        // If the user passed a CSS var / hex value (not a class), wrap it
        const resolvedColor = item.color && !item.color.startsWith('bg-')
          ? item.color  // trust caller to pass a valid class string
          : (CHART_COLOR_LIST[i % CHART_COLOR_LIST.length] !== undefined && !item.color)
            ? `bg-[${CHART_COLOR_LIST[i % CHART_COLOR_LIST.length]}]`
            : colorClass

        return (
          <div key={`${item.label}-${i}`} role="listitem">
            <BarRow
              label={item.label}
              value={item.value}
              maxValue={max}
              color={resolvedColor}
              showValue={showValues}
              delay={i * 80}
            />
          </div>
        )
      })}
    </div>
  )
}
