'use client'

import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GroundingStep } from '@/lib/demo/surfaces/types'

/**
 * GroundingLedger — the signature "thinking" moment of Ask Beamix.
 *
 * A THIN wrapper that mirrors the shared violet PipelineLedger grammar
 * (components/console/PipelineLedger + StageRow) — violet-tint ground, violet
 * hairline, 1px violet top-accent, breathing active row — WITHOUT editing the
 * shared file (it is contract-bound to the agent pipeline runner, not the Ask
 * fixture). The grounding steps stream to "done" one by one, naming the exact
 * scans + prompts being read, then the whole card morphs (opacity 1→0,
 * scale 1→0.98, ~300ms ease-out) into the cited AnswerCard mounted below.
 *
 * Reduced-motion: rows render done instantly and the morph is an instant swap.
 *
 * This is the ONE place agent-at-work motion lives on this surface, and it is
 * the same grammar as /builder's dry-run ledger — so the two read as one
 * product. Violet appears here only; the Send CTA stays blue.
 */

interface GroundingLedgerProps {
  steps: GroundingStep[]
  /** Fired once the ledger has finished + completed its morph-out. */
  onComplete: () => void
}

const STEP_INTERVAL_MS = 520
const HOLD_AFTER_DONE_MS = 360
const MORPH_MS = 300

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function GroundingLedger({ steps, onComplete }: GroundingLedgerProps) {
  const reduced = useRef(prefersReducedMotion())
  // activeIndex: which row is currently "reading". Rows before it are done.
  const [activeIndex, setActiveIndex] = useState(reduced.current ? steps.length : 0)
  const [morphing, setMorphing] = useState(false)
  const firedRef = useRef(false)

  // Reduced motion: everything done immediately, then hand off.
  useEffect(() => {
    if (!reduced.current) return
    const t = window.setTimeout(() => onComplete(), 80)
    return () => window.clearTimeout(t)
  }, [onComplete])

  // Full motion: advance the active row on an interval.
  useEffect(() => {
    if (reduced.current) return
    if (activeIndex >= steps.length) return
    const t = window.setTimeout(() => {
      setActiveIndex((i) => i + 1)
    }, STEP_INTERVAL_MS)
    return () => window.clearTimeout(t)
  }, [activeIndex, steps.length])

  // Full motion: once all rows are done, hold then morph out.
  useEffect(() => {
    if (reduced.current) return
    if (activeIndex < steps.length || firedRef.current) return
    firedRef.current = true
    const hold = window.setTimeout(() => setMorphing(true), HOLD_AFTER_DONE_MS)
    const handoff = window.setTimeout(
      () => onComplete(),
      HOLD_AFTER_DONE_MS + MORPH_MS,
    )
    return () => {
      window.clearTimeout(hold)
      window.clearTimeout(handoff)
    }
  }, [activeIndex, steps.length, onComplete])

  return (
    <div
      aria-live="polite"
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] transition-[opacity,transform] duration-300 ease-out will-change-transform motion-reduce:transition-none',
        morphing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100',
      )}
      style={{
        backgroundColor: '#EEEAFD',
        border: '1px solid rgba(110,86,240,0.12)',
      }}
    >
      {/* violet top-accent bar */}
      <div className="h-[3px] w-full bg-[#6E56F0]" aria-hidden="true" />

      <div className="px-6 py-5">
        <p className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.08em] text-[#6E56F0]">
          Reading your data…
        </p>

        <div className="mt-3">
          {steps.map((step, i) => {
            const isDone = i < activeIndex
            const isActive = i === activeIndex
            const isQueued = i > activeIndex
            const isLast = i === steps.length - 1
            return (
              <div
                key={step.label}
                className={cn(
                  'flex items-center gap-3 py-3.5',
                  !isLast && 'border-b border-[rgba(110,86,240,0.12)]',
                )}
              >
                {/* State glyph */}
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                  {isDone && (
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#6E56F0]">
                      <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                  {isActive && (
                    <span
                      className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-[#6E56F0]/20 border-t-[#6E56F0] motion-safe:animate-[scan-spin_0.7s_linear_infinite]"
                      style={{ willChange: 'transform' }}
                      aria-hidden="true"
                    />
                  )}
                  {isQueued && (
                    <span className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-[#E5E7EB]" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'text-[14px] font-medium',
                    isQueued ? 'text-[#9CA3AF]' : 'text-[#0A0A0A]',
                  )}
                >
                  {step.label}
                </span>

                <span className="flex-1" />

                {/* Detail figure — mono, the truth of what was read */}
                <span
                  className={cn(
                    'hidden max-w-[260px] truncate font-[var(--font-mono)] text-[12px] tabular-nums tracking-[0.01em] sm:block',
                    isActive
                      ? 'text-[#6E56F0]'
                      : isDone
                        ? 'text-[#6B7280]'
                        : 'text-[#C4C4CC]',
                  )}
                  title={step.detail}
                >
                  {step.detail}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
