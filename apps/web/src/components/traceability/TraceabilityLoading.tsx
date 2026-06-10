'use client'

/**
 * TraceabilityLoading — skeleton state for the traceability list.
 *
 * Mirrors AgentActivityPanel's skeleton rhythm: animate-pulse bars on
 * bg-[#F3F4F6], aria-busy on the container. Three card rows to convey
 * the expected list structure without exposing content shape.
 */
export function TraceabilityLoading() {
  return (
    <div aria-busy="true" aria-label="Loading results" className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-console overflow-hidden px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Statement bar — 60% width */}
            <div className="min-w-0 flex-1">
              <div className="h-[15px] w-[60%] animate-pulse rounded bg-[#F3F4F6]" />
            </div>
            {/* Delta pill bar */}
            <div className="h-[22px] w-[52px] shrink-0 animate-pulse rounded-full bg-[#F3F4F6]" />
            {/* Date bar */}
            <div className="h-[14px] w-[48px] shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
            {/* Chevron placeholder */}
            <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  )
}
