/**
 * DigestDetailSkeleton — loading state for /digests/[digestId].
 *
 * Mirrors the exact structure of DigestDetailView so the skeleton
 * "resolves" into the real content without a layout shift.
 *
 * No animate-pulse on structural chrome — only on text/number placeholders.
 * Skeleton follows the TIER-1/TIER-2/TIER-3 depth staging exactly.
 */
export function DigestDetailSkeleton() {
  return (
    <main
      className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading digest"
    >
      {/* Back link skeleton */}
      <div className="mb-5">
        <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
      </div>

      {/* TIER-1 hero skeleton */}
      <div
        className="card-console-hero overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)' }}
      >
        <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-start sm:gap-10 sm:p-10">
          <div className="flex-1 space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-8 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 sm:min-w-[140px]">
            <div className="h-3 w-14 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
      </div>

      {/* Gap */}
      <div className="mt-10" />

      {/* Engine scores skeleton — asymmetric 2-up */}
      <section aria-label="Score movement loading">
        <div className="mb-4 flex items-baseline justify-between">
          <div className="h-3 w-28 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* TIER-2 focus skeleton */}
          <div className="card-console overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-6 w-16 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <div className="h-12 w-24 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-4 w-10 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-5 w-10 animate-pulse rounded-full bg-[#F3F4F6]" />
            </div>
          </div>
          {/* TIER-3 inset skeletons */}
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="card-inset overflow-hidden p-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 animate-pulse rounded bg-[#EFEDEA]" />
                  <div className="h-6 w-16 animate-pulse rounded bg-[#EFEDEA]" />
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <div className="h-8 w-16 animate-pulse rounded bg-[#EFEDEA]" />
                  <div className="h-3 w-8 animate-pulse rounded bg-[#EFEDEA]" />
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-3 w-12 animate-pulse rounded bg-[#EFEDEA]" />
                  <div className="h-4 w-8 animate-pulse rounded-full bg-[#EFEDEA]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gap */}
      <div className="mt-12" />

      {/* Wins skeleton */}
      <section aria-label="Work shipped loading">
        <div className="mb-4 flex items-center gap-3" style={{ borderLeft: '3px solid #EEEAFD', paddingLeft: '10px' }}>
          <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="card-inset flex items-start gap-3 p-4">
              <div
                className="mt-0.5 flex h-5 w-5 shrink-0 animate-pulse items-center justify-center rounded-full bg-[#EFEDEA]"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-[#EFEDEA]" />
                  <div className="h-4 flex-1 animate-pulse rounded bg-[#EFEDEA]" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Gap */}
      <div className="mt-12" />

      {/* Customer note skeleton */}
      <div className="rounded-[var(--radius-card)] bg-surface-warm p-6 sm:p-8">
        <div className="mb-3 h-3 w-20 animate-pulse rounded bg-[#EFEDEA]" />
        <div className="space-y-2.5">
          <div className="h-4 w-full animate-pulse rounded bg-[#EFEDEA]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#EFEDEA]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#EFEDEA]" />
        </div>
      </div>
    </main>
  )
}
