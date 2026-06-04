'use client'

import { useEffect, useRef, useState } from 'react'
import { TIER_COLOR, type ScoreTier } from './scan-contract'

/**
 * The score ring (DESIGN-DIRECTION §4 ACT 3 + §3 motion step 5).
 *
 * The instrument needle settling — NOT a CSS chart. The arc draws via
 * stroke-dashoffset over ~900ms (cubic-bezier(0.22,1,0.36,1)) and the center
 * number counts up in EXACT lockstep (same duration, same easing) — one
 * mechanism, finishing on the same frame. Tier color only; blue never touches
 * the ring (anti-generic #5). Reduced motion → final arc + final number, no
 * animation.
 */

interface ScoreRingProps {
  score: number
  tier: ScoreTier
  /** Diameter in px. 180 desktop / 160 mobile (caller sizes). */
  size?: number
  /** Delay before the draw begins (lets the ring scale-in settle first). */
  startDelay?: number
}

const DRAW_MS = 900
const EASE = 'cubic-bezier(0.22,1,0.36,1)'

export function ScoreRing({
  score,
  tier,
  size = 180,
  startDelay = 0,
}: ScoreRingProps) {
  const color = TIER_COLOR[tier]
  const stroke = 8
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const target = Math.max(0, Math.min(score, 100)) / 100

  const reduced = usePrefersReducedMotion()
  const [drawn, setDrawn] = useState(reduced ? 1 : 0)
  const [count, setCount] = useState(reduced ? score : 0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) {
      setDrawn(1)
      setCount(score)
      return
    }
    let start: number | null = null
    const begin = window.setTimeout(() => {
      const tick = (now: number) => {
        if (start === null) start = now
        const elapsed = now - start
        const t = Math.min(elapsed / DRAW_MS, 1)
        const eased = easeOutQuint(t)
        setDrawn(eased)
        setCount(Math.round(eased * score))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, startDelay)
    return () => {
      window.clearTimeout(begin)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reduced, score, startDelay])

  const offset = circumference * (1 - target * drawn)

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`AI search visibility score: ${score} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={stroke}
        />
        {/* Arc — tier color, draws via dashoffset */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: reduced ? 'none' : `stroke-dashoffset 0ms ${EASE}`,
          }}
        />
      </svg>

      {/* Center: number (display, tier color) + /100 (mono muted) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-baseline">
          <span
            className="font-[var(--font-display)] font-medium leading-none tabular-nums tracking-[-0.03em]"
            style={{ color, fontSize: size >= 180 ? 72 : 56 }}
          >
            {count}
          </span>
          <span className="ml-1 font-[var(--font-mono)] text-[18px] text-[#6B7280]">
            /100
          </span>
        </div>
      </div>
    </div>
  )
}

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5)
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
