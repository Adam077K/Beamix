'use client'

import { useEffect, useRef, useState } from 'react'
import { BAND_COLOR, scoreBand } from './scan-mock'

interface ScoreRingProps {
  /** Final 0–100 score. */
  score: number
  /** Diameter in px. */
  size?: number
  /** Stroke width in px. */
  stroke?: number
}

/**
 * ScoreRing — Act C reveal. A ~160px ring whose stroke sweeps in over ~1200ms
 * (cubic-bezier 0.22,1,0.36,1) while the number counts up in sync. The ring
 * color is the score band (cyan/green/amber/red) — data-viz only, never blue.
 *
 * Reduced motion: renders the final state instantly (no sweep, no count-up).
 */
export function ScoreRing({ score, size = 160, stroke = 10 }: ScoreRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const color = BAND_COLOR[scoreBand(score)]

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const [display, setDisplay] = useState(prefersReduced ? score : 0)
  const [drawn, setDrawn] = useState(prefersReduced)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(score)
      setDrawn(true)
      return
    }

    // Trigger the stroke sweep on next frame (CSS transition handles easing).
    const raf = requestAnimationFrame(() => setDrawn(true))

    // Count the number up in sync with the ~1200ms sweep.
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // Match the ring easing for a synced count.
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * score))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(score)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [score, prefersReduced])

  const offset = drawn ? circumference * (1 - score / 100) : circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Visibility score ${score} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EEF0F4"
          strokeWidth={stroke}
        />
        {/* Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: prefersReduced
              ? 'none'
              : 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-[44px] font-semibold leading-none tabular-nums text-[#0A0A0A]"
          aria-hidden="true"
        >
          {display}
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
          / 100
        </span>
      </div>
    </div>
  )
}
