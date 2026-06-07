'use client'

/**
 * ScanScoreHero — the acquisition dopamine moment.
 *
 * Warm-minimal card with score ring + animated count-up. On first mount only:
 * ring sweeps from 0 + numeral counts from 0→score (~900ms ease-out). Guard with
 * prefers-reduced-motion (reduced = final value instantly, no sweep).
 *
 * Ring color by score band:
 *   ≥75 → --color-data-3 (cyan)
 *   ≥50 → --color-data-4 (green)
 *   ≥25 → --color-data-5 (amber)
 *   <25  → --color-data-6 (red)
 *
 * One Fraunces beat: the verdict word in the headline.
 * Score colors are data-only; blue never touches the ring.
 * NO agent names anywhere per Engineering Principle #9.
 */

import { useEffect, useRef, useState } from 'react'

interface ScanScoreHeroProps {
  score: number
  businessName: string
}

const RING_SIZE = 200
const STROKE = 14
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS
const DRAW_MS = 900

function ringColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)'
  if (score >= 50) return 'var(--color-data-4)'
  if (score >= 25) return 'var(--color-data-5)'
  return 'var(--color-data-6)'
}

function verdictWord(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Needs work'
}

function verdictHeadline(score: number, businessName: string): string {
  if (score >= 75)
    return `${businessName} shows up across AI search — defend the lead.`
  if (score >= 50)
    return `${businessName} appears sometimes — not consistently enough.`
  if (score >= 25)
    return `AI search barely sees ${businessName}. Here's why.`
  return `${businessName} is nearly invisible to AI search.`
}

function verdictSubtitle(score: number): string {
  if (score >= 75)
    return "You're in the results. We'll make sure you stay there."
  if (score >= 50)
    return "You show up, but competitors are outranking you more often than not."
  if (score >= 25)
    return "People ask AI for businesses like yours — and it doesn't mention you."
  return "When potential customers ask ChatGPT, Gemini, or Perplexity for help, your name doesn't come up."
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

export function ScanScoreHero({ score, businessName }: ScanScoreHeroProps) {
  const reduced = usePrefersReducedMotion()
  const [drawn, setDrawn] = useState(reduced ? score / 100 : 0)
  const [count, setCount] = useState(reduced ? score : 0)
  const rafRef = useRef<number | null>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    if (reduced) {
      setDrawn(score / 100)
      setCount(score)
      return
    }

    let start: number | null = null
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

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reduced, score])

  const color = ringColor(score)
  const offset = CIRC - drawn * (score / 100) * CIRC
  const word = verdictWord(score)

  return (
    <section
      aria-labelledby="scan-score-heading"
      className="card-console-hero"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-8 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
        {/* Score ring */}
        <div
          className="relative shrink-0"
          style={{ width: RING_SIZE, height: RING_SIZE }}
          role="img"
          aria-label={`AI search visibility score: ${score} out of 100`}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--color-data-grid)"
              strokeWidth={STROKE}
            />
            {/* Arc — sweeps from 0 on mount */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono text-[64px] font-medium leading-none tracking-[-0.03em] tabular-nums"
              style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
            >
              {count}
            </span>
            <span className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-disabled)]">
              / 100
            </span>
          </div>
        </div>

        {/* Verdict copy */}
        <div className="flex w-full min-w-0 flex-col items-center text-center sm:items-start sm:text-left">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
            AI search visibility
          </p>
          <h1
            id="scan-score-heading"
            className="font-[var(--font-display)] text-[26px] font-semibold leading-tight tracking-[-0.01em] text-[var(--color-text-primary)]"
          >
            {/* Fraunces beat — the verdict word only */}
            <em
              className="not-italic font-[var(--font-serif)]"
              style={{ color }}
            >
              {word}
            </em>
            {' '}—{' '}
            {verdictHeadline(score, businessName)}
          </h1>
          <p className="mt-2 max-w-[420px] text-[15px] leading-[1.5] text-[var(--color-text-muted)]">
            {verdictSubtitle(score)}
          </p>
        </div>
      </div>
    </section>
  )
}
