'use client'

import { cn } from '@/lib/utils'
import type { EngineVisibilityDelta } from '@/types/digest'

interface DeltaTrioBadgeProps {
  deltas: EngineVisibilityDelta[]
  /** Compact mode: collapse to single net delta (used on narrow viewports) */
  compact?: boolean
}

/**
 * DeltaTrioBadge — three compact engine chips with Geist Mono tabular-nums.
 *
 * Color law: positive = status-positive (green), flat = status-neutral (gray),
 * dip = status-warning (amber). Customer movement only — never violet.
 *
 * On narrow: collapse to single net delta sum badge.
 */
export function DeltaTrioBadge({ deltas, compact = false }: DeltaTrioBadgeProps) {
  if (compact) {
    const net = deltas.reduce((sum, d) => sum + d.delta, 0)
    const variant = net > 0 ? 'positive' : net < 0 ? 'warning' : 'neutral'
    return <DeltaBadge value={net} variant={variant} showSign />
  }

  return (
    <div className="flex items-center gap-1" role="list" aria-label="Engine score deltas">
      {deltas.map((d) => {
        const variant = d.delta > 0 ? 'positive' : d.delta < 0 ? 'warning' : 'neutral'
        const label = `${engineLabel(d.engine)}: ${d.thisWeek} this week, ${d.delta > 0 ? '+' : ''}${d.delta} change`
        return (
          <div key={d.engine} role="listitem" aria-label={label}>
            <DeltaBadge
              value={d.thisWeek}
              prevValue={d.lastWeek}
              variant={variant}
              engine={d.engine}
            />
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Internal badge
// ---------------------------------------------------------------------------

interface DeltaBadgeProps {
  value: number
  prevValue?: number
  variant: 'positive' | 'warning' | 'neutral'
  engine?: string
  showSign?: boolean
}

function DeltaBadge({ value, prevValue, variant, showSign }: DeltaBadgeProps) {
  const bgClass = {
    positive: 'bg-status-positive',
    warning: 'bg-status-warning',
    neutral: 'bg-status-neutral',
  }[variant]

  const textClass = {
    positive: 'text-status-positive',
    warning: 'text-status-warning',
    neutral: 'text-status-neutral',
  }[variant]

  const sign = showSign ? (value > 0 ? '+' : '') : ''

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[12px] tabular-nums',
        bgClass,
        textClass,
      )}
    >
      {sign}
      {value}
      {prevValue !== undefined && (
        <span className="ml-0.5 opacity-70">→{prevValue}</span>
      )}
    </span>
  )
}

function engineLabel(engine: string): string {
  const map: Record<string, string> = {
    chatgpt: 'ChatGPT',
    gemini: 'Gemini',
    perplexity: 'Perplexity',
  }
  return map[engine] ?? engine
}
