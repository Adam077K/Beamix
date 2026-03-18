'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ChartCardProps {
  title: string
  subtitle?: string
  /** Currently selected period label e.g. '30d' */
  period?: string
  /** Available period options e.g. ['7d', '30d', '90d'] */
  periods?: string[]
  onPeriodChange?: (period: string) => void
  /** Optional action node rendered in the header trailing area */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Extra classes applied to the chart content wrapper */
  contentClassName?: string
}

// ─── PeriodPill ───────────────────────────────────────────────────────────────

interface PeriodPillProps {
  label: string
  selected: boolean
  onClick: () => void
}

function PeriodPill({ label, selected, onClick }: PeriodPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        selected
          ? 'bg-foreground text-background'
          : 'bg-transparent text-muted-foreground hover:bg-muted'
      )}
    >
      {label}
    </button>
  )
}

// ─── ChartCard ─────────────────────────────────────────────────────────────────

export function ChartCard({
  title,
  subtitle,
  period,
  periods,
  onPeriodChange,
  action,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  const hasPeriods = periods && periods.length > 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: title + subtitle */}
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold leading-tight">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Right: period pills + optional action */}
          <div className="flex shrink-0 items-center gap-2">
            {hasPeriods && (
              <div
                className="flex items-center gap-0.5 rounded-full bg-muted/60 p-0.5"
                role="group"
                aria-label="Select time period"
              >
                {periods.map((p) => (
                  <PeriodPill
                    key={p}
                    label={p}
                    selected={period === p}
                    onClick={() => onPeriodChange?.(p)}
                  />
                ))}
              </div>
            )}
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn('px-6 pb-6 pt-0', contentClassName)}
      >
        <div className={cn('min-h-[200px]')}>{children}</div>
      </CardContent>
    </Card>
  )
}
