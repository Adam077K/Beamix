'use client'

import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { cn } from '@/lib/utils'

interface ContextStatProps {
  /** The hero figure — STEP-1 64px Geist Mono tabular-nums */
  value: string | number
  /** Label below the value — STEP-3 12px Inter-600 uppercase */
  label: string
  /** Last ~5 score points. null = flat 1px baseline, never fake. */
  sparklinePoints: number[] | null
  /** Current score for color-band selection. null = no sparkline color. */
  currentScore: number | null
  className?: string
}

/**
 * ContextStat — the single visibility signal in the Context Header right rail.
 *
 * M2 STEP-1: 64px Geist Mono -0.03em tabular figure (the one hero number/screen).
 * M4: micro-sparkline from the last ~5 runs (flat baseline when null — never fake).
 * Sits in the narrow right rail of Zone 1 (TIER-3 .card-inset).
 */
export function ContextStat({
  value,
  label,
  sparklinePoints,
  currentScore,
  className,
}: ContextStatProps) {
  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      {/* STEP-1 hero figure */}
      <span
        className="font-[var(--font-mono)] text-[64px] leading-none tabular-nums tracking-[-0.03em] text-[#0A0A0A]"
        aria-label={`${value} ${label}`}
      >
        {value}
      </span>

      {/* M4 sparkline — always rendered (flat baseline = no data, not absence) */}
      <EngineMicroSparkline
        points={sparklinePoints}
        currentScore={currentScore}
        className="mt-0.5"
      />

      {/* STEP-3 label */}
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {label}
      </span>
    </div>
  )
}
