'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
 * expandedId resets on data change (though data is static in Wave 1).
 */
export function TraceabilityList({ data }: TraceabilityListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()
  const handleRetry = useCallback(() => router.refresh(), [router])

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

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
          <OutcomeCard
            key={outcome.id}
            outcome={outcome}
            expanded={expandedId === outcome.id}
            onToggle={() => handleToggle(outcome.id)}
          />
        ))}
      </div>
    </div>
  )
}
