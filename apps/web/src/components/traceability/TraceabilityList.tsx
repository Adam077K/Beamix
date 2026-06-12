'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { TraceabilityData } from '@/types/traceability'
import { TraceabilityEmpty } from './TraceabilityEmpty'
import { TraceabilityLoading } from './TraceabilityLoading'
import { TraceabilityError } from './TraceabilityError'
import { OutcomeHero } from './OutcomeHero'
import { OutcomeLedgerRow } from './OutcomeLedgerRow'
import { TrailSummary } from './TrailSummary'

interface TraceabilityListProps {
  data: TraceabilityData
}

/**
 * TraceabilityList — top-level state switch + the redesigned "forensic receipt".
 *
 * State machine: loading → empty | error | ready.
 *
 * The ready layout (M1/M3/M10) is a real composition, not a flat stack:
 *  1. TIER-1 OutcomeHero — the latest/highest-impact outcome, 64px proof figure,
 *     one Fraunces engine beat, asymmetric band. Exactly one TIER-1 focal.
 *  2. A dense TIER-3 ledger of the remaining outcomes — dated, metric-clustered
 *     rows that read like a receipt body and fill the frame.
 *  3. TIER-3 TrailSummary — mono <Stat> totals so the lower canvas earns its
 *     space instead of floating empty.
 *
 * Each row (hero + ledger) routes to /traceability/[id] for the full work trail.
 */
export function TraceabilityList({ data }: TraceabilityListProps) {
  const router = useRouter()
  const handleRetry = useCallback(() => router.refresh(), [router])

  if (data.state === 'loading') {
    return <TraceabilityLoading />
  }

  if (data.state === 'error') {
    return <TraceabilityError errorMessage={data.errorMessage} onRetry={handleRetry} />
  }

  if (data.state === 'empty' || data.outcomes.length === 0) {
    return <TraceabilityEmpty />
  }

  // state === 'ready', outcomes.length > 0
  const [hero, ...rest] = data.outcomes
  const stagger = ['craft-enter-2', 'craft-enter-3', 'craft-enter-4', 'craft-enter-4']

  return (
    <div className="space-y-6">
      {/* 1 ── TIER-1 hero focal */}
      <OutcomeHero outcome={hero} />

      {/* 2 ── Dense TIER-3 ledger of the remaining outcomes */}
      {rest.length > 0 && (
        <section aria-label="Earlier results">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]">
              Earlier results
            </p>
            <p className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">
              {data.outcomes.length} traced
            </p>
          </div>

          <div className="card-console divide-y divide-[#F0F1F3] overflow-hidden">
            {rest.map((outcome, idx) => (
              <OutcomeLedgerRow
                key={outcome.id}
                outcome={outcome}
                enterClass={stagger[Math.min(idx, stagger.length - 1)]}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3 ── TIER-3 trail-at-a-glance, fills the lower canvas */}
      <TrailSummary outcomes={data.outcomes} />
    </div>
  )
}
