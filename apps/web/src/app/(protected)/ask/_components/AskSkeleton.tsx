/**
 * AskSkeleton — the loading state.
 *
 * A calm ghost of the thread shape (one user annotation block + one answer
 * card), NOT a spinner in a void. Uses the surface's real rhythm so the load
 * reads as "the thread is coming", not "something is stuck".
 */
export function AskSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading your conversation">
      {/* User annotation ghost */}
      <div className="border-l-2 border-[#C9D8FB] pl-4">
        <div className="mb-2 h-3 w-20 animate-pulse rounded bg-[#EEF2F8]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#EEF2F8]" />
      </div>

      {/* Answer ghost */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#E0DAF8]" />
          <span className="h-2.5 w-14 animate-pulse rounded bg-[#EEEAFD]" />
        </div>
        <div className="space-y-2.5">
          <div className="h-4 w-full animate-pulse rounded bg-[#F2F2F2]" />
          <div className="h-4 w-[92%] animate-pulse rounded bg-[#F2F2F2]" />
          <div className="h-4 w-[78%] animate-pulse rounded bg-[#F2F2F2]" />
        </div>
        <div className="mt-4 flex gap-1.5">
          <div className="h-6 w-32 animate-pulse rounded-md bg-[#F4F6FA]" />
          <div className="h-6 w-40 animate-pulse rounded-md bg-[#F4F6FA]" />
        </div>
      </div>
    </div>
  )
}
