'use client'

import Link from 'next/link'
import type { DashboardOutcomes, Win } from '@/types/outcomes'
import { Check, Calendar } from 'lucide-react'

/**
 * WeeklyNarrative — the calm "this week we got you…" ledger.
 *
 * Craft moves applied:
 * M8 — designed empty with two-tier CTA (primary blue pill + quiet secondary)
 * M9 — craft-enter-4 entrance stagger
 * M11 — win count in Geist Mono tabular-nums
 * M12 — 48px gap from engine section (handled by page-level spacing)
 */

interface WeeklyNarrativeProps {
  weeklyNarrative: DashboardOutcomes['weeklyNarrative']
}

function EmptyState() {
  return (
    /* M8 two-tier empty: character glyph + context + one specific next step + two-tier CTA */
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
      <p className="text-sm font-semibold text-[#0A0A0A]">No wins to show yet</p>
      <p className="mt-1.5 max-w-[280px] text-[13px] leading-relaxed text-[#6B7280]">
        Once your first scan lands and the crew starts making fixes, every result shows up here
        — plain language, no jargon.
      </p>
      {/* M8 two-tier CTA */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/scan"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          Run your first scan
        </Link>
        <Link
          href="/agents"
          className="text-[12px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none"
        >
          See what the crew can do
        </Link>
      </div>
    </div>
  )
}

function WinRow({ win }: { win: Win }) {
  return (
    <li className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F4F6FA]">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-status-positive)' }}
        aria-hidden="true"
      >
        {/* White on #0E9E6E ≈ 3.2:1 — clears WCAG 3:1 for graphical objects */}
        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
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
      /* M9 craft-enter-4 stagger (4th in page priority order) */
      className="card-console flex h-full flex-col overflow-hidden craft-enter craft-enter-4"
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
