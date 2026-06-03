'use client'

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  /** Short, plain-language heading. 16px Inter 600. */
  title?: string
  /** One calm line explaining what happened. 14px #6B7280. */
  description?: string
  /**
   * Re-fetch callback. ALWAYS wire this — the user must never be told to
   * refresh the browser (DESIGN-DIRECTION §4.4). When omitted, the button is
   * hidden, so prefer always passing one.
   */
  onRetry?: () => void
  /** Label for the retry button. */
  retryLabel?: string
  className?: string
}

/**
 * ErrorState — the reusable error template (DESIGN-DIRECTION §4.4).
 *
 *  - Contained block, max-w-[400px], sits ~38% from the top (not floating in a
 *    vast empty card, not dead-center).
 *  - Icon: #EF4444 inside a solid bg-red-50 40px rounded-full chip.
 *  - Always renders a real "Try again" button that re-fetches via onRetry.
 *  - Respects prefers-reduced-motion (handled globally in globals.css).
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We hit a snag loading this. Try again — it usually clears right up.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex w-full flex-col items-center px-6 pb-16 pt-[20vh] text-center',
        className,
      )}
    >
      <div className="w-full max-w-[400px]">
        <div
          className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50"
          aria-hidden="true"
        >
          <AlertTriangle className="h-5 w-5 text-[#EF4444]" strokeWidth={2} />
        </div>

        <h3 className="mb-1.5 text-base font-semibold text-[#0A0A0A]">{title}</h3>

        <p className="mx-auto max-w-[360px] text-sm leading-relaxed text-[#6B7280]">
          {description}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#3370FF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1f5ce8] active:bg-[#1a52d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}
