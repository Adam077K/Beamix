'use client'

/**
 * ReportsSkeleton — the LOADING state. The shell renders; the rail and canvas
 * show skeleton block rows. No spinner-in-void.
 */

import { Skeleton } from '@/components/ui/skeleton'

export function RailSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-3 w-16" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function CanvasSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-3 w-56" />
      {/* cover */}
      <Skeleton className="h-40 w-full rounded-2xl" />
      {/* 2-up weighted */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
    </div>
  )
}
