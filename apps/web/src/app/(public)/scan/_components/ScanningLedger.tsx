'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { EngineRow } from './EngineRow'
import type { EngineState } from './scan-contract'

/**
 * ACT 2 — SCANNING MOMENT (DESIGN-DIRECTION §4 ACT 2 + §3 hand-off).
 *
 * The differentiation anchor: honest engine-by-engine ledger with live mono
 * query counts and the REAL prompts streaming underneath. White bench, blue in
 * exactly three places (needle / active ring / done check), NO score colors yet.
 *
 * `clearing` drives the §3 hand-off: when true, the rows + needle + stream fade
 * and lift (60ms stagger, blur-bridge), clearing space for the score ring to
 * scale in at the same vertical anchor. Reusable verbatim by the post-payment
 * onboarding act.
 */

interface ScanningLedgerProps {
  domain: string
  engines: EngineState[]
  progress: number
  currentQuery: string | null
  /** True during the §3 settle — rows lift out to reveal the ring. */
  clearing?: boolean
  /** Called when the clear animation completes (so the parent swaps to reveal). */
  onCleared?: () => void
}

export function ScanningLedger({
  domain,
  engines,
  progress,
  currentQuery,
  clearing = false,
  onCleared,
}: ScanningLedgerProps) {
  // Cross-fade the streaming query (250ms) on each swap (§4 "live query stream").
  const [displayQuery, setDisplayQuery] = useState(currentQuery)
  const [queryVisible, setQueryVisible] = useState(true)
  const prevQuery = useRef(currentQuery)

  useEffect(() => {
    if (currentQuery === prevQuery.current) return
    setQueryVisible(false)
    const t = window.setTimeout(() => {
      setDisplayQuery(currentQuery)
      prevQuery.current = currentQuery
      setQueryVisible(true)
    }, 250)
    return () => window.clearTimeout(t)
  }, [currentQuery])

  // Fire onCleared after the lift-out animation (matches §3 timing ~520ms).
  const firedRef = useRef(false)
  useEffect(() => {
    if (!clearing || firedRef.current) return
    firedRef.current = true
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => onCleared?.(), reduced ? 80 : 520)
    return () => window.clearTimeout(t)
  }, [clearing, onCleared])

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 sm:px-6">
      <div
        className={cn(
          'w-full max-w-[560px] transition-opacity duration-200',
          clearing && 'pointer-events-none',
        )}
      >
        {/* Status line */}
        <p
          className={cn(
            'font-[var(--font-mono)] text-[13px] uppercase tracking-[0.08em] text-[#6B7280] transition-all duration-300 ease-out motion-safe:[transition-property:transform,opacity,filter]',
            clearing && 'opacity-0 motion-safe:-translate-y-3 motion-safe:blur-[2px]',
          )}
        >
          Scanning {domain}
        </p>

        {/* Progress needle — scaleX from left origin (perf), 3px */}
        <div
          className={cn(
            'mt-2 h-[3px] w-full overflow-hidden rounded-full bg-[#E5E7EB] transition-opacity duration-300',
            clearing && 'opacity-0',
          )}
        >
          <div
            className="h-full rounded-full bg-[#3370FF] origin-left transition-transform duration-[400ms] ease-out"
            style={{
              transform: `scaleX(${clearing ? 1 : Math.min(progress, 1)})`,
              willChange: 'transform',
            }}
          />
        </div>

        {/* The ledger — rows lift out top-to-bottom on clear (60ms stagger) */}
        <div className="mt-8">
          {engines.map((engine, i) => (
            <div
              key={engine.id}
              className={cn(
                'transition-all duration-[400ms] ease-out motion-safe:[transition-property:transform,opacity,filter]',
                clearing &&
                  'opacity-0 motion-safe:-translate-y-3 motion-safe:blur-[4px]',
              )}
              style={clearing ? { transitionDelay: `${i * 60}ms` } : undefined}
            >
              <EngineRow engine={engine} isLast={i === engines.length - 1} />
            </div>
          ))}
        </div>

        {/* Live query stream — REAL per-vertical prompts, cross-fade swap */}
        <div className={cn('mt-6 h-5', clearing && 'opacity-0 transition-opacity duration-200')}>
          {displayQuery && (
            <p
              className={cn(
                'max-w-[440px] truncate font-[var(--font-mono)] text-[13px] text-[#6B7280] transition-opacity duration-[250ms]',
                queryVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <span className="text-[#9CA3AF]">{'> '}</span>
              &ldquo;{displayQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Reassurance */}
        <p
          className={cn(
            'mt-8 text-[13px] text-[#9CA3AF] transition-opacity duration-200',
            clearing && 'opacity-0',
          )}
        >
          Checking how AI answers questions about you. About 15 seconds.
        </p>
      </div>
    </div>
  )
}
