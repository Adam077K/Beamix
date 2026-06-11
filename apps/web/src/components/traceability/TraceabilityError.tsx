'use client'

import Link from 'next/link'

interface TraceabilityErrorProps {
  errorMessage?: string
  onRetry?: () => void
}

const retryClassName =
  'mt-4 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2'

/**
 * TraceabilityError — error state for the traceability list.
 *
 * Matches AgentActivityPanel's error markup: centered text in a .card-console,
 * blue "Try again" affordance. When onRetry is provided (client-side context),
 * calls it directly; otherwise falls back to a Link reload.
 */
export function TraceabilityError({ errorMessage, onRetry }: TraceabilityErrorProps) {
  return (
    <div className="card-console flex flex-col items-center justify-center px-5 py-8 text-center">
      <p className="text-sm font-medium text-[#0A0A0A]">Couldn&apos;t load your results</p>
      <p className="mt-1 max-w-[340px] text-[13px] leading-relaxed text-[#6B7280]">
        {errorMessage ?? 'We lost the connection for a moment.'}
      </p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={retryClassName}>
          Try again
        </button>
      ) : (
        <Link href="/traceability" className={retryClassName}>
          Try again
        </Link>
      )}
    </div>
  )
}
