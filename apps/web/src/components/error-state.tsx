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
  /** Label for the primary retry button. Name a REAL recovery action. */
  retryLabel?: string
  /**
   * M8 two-tier recovery — the quiet secondary path (a link, not a button).
   * e.g. { label: 'Check status', href: '/status' }. Optional.
   */
  secondaryAction?: { label: string; href: string }
  className?: string
}

/**
 * ErrorState — the reusable error template (M8 two-tier recovery).
 *
 *  - Left-anchored inside a framed `.card-inset` panel that sits UNDER the
 *    page header in the content column — it reads "this region failed", never
 *    "the whole app is empty". Breaks the dead-center-in-a-void tell (#5).
 *  - Icon: #EF4444 inside a critical-tinted chip.
 *  - TWO-tier recovery: a primary "Try again" button that re-fetches via
 *    onRetry + an optional quiet secondary link. The primary names a real
 *    recovery action; never "refresh the page yourself".
 *  - Respects prefers-reduced-motion (handled globally in globals.css).
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We hit a snag loading this. Try again — it usually clears right up.',
  onRetry,
  retryLabel = 'Try again',
  secondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn('w-full', className)}>
      <div className="card-inset max-w-[480px] rounded-lg p-6 sm:p-7">
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-status-critical-bg)]"
          aria-hidden="true"
        >
          <AlertTriangle
            className="h-5 w-5 text-[var(--color-status-critical)]"
            strokeWidth={2}
          />
        </div>

        <h3 className="mb-1.5 text-base font-semibold text-[#0A0A0A]">{title}</h3>

        <p className="max-w-[360px] text-sm leading-relaxed text-[#6B7280]">
          {description}
        </p>

        {(onRetry || secondaryAction) && (
          <div className="mt-5 flex items-center gap-4">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#3370FF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1f5ce8] active:bg-[#1a52d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                {retryLabel}
              </button>
            )}

            {secondaryAction && (
              <a
                href={secondaryAction.href}
                className="text-sm font-medium text-[#6B7280] underline-offset-4 transition-colors hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
              >
                {secondaryAction.label}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
