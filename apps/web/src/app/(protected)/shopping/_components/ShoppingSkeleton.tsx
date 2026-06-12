/**
 * ShoppingSkeleton — loading state for the Shopping workbench.
 *
 * Skeleton hero figure + matrix cell pulses. Shapes match the real layout so
 * the load reads as the page assembling, never a blank void. Pulse honors
 * prefers-reduced-motion via Tailwind's motion-safe.
 */

function Pulse({ className }: { className?: string }) {
  return <div className={`motion-safe:animate-pulse rounded bg-[#EEF2FF] ${className ?? ''}`} />
}

export function ShoppingSkeleton() {
  return (
    <div className="space-y-8" aria-hidden="true">
      {/* Hero */}
      <div className="card-console-hero grid gap-8 p-8 lg:grid-cols-[1fr_220px] lg:items-center lg:p-10">
        <div className="space-y-4">
          <Pulse className="h-3 w-40" />
          <Pulse className="h-14 w-44" />
          <Pulse className="h-7 w-2/3 bg-[#F3F4F6]" />
          <Pulse className="h-6 w-48" />
        </div>
        <div className="space-y-3 lg:justify-self-end">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-12 w-40 bg-[#F3F4F6]" />
        </div>
      </div>

      {/* SKU table */}
      <div className="card-console p-6">
        <Pulse className="h-5 w-36" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Pulse key={i} className="h-9 w-full bg-[#F3F4F6]" />
          ))}
        </div>
      </div>

      {/* Matrix */}
      <div className="card-console p-6">
        <Pulse className="h-5 w-44" />
        <div className="mt-5 grid grid-cols-[200px_repeat(3,1fr)] gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <Pulse key={i} className="h-12 w-full bg-[#F3F4F6]" />
          ))}
        </div>
      </div>
    </div>
  )
}
