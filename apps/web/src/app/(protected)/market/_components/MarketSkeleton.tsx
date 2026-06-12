import { Skeleton } from '@/components/loading-state'

/**
 * MarketSkeleton — loading state matching each card's footprint.
 * Mirrors the success layout (hero + chart + weighted 2-up + audience), with
 * staggered fade via craft-enter delays.
 */
export function MarketSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Loading market intelligence">
      {/* Hero footprint */}
      <div className="card-console-hero craft-enter craft-enter-1 grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:p-10">
        <div className="space-y-4">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-16 w-48" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <Skeleton className="h-[168px] w-[168px] rounded-full" />
          <div className="w-full space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Volume chart footprint */}
      <div className="card-console craft-enter craft-enter-2 p-6">
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="mb-5 h-3 w-72" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>

      {/* Weighted 2-up: prompt table (1.5fr) + trending (1fr) */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="card-console craft-enter craft-enter-3 p-6">
          <Skeleton className="mb-2 h-3 w-32" />
          <Skeleton className="mb-5 h-3 w-64" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-console craft-enter craft-enter-4 p-6">
          <Skeleton className="mb-2 h-3 w-28" />
          <Skeleton className="mb-5 h-3 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience + co-citation 2-up */}
      <div className="grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card-console craft-enter craft-enter-5 p-6">
            <Skeleton className="mb-2 h-3 w-28" />
            <Skeleton className="mb-5 h-3 w-56" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading market intelligence and prompt volume</span>
    </div>
  )
}
