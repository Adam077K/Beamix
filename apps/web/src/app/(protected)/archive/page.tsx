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
        <ArchiveClientShell />
      </div>
    </div>
  )
}
