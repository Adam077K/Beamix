import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Skeleton — a single shimmer block sized to the content it replaces.
 * Build loading states by composing these to match the real layout —
 * never a lone spinner for content-heavy surfaces (DESIGN-DIRECTION §4.4).
 *
 * Animation is opacity-based (animate-pulse), so it degrades cleanly under
 * prefers-reduced-motion (handled globally in globals.css).
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-[#F3F4F6]', className)}
    />
  )
}

interface LoadingStateProps {
  /** Accessible label announced to assistive tech while loading. */
  label?: string
  /** Number of skeleton rows to render. */
  rows?: number
  className?: string
}

/**
 * LoadingState — a sensible default skeleton: a heading line plus stacked
 * card rows. For bespoke layouts, compose <Skeleton /> directly so the
 * loading shape matches the real content.
 */
export function LoadingState({
  label = 'Loading…',
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn('space-y-4', className)}
    >
      <Skeleton className="h-7 w-48" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-[16px] border border-[#E5E7EB] bg-white p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-12 shrink-0" />
            </div>
            <Skeleton className="mt-3 h-3 w-1/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
