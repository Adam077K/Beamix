'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ScoreRing } from './ScoreRing'
import {
  TIER_COLOR,
  verdictCta,
  verdictHeadline,
  verdictSubline,
  type ScanResult,
} from './scan-contract'

/**
 * ACT 3 — REVEAL (DESIGN-DIRECTION §4 ACT 3 + §3 motion steps 4–6).
 *
 * The ring scales in from scale(0.92)+opacity-0 (NEVER scale(0), emilkowal
 * transform-never-scale-zero) at the same vertical anchor the active row held.
 * Arc draws + number counts in lockstep, then verdict → engine rows → CTA
 * stagger up. Score colors are data-only; the only blue is the CTA. Blunt
 * verdict, no hedging, no exclamation. Reduced motion → everything final at
 * 200ms, message just as blunt.
 */

interface ScoreRevealProps {
  result: ScanResult
  /** Discovery-call / fix path. Defaults to the standard product routes. */
  ctaHref?: string
  secondaryHref?: string
  /** Override the tier-derived CTA label (onboarding routes into the product). */
  ctaLabelOverride?: string
  /** Secondary link label. Pass null to hide it (onboarding context). */
  secondaryLabel?: string | null
}

// Stagger schedule (ms) relative to mount, matching §3 timing.
const T_RING_IN = 40
const T_VERDICT = 1100 // verdict fades up as the count nears its end
const T_ROWS = 1300
const T_CTA = 1600

export function ScoreReveal({
  result,
  ctaHref = '/discovery?from=scan',
  secondaryHref = '/discovery?book=1&from=scan',
  ctaLabelOverride,
  secondaryLabel = 'Or book a 15-minute walkthrough',
}: ScoreRevealProps) {
  const reduced = usePrefersReducedMotion()
  const [shown, setShown] = useState({
    ring: reduced,
    verdict: reduced,
    rows: reduced,
    cta: reduced,
  })

  useEffect(() => {
    if (reduced) {
      setShown({ ring: true, verdict: true, rows: true, cta: true })
      return
    }
    const timers = [
      window.setTimeout(() => setShown((s) => ({ ...s, ring: true })), T_RING_IN),
      window.setTimeout(() => setShown((s) => ({ ...s, verdict: true })), T_VERDICT),
      window.setTimeout(() => setShown((s) => ({ ...s, rows: true })), T_ROWS),
      window.setTimeout(() => setShown((s) => ({ ...s, cta: true })), T_CTA),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [reduced])

  const headline = verdictHeadline(result.tier)
  const subline = verdictSubline(result)
  const cta = ctaLabelOverride ?? verdictCta(result.tier)
  const partial = result.enginesScanned < result.enginesTotal

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 sm:px-6">
      <div className="flex w-full max-w-[560px] flex-col items-center">
        {/* Score ring — scales in from 0.92, NEVER scale(0) */}
        <div
          className={cn(
            'transition-all duration-[350ms] ease-out motion-safe:[transition-property:transform,opacity]',
            shown.ring
              ? 'scale-100 opacity-100'
              : 'scale-[0.92] opacity-0',
          )}
        >
          <div className="block sm:hidden">
            <ScoreRing
              score={result.score}
              tier={result.tier}
              size={160}
              startDelay={reduced ? 0 : 250}
            />
          </div>
          <div className="hidden sm:block">
            <ScoreRing
              score={result.score}
              tier={result.tier}
              size={180}
              startDelay={reduced ? 0 : 250}
            />
          </div>
        </div>

        {/* Verdict */}
        <div
          className={cn(
            'mt-8 text-center transition-all duration-[400ms] ease-out motion-safe:[transition-property:transform,opacity]',
            shown.verdict ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          <h1 className="mx-auto max-w-[440px] font-[var(--font-display)] text-[24px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A] sm:text-[28px]">
            {headline}
          </h1>
          <p className="mx-auto mt-2 max-w-[440px] text-[15px] leading-[1.5] text-[#6B7280]">
            {subline}
          </p>
        </div>

        {/* Per-engine gap rows — hairline, the evidence */}
        <div
          className={cn(
            'mt-8 w-full transition-all duration-[400ms] ease-out motion-safe:[transition-property:transform,opacity]',
            shown.rows ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          {result.engines.map((engine, i) => (
            <div
              key={engine.id}
              className={cn(
                'flex items-center py-4',
                i < result.engines.length - 1 && 'border-b border-[#E5E7EB]',
              )}
            >
              <span className="text-[15px] font-medium text-[#0A0A0A]">
                {engine.label}
              </span>
              <span className="flex-1" />
              <span
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: TIER_COLOR[engine.tier] }}
                aria-hidden="true"
              />
              <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#6B7280]">
                {engine.verdict}
              </span>
            </div>
          ))}

          {partial && (
            <p className="mt-3 font-[var(--font-mono)] text-[12px] text-[#9CA3AF]">
              Scanned {result.enginesScanned} of {result.enginesTotal} engines —
              one engine didn’t respond.
            </p>
          )}
        </div>

        {/* CTA block */}
        <div
          className={cn(
            'mt-8 w-full transition-all duration-[400ms] ease-out motion-safe:[transition-property:transform,opacity]',
            shown.cta ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          <p className="mb-4 text-center text-[12px] text-[#6B7280]">
            Beamix’s agents fix these gaps — you approve, they ship.
          </p>
          <a
            href={ctaHref}
            className={cn(
              'flex h-[52px] w-full items-center justify-center rounded-lg bg-[#3370FF] text-[15px] font-semibold text-white',
              'transition-[transform,background-color,box-shadow] duration-100 ease-out',
              'hover:-translate-y-px hover:bg-[#1f5ce8] hover:shadow-[0_4px_12px_rgba(51,112,255,0.25)]',
              'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
            )}
          >
            {cta}
          </a>
          {secondaryLabel && (
            <div className="mt-6 text-center">
              <a
                href={secondaryHref}
                className="rounded-sm text-[14px] font-medium text-[#6B7280] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                {secondaryLabel}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
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
