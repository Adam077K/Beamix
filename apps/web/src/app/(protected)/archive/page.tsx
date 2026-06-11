/**
 * Run History / Output Archive — /archive
 *
 * Phase 1: design + full mock data, ZERO backend.
 * All data from lib/demo/surfaces/archive.ts.
 *
 * Layout: <PageHeader> + <RunTable> — NOT the 5-zone ToolPage spine.
 * Craft: M1 depth (TIER-3 meta row + TIER-2 table card), M2 type contract,
 *        M5 serif beat (SerifVerdict on "replay"), M6 violet in drawer,
 *        M8 two-tier empty, M9 entrance stagger, M11 mono numbers.
 */

import { Suspense } from 'react'
import { PageHeader } from '@/components/page-header'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { ArchiveClientShell } from './_components/ArchiveClientShell'

export default function ArchivePage() {
  return (
    // M9 entrance choreography — fade-up stagger on the overall container
    <div className="craft-enter craft-enter-1 space-y-0">
      {/* PageHeader — STEP-2 type (30px InterDisplay-Medium) */}
      <PageHeader
        eyebrow="Bright Smile Dental"
        title="Run History"
        subtitle={
          <>
            Every agent run — manual and autonomous — in one place. Re-open any run to
            see the full trace and{' '}
            <SerifVerdict>replay</SerifVerdict> what happened.
          </>
        }
      />

      {/* TIER-2 card: the run table lives at standard depth */}
      <div className="card-console rounded-[var(--radius-card)] p-6 craft-enter craft-enter-2">
        <Suspense fallback={<ArchiveTableSkeleton />}>
          <ArchiveClientShell />
        </Suspense>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Suspense fallback — shown while ArchiveClientShell hydrates / during prerender.
// Matches the shape of the real table so there is no layout shift.
// ---------------------------------------------------------------------------

function ArchiveTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading run history">
      {/* Filter bar skeleton */}
      <div className="mb-4 flex gap-2">
        <div className="h-8 w-[180px] animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-8 w-[140px] animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-8 w-[140px] animate-pulse rounded-lg bg-[#F3F4F6]" />
      </div>
      {/* Table header skeleton */}
      <div className="mb-3 flex items-center gap-4 border-b border-[#E5E7EB] pb-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-20 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-12 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      {/* Row skeletons — 5 rows fading opacity */}
      {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[#F3F4F6] py-3"
          style={{ opacity }}
        >
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-36 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-64 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="h-5 w-16 shrink-0 animate-pulse rounded-md bg-[#F3F4F6]" />
          <div className="h-5 w-20 shrink-0 animate-pulse rounded-md bg-[#F3F4F6]" />
          <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
        </div>
      ))}
    </div>
  )
}
