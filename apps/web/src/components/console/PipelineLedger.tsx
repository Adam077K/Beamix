'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { StageRow } from './StageRow'
import type { PipelineLedgerProps } from './pipeline-contract'

/**
 * PipelineLedger — the violet pipeline engine room (CONSOLE-SPINE-DIRECTION.md §A Zone 4).
 *
 * Violet adaptation of ScanningLedger — the ONLY animated set-piece per surface.
 * Blue recolored to violet throughout.
 *
 * Visual structure:
 *   - bg-[#EEEAFD] ground (--color-agent-tint)
 *   - rgba(110,86,240,0.12) hairline border
 *   - 4px violet top-accent bar (#6E56F0)
 *   - Rows fade-up 40ms stagger (M9), reduced-motion fallback
 *   - Live substep stream line underneath (cross-fade, Geist Mono)
 *
 * Completion handoff (verbatim from ScanningLedger):
 *   clearing=true → 250ms hold → lift-out animation → onCleared()
 */
export function PipelineLedger({
  stages,
  agentLabel,
  currentSubstep,
  clearing = false,
  onCleared,
}: PipelineLedgerProps) {
  // Cross-fade the streaming substep line (250ms) on each swap
  const [displaySubstep, setDisplaySubstep] = useState(currentSubstep)
  const [substepVisible, setSubstepVisible] = useState(true)
  const prevSubstep = useRef(currentSubstep)

  useEffect(() => {
    if (currentSubstep === prevSubstep.current) return
    setSubstepVisible(false)
    const t = window.setTimeout(() => {
      setDisplaySubstep(currentSubstep)
      prevSubstep.current = currentSubstep
      setSubstepVisible(true)
    }, 250)
    return () => window.clearTimeout(t)
  }, [currentSubstep])

  // Completion handoff: 250ms hold → lift-out → onCleared
  const [lifting, setLifting] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!clearing || firedRef.current) return
    firedRef.current = true
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setLifting(true)
      const t = window.setTimeout(() => onCleared?.(), 80)
      return () => window.clearTimeout(t)
    }
    // 250ms hold → begin lift-out → 520ms later hand off
    const hold = window.setTimeout(() => setLifting(true), 250)
    const handoff = window.setTimeout(() => onCleared?.(), 250 + 520)
    return () => {
      window.clearTimeout(hold)
      window.clearTimeout(handoff)
    }
  }, [clearing, onCleared])

  const isClearing = clearing && lifting

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] transition-opacity duration-200',
        clearing && 'pointer-events-none',
      )}
      style={{
        // violet-tint ground + rgba violet hairline border
        backgroundColor: '#EEEAFD',
        border: '1px solid rgba(110,86,240,0.12)',
      }}
    >
      {/* violet top-accent bar */}
      <div className="h-1 w-full bg-[#6E56F0]" aria-hidden="true" />

      <div className="px-6 py-5">
        {/* Status line — agent label */}
        <p
          className={cn(
            'font-[var(--font-mono)] text-[13px] uppercase tracking-[0.08em] text-[#6E56F0] transition-all duration-300 ease-out motion-safe:[transition-property:transform,opacity,filter]',
            isClearing && 'opacity-0 motion-safe:-translate-y-3 motion-safe:blur-[2px]',
          )}
        >
          {agentLabel} running…
        </p>

        {/* The stage rows — fade-up stagger (M9), lift-out on clear */}
        <div className="mt-4">
          {stages.map((stage, i) => (
            <div
              key={stage.id}
              className={cn(
                // M9: 40ms stagger entrance
                'craft-enter',
                `craft-enter-${Math.min(i + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`,
                'transition-all duration-[400ms] ease-out motion-safe:[transition-property:transform,opacity,filter]',
                isClearing &&
                  'opacity-0 motion-safe:-translate-y-3 motion-safe:blur-[4px]',
              )}
              style={isClearing ? { transitionDelay: `${i * 60}ms` } : undefined}
            >
              <StageRow stage={stage} isLast={i === stages.length - 1} />
            </div>
          ))}
        </div>

        {/* Live substep stream — cross-fade on each swap */}
        <div className={cn('mt-4 h-5', isClearing && 'opacity-0 transition-opacity duration-200')}>
          {displaySubstep && (
            <p
              className={cn(
                'max-w-[520px] truncate font-[var(--font-mono)] text-[13px] text-[#6E56F0]/70 transition-opacity duration-[250ms]',
                substepVisible ? 'opacity-100' : 'opacity-0',
              )}
              title={displaySubstep}
            >
              <span className="text-[#9CA3AF]">{'> '}</span>
              &ldquo;{displaySubstep}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
