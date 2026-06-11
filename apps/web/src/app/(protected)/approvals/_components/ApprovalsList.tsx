import { Sparkles } from 'lucide-react'
import type { ApprovalQueueItem } from '../_data'
import { sortApprovals } from '../_logic'
import { ApprovalRow } from './ApprovalRow'

// ---------------------------------------------------------------------------
// EmptyApprovals — warm crew idiom, mirrors AgentActivityPanel
// ---------------------------------------------------------------------------

function EmptyApprovals() {
  return (
    <div
      role="status"
      aria-label="No items waiting for review"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-agent-tint"
        aria-hidden="true"
      >
        {/* Breathing violet dot + sparkles, matching AgentActivityPanel empty idiom */}
        <span className="relative flex items-center justify-center">
          <span
            className="absolute h-10 w-10 rounded-full bg-agent opacity-10 motion-safe:animate-ping"
            aria-hidden="true"
          />
          <Sparkles className="relative h-5 w-5 text-agent" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>
      <p className="text-sm font-medium text-[#0A0A0A]">
        All clear — the crew is watching.
      </p>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#6B7280]">
        Nothing needs your sign-off right now. When the agents prepare a fix worth
        making, it lands here for your review.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LoadingSkeleton — wired as the loading state for this list
// ---------------------------------------------------------------------------

export function LoadingSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading approvals" className="divide-y divide-[#F3F4F6]">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4">
          {/* Badge skeleton */}
          <div className="h-5 w-16 shrink-0 animate-pulse rounded-md bg-[#F3F4F6]" />
          {/* Text skeleton */}
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          {/* Expiry skeleton */}
          <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
          {/* Chevron skeleton */}
          <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-[#F3F4F6]" />
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// ApprovalsList — Server Component
// ---------------------------------------------------------------------------

interface ApprovalsListProps {
  approvals: ApprovalQueueItem[]
  isLoading?: boolean
}

export function ApprovalsList({ approvals, isLoading }: ApprovalsListProps) {
  // Wire the loading skeleton as the actual loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (approvals.length === 0) {
    return <EmptyApprovals />
  }

  // sortApprovals is imported from _logic — single source of truth (item #6)
  const sorted = sortApprovals(approvals)

  return (
    <ul className="divide-y divide-[#F3F4F6]" aria-label="Items waiting for your review">
      {sorted.map((item) => (
        <ApprovalRow key={item.id} item={item} />
      ))}
    </ul>
  )
}
