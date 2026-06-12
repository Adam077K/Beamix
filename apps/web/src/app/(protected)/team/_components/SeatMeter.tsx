'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SeatMeterProps {
  used: number
  total: number
  /** Show the quiet "Add seats" link when within one seat of the cap. */
  onAddSeats?: () => void
}

/**
 * SeatMeter — the ONE signature detail of /team.
 *
 * A pill-bar of `total` circle segments: `used` filled blue (#3370FF), the rest
 * empty (#E5E7EB), filling left-to-right. ~24px tall, ~120px wide.
 *
 * Motion contract (the only animated moment on /team):
 *   - First mount ONLY: filled segments scale in 0 → 1 over 300ms, transform-only
 *     ease-out, staggered left-to-right. Never re-runs.
 *   - prefers-reduced-motion: render filled immediately, no animation.
 *
 * Every number is Geist Mono, tabular-nums.
 */
export function SeatMeter({ used, total, onAddSeats }: SeatMeterProps) {
  // Animate only on the very first mount. Start "unfilled" then flip to filled
  // one tick later so the CSS transform transition runs once.
  const [filled, setFilled] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setFilled(true)
      return
    }

    // Next frame: trigger the transform transition from scale-0 → scale-100.
    const id = requestAnimationFrame(() => setFilled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const segments = Math.max(total, 0)
  const nearCap = total - used <= 1

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
        Seats
      </span>

      <span className="font-mono text-[13px] tabular-nums text-[var(--color-text-secondary)]">
        {used} of {total}
      </span>

      {/* The pill-bar — N circle segments, filled left-to-right */}
      <div
        className="flex h-6 items-center gap-1.5"
        role="img"
        aria-label={`${used} of ${total} seats used`}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < used
          return (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                'h-6 w-6 rounded-full transition-transform duration-300 ease-out',
                isFilled ? 'bg-[#3370FF]' : 'bg-[#E5E7EB]',
              )}
              style={{
                // Filled segments scale-in once on first mount, staggered L→R.
                // Empty segments are static.
                transform: isFilled && !filled ? 'scale(0)' : 'scale(1)',
                transitionDelay: isFilled ? `${i * 50}ms` : '0ms',
              }}
            />
          )
        })}
      </div>

      {nearCap && onAddSeats && (
        <button
          type="button"
          onClick={onAddSeats}
          className="text-[13px] font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-sm"
        >
          Add seats
        </button>
      )}
    </div>
  )
}
