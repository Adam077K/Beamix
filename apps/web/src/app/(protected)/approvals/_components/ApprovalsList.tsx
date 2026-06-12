import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { ApprovalQueueItem } from '../_data'
import { ApprovalRow } from './ApprovalRow'

// ---------------------------------------------------------------------------
// EmptyApprovals — M8 designed empty (two-tier recovery + warm glyph + serif beat).
//
// Anchored inside the framed surface (the page wraps it), not a bare centered
// icon-in-a-void. Carries: titled context + one specific next step + a TWO-tier
// CTA (primary blue pill + quiet secondary link) + a warm violet character glyph
// (moments-only). M5: one Fraunces italic beat on the verdict word "clear".
// ---------------------------------------------------------------------------

function EmptyApprovals() {
  return (
    <div
      role="status"
      aria-label="No items waiting for review"
      className="flex flex-col items-center px-6 py-16 text-center sm:py-20"
    >
      {/* warm violet character glyph — moments only, never persistent */}
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(110,86,240,0.14)' }}
        aria-hidden="true"
      >
        <span className="relative flex items-center justify-center">
          <span
            className="absolute h-11 w-11 rounded-full bg-agent opacity-10 motion-safe:animate-ping"
            aria-hidden="true"
          />
          <Sparkles className="relative h-6 w-6 text-agent" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>

      {/* M5 Fraunces beat on the verdict word */}
      <p className="text-[17px] font-medium text-[#0A0A0A]">
        All{' '}
        <span className="font-[var(--font-serif)] text-[19px] font-normal italic">clear</span>
        {' '}— the crew is watching.
      </p>
      <p className="mt-2 max-w-[320px] text-[13px] leading-relaxed text-[#6B7280]">
        Nothing needs your sign-off right now. When the agents prepare a fix worth making,
        it lands here for your review.
      </p>

      {/* M8 two-tier CTA — primary blue pill + quiet secondary link */}
      <div className="mt-6 flex flex-col items-center gap-2.5">
        <Link
          href="/scan"
          className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          Run a fresh scan
        </Link>
        <Link
          href="/dashboard"
          className="text-[12px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
        >
          See what the crew is working on →
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LoadingSkeleton — wired as the loading state for this list.
// ---------------------------------------------------------------------------

export function LoadingSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading approvals" className="divide-y divide-[#F3F4F6]">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-5 w-16 shrink-0 animate-pulse rounded-md bg-[#F3F4F6]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// ApprovalsList — the dense review ledger (M10 progressive disclosure).
//
// Receives the already-sorted items with the TIER-1 focal removed by the page;
// renders the rest as a recede ledger (TIER-3 register) so the focal commands
// and these recede (kills the N-equal stack, tell #1/#2). Each row carries the
// M6 violet agent-hairline + M9 staggered entrance.
// ---------------------------------------------------------------------------

interface ApprovalsListProps {
  approvals: ApprovalQueueItem[]
  isLoading?: boolean
}

export function ApprovalsList({ approvals, isLoading }: ApprovalsListProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (approvals.length === 0) {
    return <EmptyApprovals />
  }

  return (
    <ul className="divide-y divide-[#F3F4F6]" aria-label="Items waiting for your review">
      {approvals.map((item, i) => (
        <ApprovalRow key={item.id} item={item} index={i} />
      ))}
    </ul>
  )
}
