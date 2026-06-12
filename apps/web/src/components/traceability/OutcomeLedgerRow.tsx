import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Outcome } from '@/types/traceability'
import { ENGINE_LABEL, shortDate } from './helpers'

interface OutcomeLedgerRowProps {
  outcome: Outcome
  /** Stagger class for entrance choreography (M9). */
  enterClass?: string
}

/**
 * OutcomeLedgerRow — one secondary outcome in the dense TIER-3 ledger (M1/M11).
 *
 * After the TIER-1 hero, the remaining outcomes read as a dense, dated ledger —
 * the receipt body. Each row carries a real metric cluster (delta pt / engine /
 * deliverable count / date) like the competitor insight tables, never a flat
 * full-width card. Depth steps hero(TIER-1) → ledger(TIER-3).
 *
 * Color laws:
 *  - Violet thread stub + node = the agent work, glanceable at arm's length (M6)
 *  - Blue delta pill = the proof, mono tabular-nums
 *  - No green here (one positive-figure focal lives in the hero)
 */
export function OutcomeLedgerRow({ outcome, enterClass = '' }: OutcomeLedgerRowProps) {
  const positive = outcome.deltaPoints >= 0
  const deliverableCount = outcome.deliverables.length

  return (
    <Link
      href={`/traceability/${outcome.id}`}
      aria-label={`See the full work trail: ${outcome.statement}`}
      className={`group craft-enter ${enterClass} relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFBFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-inset sm:gap-5 sm:px-6`}
    >
      {/* Violet thread stub + node — the agent dimension, visible on the list (M6).
          A short vertical thread with a violet node anchors each row to the
          blue=you / violet=agents promise without a button/link in violet. */}
      <span
        aria-hidden="true"
        className="relative flex h-9 w-3 shrink-0 items-center justify-center self-stretch"
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-agent opacity-25" />
        <span className="timeline-node ring-4 ring-white" />
      </span>

      {/* Statement + engine meta */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium leading-snug text-[#0A0A0A] sm:text-[15px]">
          {outcome.statement}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-agent">
            {ENGINE_LABEL[outcome.engine]}
          </span>
          <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-[#D1D5DB]" />
          <span className="font-mono text-[11px] tabular-nums text-[#9CA3AF]">
            {deliverableCount} deliverable{deliverableCount !== 1 ? 's' : ''}
          </span>
        </span>
      </span>

      {/* Metric cluster — delta pill + date + chevron (Profound-density) */}
      <span className="flex shrink-0 items-center gap-4">
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[12px] font-semibold tabular-nums ${
            positive
              ? 'bg-status-info text-status-info'
              : 'bg-status-critical text-status-critical'
          }`}
        >
          {positive ? '+' : ''}
          {outcome.deltaPoints} pt
        </span>

        <span className="hidden w-[52px] text-right font-mono text-[12px] tabular-nums text-[#6B7280] sm:inline-block">
          {shortDate(outcome.achievedAt)}
        </span>

        <ChevronRight
          className="h-4 w-4 text-[#C4C9D2] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#6B7280] motion-reduce:transition-none"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}
