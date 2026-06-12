import { Skeleton } from '@/components/loading-state'

/**
 * AnalyticsSkeleton — loading state matching each card's footprint.
 * Mono-width number placeholders, staggered fade via craft-enter delays.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Loading your insights">
      {/* Hero footprint */}
      <div className="card-console-hero craft-enter craft-enter-1 grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:p-10">
        <div className="space-y-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-16 w-40" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <Skeleton className="h-[168px] w-[168px] rounded-full" />
          <div className="w-full space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Visibility trend footprint */}
      <div className="card-console craft-enter craft-enter-2 p-6">
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="mb-5 h-3 w-64" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>

      {/* Weighted 2-up footprint */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="card-console craft-enter craft-enter-3 p-6">
          <Skeleton className="mb-2 h-3 w-40" />
          <Skeleton className="mb-5 h-3 w-32" />
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </div>
        <div className="card-console craft-enter craft-enter-4 p-6">
          <Skeleton className="mb-2 h-3 w-32" />
          <Skeleton className="mb-5 h-3 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix footprint */}
      <div className="card-console craft-enter craft-enter-5 p-6">
        <Skeleton className="mb-2 h-3 w-40" />
        <Skeleton className="mb-5 h-3 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[180px_repeat(5,1fr)] gap-1">
              <Skeleton className="h-11 w-32" />
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-11 w-full rounded-md" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading your answer-engine insights</span>
    </div>
  )
}
