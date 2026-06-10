'use client'

/**
 * DigestSkeleton — loading state for the full digest archive.
 *
 * 6 ghost rows with animate-pulse bars.
 * No spinners — transform/opacity only, reduced-motion respected via global CSS.
 */
export function DigestSkeleton() {
  return (
    <div
      className="card-console overflow-hidden"
      aria-busy="true"
      aria-label="Loading weekly digests"
    >
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-3">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
      </div>

      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[#F3F4F6] px-5 py-4 last:border-0"
        >
          {/* Date column */}
          <div className="w-24 shrink-0 space-y-1.5">
            <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-14 animate-pulse rounded bg-[#F3F4F6]" />
          </div>

          {/* Headline */}
          <div className="min-w-0 flex-1">
            <div className="h-4 w-full animate-pulse rounded bg-[#F3F4F6]" />
          </div>

          {/* Delta trio */}
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>

          {/* Win count + reviewed */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="h-4 w-10 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * DigestPanelSkeleton — loading state for the open digest panel/accordion.
 */
export function DigestPanelSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading digest" className="space-y-0 divide-y divide-[#F3F4F6]">
      {/* Score snapshot skeleton */}
      <div className="px-5 py-5">
        <div className="mb-3 h-3 w-28 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#F3F4F6] p-3">
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="mb-1 h-10 w-12 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-3 w-10 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          ))}
        </div>
      </div>

      {/* Wins skeleton */}
      <div className="px-5 py-4">
        <div className="mb-3 h-3 w-36 animate-pulse rounded bg-[#F3F4F6]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-full animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
