import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Stat — the shared numeric primitive ("mono for truth", M11).
 *
 * Every real number in the product (scores, counts, deltas, prices, seat
 * counts, relative times) renders through this so figures read TRUE: a big
 * Geist Mono tabular-nums figure that dominates, with the label and unit set
 * in receding Inter. Matches the #173 dashboard score treatment.
 *
 * M2 type contract:
 *   - size="hero"   → STEP-1, 64px mono -0.03em (one per screen)
 *   - size="lg"     → 40px mono (secondary hero / drawer figure)
 *   - size="md"     → 28px mono (in-card figure)
 *   - size="sm"     → 18px mono (inline / table cell)
 *   eyebrow label   → STEP-3, 12px Inter-600 uppercase tracking-[0.08em] #9CA3AF
 *
 * Composition is free: place the label above (`labelPosition="top"`) for an
 * eyebrow-over-figure card, or below (default) for a figure-over-caption stat.
 * Never set a number in Inter — that is the divergence M11 kills.
 */

type StatSize = 'hero' | 'lg' | 'md' | 'sm'
type LabelPosition = 'top' | 'bottom'
type Align = 'start' | 'center' | 'end'

const figureSize: Record<StatSize, string> = {
  hero: 'text-[64px] leading-none tracking-[-0.03em]',
  lg: 'text-[40px] leading-none tracking-[-0.02em]',
  md: 'text-[28px] leading-none tracking-[-0.02em]',
  sm: 'text-[18px] leading-none tracking-[-0.01em]',
}

const unitSize: Record<StatSize, string> = {
  hero: 'text-[18px]',
  lg: 'text-[14px]',
  md: 'text-[13px]',
  sm: 'text-[12px]',
}

const alignClass: Record<Align, string> = {
  start: 'items-start text-left',
  center: 'items-center text-center',
  end: 'items-end text-right',
}

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The figure. Strings allowed for pre-formatted values ("48,200", "$189"). */
  value: string | number
  /** Receding eyebrow label — STEP-3. Optional. */
  label?: string
  /** Trailing unit appended to the figure, e.g. "/100", "%", "/mo". Recedes. */
  unit?: string
  /** Figure scale. Default "md". Use "hero" sparingly — one per screen. */
  size?: StatSize
  /** Where the label sits relative to the figure. Default "bottom". */
  labelPosition?: LabelPosition
  /** Horizontal alignment of the cluster. Default "start". */
  align?: Align
  /**
   * Colour the figure (NOT the label/unit). Accepts any CSS colour — pass a
   * score-band token for data viz. Defaults to ink #0A0A0A.
   */
  valueColor?: string
  /** Optional trend/delta or sparkline slot rendered between figure and label. */
  trend?: React.ReactNode
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  (
    {
      value,
      label,
      unit,
      size = 'md',
      labelPosition = 'bottom',
      align = 'start',
      valueColor,
      trend,
      className,
      ...props
    },
    ref,
  ) => {
    const labelNode = label ? (
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {label}
      </span>
    ) : null

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1', alignClass[align], className)}
        {...props}
      >
        {labelPosition === 'top' && labelNode}

        <span
          className={cn(
            'font-[var(--font-mono)] tabular-nums',
            figureSize[size],
          )}
          style={valueColor ? { color: valueColor } : { color: '#0A0A0A' }}
          aria-label={label ? `${value}${unit ?? ''} ${label}` : undefined}
        >
          {value}
          {unit && (
            <span
              className={cn(
                'ml-0.5 align-baseline font-[var(--font-mono)] text-[#9CA3AF]',
                unitSize[size],
              )}
            >
              {unit}
            </span>
          )}
        </span>

        {trend}

        {labelPosition === 'bottom' && labelNode}
      </div>
    )
  },
)
Stat.displayName = 'Stat'

export { Stat }
