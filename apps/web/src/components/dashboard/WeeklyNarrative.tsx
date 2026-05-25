'use client'

import type { DashboardOutcomes, Win } from '@/types/outcomes'
import { CheckCircle2 } from 'lucide-react'

interface WeeklyNarrativeProps {
  weeklyNarrative: DashboardOutcomes['weeklyNarrative']
}

function SetupInProgress() {
  return (
    <div
      role="status"
      aria-label="Weekly narrative — setup in progress"
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
    >
      {/* Subtle animated pulse indicator */}
      <div className="w-10 h-10 rounded-full bg-[#3370FF]/8 flex items-center justify-center mb-4" aria-hidden="true">
        <div className="w-3 h-3 rounded-full bg-[#3370FF]/30 relative">
          <span className="absolute inset-0 rounded-full bg-[#3370FF]/20 animate-ping" />
        </div>
      </div>
      <p className="text-sm font-medium text-[#0A0A0A] mb-1">Setup in progress</p>
      <p className="text-sm text-[#6B7280] max-w-[280px] leading-relaxed">
        Your weekly wins will appear here after your first scan delivers results.
      </p>
    </div>
  )
}

function WinRow({ win }: { win: Win }) {
  return (
    <li className="flex items-start gap-3 py-3 border-b border-[#F3F4F6] last:border-0">
      <CheckCircle2
        className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm text-[#374151] leading-snug">{win.description}</span>
    </li>
  )
}

export function WeeklyNarrative({ weeklyNarrative }: WeeklyNarrativeProps) {
  const hasWins = weeklyNarrative.type === 'wins' && weeklyNarrative.items && weeklyNarrative.items.length > 0

  return (
    <section
      aria-labelledby="weekly-narrative-heading"
      className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
        <h2
          id="weekly-narrative-heading"
          className="text-sm font-semibold text-[#0A0A0A]"
        >
          This week we got you…
        </h2>
        {hasWins && (
          <span className="text-xs font-medium text-[#6B7280]">
            {weeklyNarrative.items!.length} win{weeklyNarrative.items!.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {hasWins ? (
        <ul
          className="px-5 divide-y divide-[#F3F4F6]"
          aria-label="Weekly wins"
        >
          {weeklyNarrative.items!.map((win) => (
            <WinRow key={win.id} win={win} />
          ))}
        </ul>
      ) : (
        <SetupInProgress />
      )}
    </section>
  )
}
