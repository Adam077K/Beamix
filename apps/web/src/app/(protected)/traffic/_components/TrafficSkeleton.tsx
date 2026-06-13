import { Skeleton } from '@/components/loading-state'

/**
 * TrafficSkeleton — loading state matching each card's footprint.
 * Mirrors AnalyticsSkeleton: hero block + crawler chart + 2-up + content table.
 */
export function TrafficSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Loading your traffic">
      {/* Hero footprint */}
      <div className="card-console-hero craft-enter craft-enter-1 grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:p-10">
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-16 w-44" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Crawler activity footprint */}
      <div className="card-console craft-enter craft-enter-2 p-6">
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="mb-5 h-3 w-64" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>

      {/* Weighted 2-up footprint */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="card-console craft-enter craft-enter-3 p-6">
          <Skeleton className="mb-2 h-3 w-40" />
          <Skeleton className="mb-5 h-3 w-56" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-console craft-enter craft-enter-4 p-6">
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="mb-5 h-3 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
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

      {/* Content table footprint */}
      <div className="card-console craft-enter craft-enter-5 p-6">
        <Skeleton className="mb-2 h-3 w-40" />
        <Skeleton className="mb-5 h-3 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_88px_88px_140px_72px] items-center gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-12 justify-self-end" />
              <Skeleton className="h-4 w-12 justify-self-end" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 justify-self-end rounded" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading your AI traffic and crawler analytics</span>
    </div>
  )
}
