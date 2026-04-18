import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendBadgeProps {
  value: number
  suffix?: string
  size?: "sm" | "md"
  className?: string
}

function TrendBadge({ value, suffix = "", size = "sm", className }: TrendBadgeProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isNeutral = value === 0

  const sizeClass = size === "sm" ? "text-xs" : "text-sm"

  const colorClass = isPositive
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
    : isNegative
      ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
      : "bg-muted text-muted-foreground"

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  const label = isPositive
    ? `Up ${value}${suffix}`
    : isNegative
      ? `Down ${Math.abs(value)}${suffix}`
      : `No change`

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 inline-flex items-center gap-1 font-medium transition-colors duration-150",
        sizeClass,
        colorClass,
        className
      )}
      aria-label={label}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">
        {isNeutral ? "—" : `${isPositive ? "+" : ""}${value}${suffix}`}
      </span>
    </span>
  )
}

export { TrendBadge }
export type { TrendBadgeProps }
