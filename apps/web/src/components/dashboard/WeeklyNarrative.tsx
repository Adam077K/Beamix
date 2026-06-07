'use client'

import type { DashboardOutcomes, Win } from '@/types/outcomes'
import { Check, Calendar } from 'lucide-react'

/**
 * WeeklyNarrative — the calm "this week we got you…" ledger.
 *
 * Contract preserved: { weeklyNarrative: { type: 'empty' | 'wins'; items?: Win[] } }.
 * Reworked into a dense-but-calm list (Linear-log rhythm) with the layered
 * Stripe card finish. Wins are the crew's results, so the marker reads in the
 * positive-status green; this is a results surface, not a CTA surface, so no
 * blue and no violet button appears.
 *
 * States: empty (designed, sells the next scan), wins (populated).
 */

interface WeeklyNarrativeProps {
  weeklyNarrative: DashboardOutcomes['weeklyNarrative']
}

function EmptyState() {
  return (
    <div
      role="status"
      aria-label="No wins yet — setup in progress"
      className="flex flex-col items-center justify-center bg-surface-warm px-6 py-12 text-center"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card"
        aria-hidden="true"
      >
        <Calendar className="h-5 w-5 text-[#9CA3AF]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-[#0A0A0A]">No wins to show yet</p>
      <p className="mt-1 max-w-[300px] text-[13px] leading-relaxed text-[#6B7280]">
        Once your first scan lands and the crew makes its first fixes, every win shows up
        here — plain language, no jargon.
      </p>
    </div>
  )
}

function WinRow({ win }: { win: Win }) {
  return (
    <li className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F4F6FA]">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-positive"
        aria-hidden="true"
      >
        <Check className="h-3 w-3 text-status-positive" strokeWidth={2.5} />
      </span>
      <span className="text-[14px] leading-snug text-[#374151]">{win.description}</span>
    </li>
  )
}

export function WeeklyNarrative({ weeklyNarrative }: WeeklyNarrativeProps) {
  const hasWins =
    weeklyNarrative.type === 'wins' &&
    weeklyNarrative.items &&
    weeklyNarrative.items.length > 0

  return (
    <section
      aria-labelledby="weekly-narrative-heading"
      className="card-console flex h-full flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <h2 id="weekly-narrative-heading" className="text-sm font-semibold text-[#0A0A0A]">
          This week we got you
        </h2>
        {hasWins && (
          <span className="font-mono text-[12px] text-[#6B7280] tabular-nums">
            {weeklyNarrative.items!.length} win
            {weeklyNarrative.items!.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="border-t border-[#F3F4F6]" />

      {hasWins ? (
        <ul className="divide-y divide-[#F3F4F6]" aria-label="Weekly wins">
          {weeklyNarrative.items!.map((win) => (
            <WinRow key={win.id} win={win} />
          ))}
        </ul>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}
