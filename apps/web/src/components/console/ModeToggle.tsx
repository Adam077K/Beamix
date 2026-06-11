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
 * Color education level 2: blue = you / violet = the agents.
 *
 * Left "Run it myself":
 *   ACTIVE → blue #3370FF solid fill + white text (you drive)
 *   INACTIVE → neutral bg + #6B7280 text
 *
 * Right "Let Beamix handle it":
 *   ACTIVE → violet-tint #EEEAFD fill + violet #6E56F0 inset ring + ink text
 *   (VIOLET IS NEVER A SOLID BUTTON — tint + ring only)
 *   INACTIVE → neutral bg + #6B7280 text
 *
 * ~40px height, rounded-lg, inline pill.
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
      {/* The pill */}
      <div
        className={cn(
          'inline-flex rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] p-0.5',
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
            'flex min-h-[36px] items-center rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
            mode === 'myself'
              ? 'bg-[#3370FF] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#0A0A0A]',
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
            'flex min-h-[36px] items-center rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-1',
            mode === 'beamix'
              // violet-tint fill + violet inset ring (NEVER a solid violet button)
              ? 'bg-[#EEEAFD] text-[#0A0A0A] ring-1 ring-inset ring-[#6E56F0]'
              : 'text-[#6B7280] hover:text-[#0A0A0A]',
          )}
        >
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
