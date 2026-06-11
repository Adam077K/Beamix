'use client'

import { Check } from 'lucide-react'
import type { DigestWin } from '@/types/digest'

interface DigestWinsProps {
  wins: DigestWin[]
}

/**
 * DigestWins — "What the crew shipped" win rows.
 *
 * Reuses WinRow check-disc grammar from WeeklyNarrative:
 *  - bg var(--color-status-positive) with white Check — WCAG-cleared
 *  - query renders in Geist Mono when present
 *
 * Divide-y rows, px-5 py-3.5, consistent with WeeklyNarrative.
 * Engineering Principle #9: agentName is never rendered customer-facing.
 */
export function DigestWins({ wins }: DigestWinsProps) {
  if (wins.length === 0) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-[13px] text-[#9CA3AF]">No wins recorded for this week.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-[#F3F4F6]" aria-label="Wins shipped this week">
      {wins.map((win) => (
        <WinRow key={win.id} win={win} />
      ))}
    </ul>
  )
}

function WinRow({ win }: { win: DigestWin }) {
  return (
    <li className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F4F6FA]">
      {/* Green check disc — same as WeeklyNarrative, WCAG-cleared white on #0E9E6E */}
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-status-positive)' }}
        aria-hidden="true"
      >
        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-snug text-[#374151]">
          {win.description}
        </p>

        {/* Query — Geist Mono when present */}
        {win.query && (
          <p className="mt-1 font-mono text-[12px] text-[#6B7280]">
            &ldquo;{win.query}&rdquo;
          </p>
        )}
        {/* agentName is intentionally NOT rendered (Principle #9) */}
      </div>
    </li>
  )
}
