import { Suspense } from 'react'
import { getRunningProgress, getTodayAuditLog, getRootTraces } from './lib/queries'
import { LiveSection } from './components/LiveSection'
import { TodaySection } from './components/TodaySection'
import { TraceTree } from './components/TraceTree'

// Revalidate every 30 seconds for server-side data freshness
export const revalidate = 30

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-border bg-card py-4 shadow-sm">
      {children}
    </div>
  )
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 px-3 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-5">
          <div className="h-2 w-2 rounded-full animate-pulse bg-muted" />
          <div className="h-3 w-24 animate-pulse bg-muted rounded" />
          <div className="h-3 w-48 animate-pulse bg-muted rounded" />
          <div className="ml-auto h-3 w-16 animate-pulse bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export default async function WarRoomPage() {
  // Parallel data fetches — all server-side, service role bypasses RLS
  const [runningRows, todayData, roots] = await Promise.all([
    getRunningProgress(),
    getTodayAuditLog(),
    getRootTraces(),
  ])

  return (
    <div className="flex flex-col gap-4">
      {/* Section 1 — NOW RUNNING */}
      <SectionWrapper>
        <Suspense fallback={<SectionSkeleton rows={3} />}>
          <LiveSection initialRows={runningRows} />
        </Suspense>
      </SectionWrapper>

      {/* Section 2 — TODAY */}
      <SectionWrapper>
        <Suspense fallback={<SectionSkeleton rows={6} />}>
          <TodaySection initialData={todayData} />
        </Suspense>
      </SectionWrapper>

      {/* Section 3 — TRACE VIEW */}
      <SectionWrapper>
        <Suspense fallback={<SectionSkeleton rows={4} />}>
          <TraceTree roots={roots} />
        </Suspense>
      </SectionWrapper>

      {/* Footer note — per ORCHESTRATION.md errata 4 */}
      <p className="text-center font-mono text-[10px] text-muted-foreground/40 pb-4">
        cost is observed passively — this page does not alert. runaway-watcher enforces silently.
      </p>
    </div>
  )
}
