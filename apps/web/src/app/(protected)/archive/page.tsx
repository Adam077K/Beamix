/**
 * Run History / Output Archive — /archive
 *
 * Phase 1: design + full mock data, ZERO backend.
 * All data from lib/demo/surfaces/archive.ts.
 *
 * Layout: <PageHeader> + TIER-1 hero card wrapping a TIER-3 recessed summary
 *         strip + the dense run table.
 * Craft: M1 depth (TIER-3 .card-inset strip lifts the TIER-1 table card),
 *        M2 type contract (agent-name anchor + promoted mono duration figure),
 *        M4/M7 in-row truth (per-run duration + step progress, status hairline),
 *        M5 serif beat (SerifVerdict on the run-health verdict word in the strip),
 *        M6 violet=Beamix / blue=you mode signal + violet drawer,
 *        M8 two-tier empty, M9 entrance stagger, M11 mono numbers, M12 rhythm.
 */

import { Suspense } from 'react'
import { PageHeader } from '@/components/page-header'
import { ArchiveClientShell } from './_components/ArchiveClientShell'

export default function ArchivePage() {
  return (
    // M9 entrance choreography — fade-up stagger on the overall container
    <div className="craft-enter craft-enter-1 space-y-0">
      {/* PageHeader — STEP-2 type (30px InterDisplay-Medium) */}
      <PageHeader
        eyebrow="Bright Smile Dental"
        title="Run History"
        subtitle="Every agent run — by you and by Beamix — in one place. Re-open any run to see the full trace and replay what happened."
      />

      {/* TIER-1 focal: the run table is the primary surface on this page. It
          lifts against the recessed TIER-3 summary strip inside it (M1). */}
      <div className="card-console-hero rounded-[var(--radius-card)] p-6 craft-enter craft-enter-2">
        <Suspense fallback={<ArchiveTableSkeleton />}>
          <ArchiveClientShell />
        </Suspense>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Suspense fallback — shown while ArchiveClientShell hydrates / during prerender.
// Mirrors the real shape (TIER-3 strip → filter row → grid table) so there is
// no layout shift on hydration.
// ---------------------------------------------------------------------------

function ArchiveTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading run history">
      {/* TIER-3 strip skeleton */}
      <div className="card-inset mb-5 flex items-center justify-between px-5 py-4">
        <div className="h-4 w-64 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="flex gap-8">
          <div className="h-9 w-14 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-9 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-9 w-14 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
      </div>
      {/* Filter bar skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-8 w-[176px] animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-8 w-[136px] animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-8 w-[136px] animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
        <div className="h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      {/* Table header skeleton */}
      <div className="mb-3 grid grid-cols-[1fr_auto_auto_auto_auto_16px] items-center gap-x-6 border-b border-[#E5E7EB] pb-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-10 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-14 animate-pulse justify-self-end rounded bg-[#F3F4F6]" />
        <div className="h-3 w-12 animate-pulse justify-self-end rounded bg-[#F3F4F6]" />
        <span />
      </div>
      {/* Row skeletons — fading opacity */}
      {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_auto_auto_auto_auto_16px] items-center gap-x-6 border-b border-[#F3F4F6] py-3.5"
          style={{ opacity }}
        >
          <div className="space-y-1.5">
            <div className="h-4 w-44 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-72 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-5 w-16 animate-pulse rounded-md bg-[#F3F4F6]" />
          <div className="h-6 w-12 animate-pulse justify-self-end rounded bg-[#F3F4F6]" />
          <div className="h-4 w-10 animate-pulse justify-self-end rounded bg-[#F3F4F6]" />
          <span />
        </div>
      ))}
    </div>
  )
}
