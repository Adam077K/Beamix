'use client'

import { EngineScoreCard } from './EngineScoreCard'
import { DigestWins } from './DigestWins'
import { DigestApprovalRow } from './DigestApprovalRow'
import { CustomerNoteBlock } from './CustomerNoteBlock'
import type { WeeklyDigest } from '@/types/digest'

interface DigestPanelBodyProps {
  digest: WeeklyDigest
}

/**
 * DigestPanelBody — the 4-section inner content shared by both:
 *  - DigestPanel (slide-over on ≥1024px)
 *  - DigestAccordionBody (inline accordion on <1024px)
 *
 * Sections are stacked divide-y, NOT nested cards.
 * Excluded from list column: CustomerNoteBlock.
 *
 * Sections:
 *  1. "Where you stand" — EngineScoreCard trio
 *  2. "What the crew shipped" — DigestWins
 *  3. "What we asked you" — DigestApprovalRow list (historical, read-only)
 *  4. CustomerNoteBlock — Fraunces warm inset (only Fraunces on screen)
 */
export function DigestPanelBody({ digest }: DigestPanelBodyProps) {
  const { digest: d } = digest

  return (
    <div className="divide-y divide-[#F3F4F6]">
      {/* SECTION 1: Score snapshot */}
      <section aria-labelledby={`score-heading-${digest.id}`} className="px-5 py-5">
        <h3
          id={`score-heading-${digest.id}`}
          className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          Where you stand
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {d.engineDeltas.map((delta) => (
            <EngineScoreCard key={delta.engine} delta={delta} />
          ))}
        </div>
      </section>

      {/* SECTION 2: What the crew shipped */}
      <section aria-labelledby={`wins-heading-${digest.id}`}>
        <div className="px-5 py-3">
          <h3
            id={`wins-heading-${digest.id}`}
            className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
          >
            What the crew shipped
          </h3>
        </div>
        <DigestWins wins={d.wins} />
      </section>

      {/* SECTION 3: What we asked you — only if there are resolved approvals */}
      {d.resolvedApprovals.length > 0 && (
        <section aria-labelledby={`approvals-heading-${digest.id}`}>
          <div className="px-5 py-3">
            <h3
              id={`approvals-heading-${digest.id}`}
              className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
            >
              What we asked you
            </h3>
          </div>
          <ul
            className="divide-y divide-[#F3F4F6]"
            aria-label="Resolved approvals from this week"
          >
            {d.resolvedApprovals.map((approval) => (
              <DigestApprovalRow key={approval.id} approval={approval} />
            ))}
          </ul>
        </section>
      )}

      {/* SECTION 4: Customer note — Fraunces, once per digest */}
      <section aria-label="A note for you">
        <CustomerNoteBlock note={d.customerNote} />
      </section>
    </div>
  )
}
