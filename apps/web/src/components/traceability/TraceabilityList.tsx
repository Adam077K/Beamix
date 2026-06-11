'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { TraceabilityData } from '@/types/traceability'
import { TraceabilityEmpty } from './TraceabilityEmpty'
import { TraceabilityLoading } from './TraceabilityLoading'
import { TraceabilityError } from './TraceabilityError'
import { OutcomeCard } from './OutcomeCard'

interface TraceabilityListProps {
  data: TraceabilityData
}

/**
 * TraceabilityList — top-level state switch for the traceability surface.
 *
 * State machine: loading -> empty | error | ready (list).
 * Single-expand: at most one OutcomeCard is open at a time.
 * Each outcome row also links to /traceability/[outcome.id] for the
 * full drill-down detail view.
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
  return (
    <div>
      {/* List count — mono, muted, consistent with WeeklyNarrative pattern */}
      <p className="mb-3 font-mono text-[12px] tabular-nums text-[#6B7280]">
        {data.outcomes.length} result{data.outcomes.length !== 1 ? 's' : ''} traced
      </p>

      <div className="space-y-3">
        {data.outcomes.map((outcome) => (
          <div key={outcome.id} className="group relative">
            <OutcomeCard
              outcome={outcome}
              expanded={false}
              onToggle={() => {
                // No-op: the semantic overlay <Link> below owns navigation.
                // Keeping the prop to satisfy OutcomeCard's interface without
                // introducing a duplicate router.push.
              }}
            />
            {/* Semantic overlay Link — sole navigation owner for this row.
                tabIndex={-1} keeps it out of the tab order; the row's inner
                button (OutcomeCard header) handles keyboard focus naturally. */}
            <Link
              href={`/traceability/${outcome.id}`}
              aria-label={`View full work trail for: ${outcome.statement}`}
              className="absolute inset-0 rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-inset"
              tabIndex={-1}
            >
              <span className="sr-only">View detail</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Quiet hint linking to detail pages */}
      <p className="mt-4 text-[12px] text-[#9CA3AF]">
        Select a result to see the full work trail.{' '}
        <Link
          href={`/traceability/${data.outcomes[0].id}`}
          className="text-accent hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 focus-visible:rounded"
        >
          View latest
          <ChevronRight className="inline h-3 w-3 -mt-0.5" aria-hidden="true" />
        </Link>
      </p>
    </div>
  )
}
