'use client'

import { cn } from '@/lib/utils'

export type RunMode = 'myself' | 'beamix'

interface ModeToggleProps {
  mode: RunMode
  onChange: (mode: RunMode) => void
  /** Allotment label e.g. "6 of 10 autonomous runs left" */
  allotmentLabel?: string
  /** When true, shows "uncapped · concierge" instead of allotment */
  uncapped?: boolean
  disabled?: boolean
}

/**
 * ModeToggle — the category-defining two-segment pill (CONSOLE-SPINE-DIRECTION.md §B).
 *
 * Color education level 2: blue = you / violet = the agents. The split reads at
 * arm's length: BOTH halves carry their territory color at rest (M6 / tell #8),
 * not only when active.
 *
 * Equal-width segments (grid, not lopsided flex) so the control reads as a real
 * symmetric toggle, never a stretched bar with a chip jammed left (blog-studio P1-3).
 *
 * Left "Run it myself" (blue = you):
 *   ACTIVE   → blue #3370FF solid fill + white text (you drive)
 *   INACTIVE → faint accent-tint ground + #4B5563 text (you-territory at rest)
 *
 * Right "Let Beamix handle it" (violet = agents):
 *   ACTIVE   → violet-tint #EEEAFD fill + violet #6E56F0 inset ring + ink text
 *   INACTIVE → very-faint violet ground + violet dot (agent-territory at rest)
 *   (VIOLET IS NEVER A SOLID BUTTON — tint + ring only)
 *
 * ~40px height, rounded-lg, content-width pill (left-anchored by the parent).
 */
export function ModeToggle({
  mode,
  onChange,
  allotmentLabel,
  uncapped = false,
  disabled = false,
}: ModeToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* The pill — equal-width segments via a 2-col grid, content-sized overall */}
      <div
        className={cn(
          'grid w-fit grid-cols-2 gap-0.5 rounded-lg border border-[#E5E7EB] bg-[#F4F6FA] p-0.5',
          disabled && 'pointer-events-none opacity-50',
        )}
        role="group"
        aria-label="Who runs this task"
      >
        {/* Left segment — "Run it myself" (blue = you) */}
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'myself'}
          disabled={disabled}
          onClick={() => onChange('myself')}
          className={cn(
            'flex min-h-[36px] items-center justify-center gap-2 rounded-md px-4 py-1.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
            mode === 'myself'
              ? 'bg-[#3370FF] text-white shadow-sm'
              // you-territory at rest: faint accent ground so the split reads, not a flat grey segment
              : 'bg-[#EEF2FF]/60 text-[#4B5563] hover:bg-[#EEF2FF] hover:text-[#0A0A0A]',
          )}
        >
          Run it myself
        </button>

        {/* Right segment — "Let Beamix handle it" (violet = agents) */}
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'beamix'}
          disabled={disabled}
          onClick={() => onChange('beamix')}
          className={cn(
            'flex min-h-[36px] items-center justify-center gap-2 rounded-md px-4 py-1.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-1',
            mode === 'beamix'
              // violet-tint fill + violet inset ring (NEVER a solid violet button)
              ? 'bg-[#EEEAFD] text-[#0A0A0A] ring-1 ring-inset ring-[#6E56F0]'
              // agent-territory at rest: very-faint violet ground + violet dot so the agent half is glanceable
              : 'bg-[#EEEAFD]/45 text-[#4B5563] hover:bg-[#EEEAFD] hover:text-[#0A0A0A]',
          )}
        >
          {/* Violet status dot — marks this as agent territory even when inactive (M6) */}
          <span
            aria-hidden
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
              mode === 'beamix' ? 'bg-[#6E56F0]' : 'bg-[#6E56F0]/55',
            )}
          />
          Let Beamix handle it
        </button>
      </div>

      {/* Contextual allotment explainer — only shown when beamix mode is active */}
      {mode === 'beamix' && (allotmentLabel || uncapped) && (
        <p className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
          {uncapped ? 'uncapped · concierge' : allotmentLabel}
        </p>
      )}
    </div>
  )
}
