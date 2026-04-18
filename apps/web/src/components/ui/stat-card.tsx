import * as React from "react"
import { Card } from "@/components/ui/card"
import { TrendBadge } from "@/components/ui/trend-badge"
import { cn } from "@/lib/utils"

// ─── Sparkline ───────────────────────────────────────────────────────────────

interface SparklineProps {
  data: number[]
  color?: string
  className?: string
}

function Sparkline({ data, color = "var(--color-score-good)", className }: SparklineProps) {
  if (data.length < 2) return null

  const height = 32
  const width = 100 // percentage — will scale via viewBox

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1 // avoid division by zero when all values equal

  // Build polyline points: evenly spaced x, inverted y (SVG y grows downward)
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height * 0.85) - height * 0.075
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const polylineStr = points.join(" ")

  // Build area fill path: polyline points + close down to bottom corners
  const firstPoint = points[0].split(",")
  const lastPoint = points[points.length - 1].split(",")
  const areaPath = `M ${polylineStr.replace(/,/g, " ").replace(/ (\d)/g, " $1")} L ${lastPoint[0]} ${height} L ${firstPoint[0]} ${height} Z`

  // Unique gradient ID per color to avoid conflicts when multiple sparklines rendered
  const gradientId = `sparkline-grad-${color.replace(/[^a-z0-9]/gi, "")}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full overflow-visible", className)}
      style={{ height }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Area fill below the line */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
      />

      {/* Line */}
      <polyline
        points={polylineStr}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── StatCard ────────────────────────────────────────────────────────────────

interface StatCardTrend {
  value: number
  suffix?: string
}

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: StatCardTrend
  sparklineData?: number[]
  sparklineColor?: string
  icon?: React.ReactNode
  scoreColor?: string
  interactive?: boolean
  className?: string
}

function StatCard({
  label,
  value,
  subtitle,
  trend,
  sparklineData,
  sparklineColor,
  icon,
  scoreColor,
  interactive,
  className,
}: StatCardProps) {
  const hasSparkline = sparklineData && sparklineData.length >= 2

  return (
    <Card
      className={cn(
        "gap-0 py-0",
        interactive && "hover-lift active-press cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col gap-3 p-5">
        {/* Header row: icon + label + trend */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <span
                className="shrink-0 text-muted-foreground [&>svg]:w-4 [&>svg]:h-4"
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            <span className="section-eyebrow truncate">{label}</span>
          </div>

          {trend !== undefined && (
            <TrendBadge
              value={trend.value}
              suffix={trend.suffix}
              size="sm"
              className="shrink-0"
            />
          )}
        </div>

        {/* Value + subtitle */}
        <div className="flex flex-col gap-0.5">
          <span
            className="metric-value text-3xl"
            style={scoreColor ? { color: scoreColor } : undefined}
          >
            {value}
          </span>

          {subtitle && (
            <span className="text-sm text-muted-foreground leading-snug">
              {subtitle}
            </span>
          )}
        </div>

        {/* Sparkline */}
        {hasSparkline && (
          <div className="mt-1 -mx-0.5">
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

export { StatCard, Sparkline }
export type { StatCardProps, StatCardTrend, SparklineProps }
