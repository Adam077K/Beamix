import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md bg-muted skeleton-shimmer", className)}
      aria-hidden="true"
    />
  )
}

// ─── StatCardSkeleton ─────────────────────────────────────────────────────────

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <div className="flex flex-col gap-3 p-5">
        {/* Header: label + trend */}
        <div className="flex items-center justify-between">
          <Bone className="h-3 w-24" />
          <Bone className="h-5 w-14 rounded-full" />
        </div>
        {/* Value */}
        <Bone className="h-8 w-16" />
        {/* Subtitle */}
        <Bone className="h-3 w-32" />
        {/* Sparkline area */}
        <Bone className="mt-1 h-8 w-full" />
      </div>
    </Card>
  )
}

// ─── ChartSkeleton ──────────────────────────────────────────────────────────

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-6 pt-6 pb-2">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <Bone className="h-4 w-32" />
            <Bone className="h-3 w-48" />
          </div>
          <div className="flex gap-1">
            <Bone className="h-6 w-8 rounded-full" />
            <Bone className="h-6 w-8 rounded-full" />
            <Bone className="h-6 w-8 rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 pt-2">
        {/* Chart area */}
        <Bone className="h-48 w-full rounded-lg" />
      </div>
    </Card>
  )
}

// ─── TableSkeleton ──────────────────────────────────────────────────────────

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  const widths = ["w-20", "w-32", "w-16", "w-24", "w-28", "w-12"]

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 rounded-t-md bg-muted/50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Bone key={`header-${i}`} className={cn("h-3", widths[i % widths.length])} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex items-center gap-4 border-b border-border/30 px-4 py-3 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Bone
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn("h-4", widths[(colIdx + rowIdx) % widths.length])}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── ListSkeleton ───────────────────────────────────────────────────────────

export function ListSkeleton({
  items = 4,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={`list-${i}`} className="flex items-start gap-3">
          {/* Dot */}
          <Bone className="mt-1.5 h-3 w-3 shrink-0 rounded-full" />
          {/* Lines */}
          <div className="flex flex-1 flex-col gap-1.5">
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
          {/* Timestamp */}
          <Bone className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  )
}
