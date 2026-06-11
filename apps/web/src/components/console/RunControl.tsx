'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle, type RunMode } from './ModeToggle'

export type RunState = 'enabled' | 'cap-exhausted' | 'tier-locked'

interface RunControlProps {
  mode: RunMode
  onModeChange: (mode: RunMode) => void
  onRun: () => void
  /** Button label. Default "Run" */
  runLabel?: string
  runState: RunState
  /** Allotment label e.g. "Beamix runs this weekly · 6 of 10 autonomous runs left" */
  allotmentLabel?: string
  uncapped?: boolean
  /** Href to the schedule configuration page (used in beamix mode) */
  scheduleHref?: string
  /** Upgrade CTA node for tier-locked state */
  lockedTierCta?: React.ReactNode
}

/**
 * RunControl — "who runs this → go" as one spatial unit (CONSOLE-SPINE-DIRECTION.md §A Zone 3).
 *
 * Renders ModeToggle above the consequent action:
 *   mode=myself + enabled      → blue Run button (Button variant=default)
 *   mode=myself + cap-exhausted→ disabled Run + quiet routing message toward beamix mode
 *   mode=myself + tier-locked  → Button variant=tier-locked + lockedTierCta upgrade link
 *   mode=beamix + any          → "Configure schedule →" link + allotment explainer
 *
 * Level 2 color education: blue = your action, violet = agent territory.
 */
export function RunControl({
  mode,
  onModeChange,
  onRun,
  runLabel = 'Run',
  runState,
  allotmentLabel,
  uncapped,
  scheduleHref = '/automation',
  lockedTierCta,
}: RunControlProps) {
  return (
    <div className="flex flex-col gap-4">
      <ModeToggle
        mode={mode}
        onChange={onModeChange}
        allotmentLabel={allotmentLabel}
        uncapped={uncapped}
      />

      {/* Consequence: what happens when you press go */}
      {mode === 'myself' ? (
        <div className="flex flex-col gap-2">
          {runState === 'tier-locked' ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="tier-locked"
                size="default"
                disabled
                aria-label="Upgrade to unlock this tool"
              >
                {runLabel}
              </Button>
              {lockedTierCta && (
                <div className="text-[13px]">{lockedTierCta}</div>
              )}
            </div>
          ) : runState === 'cap-exhausted' ? (
            <div className="flex flex-col gap-2">
              <Button variant="default" size="default" disabled aria-label="Daily cap reached">
                {runLabel}
              </Button>
              <p className="text-[13px] text-[#6B7280]">
                Daily cap reached.{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('beamix')}
                  className="font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
                >
                  Let Beamix handle it instead →
                </button>
              </p>
            </div>
          ) : (
            <Button
              variant="default"
              size="default"
              onClick={onRun}
              aria-label={runLabel}
            >
              {runLabel}
            </Button>
          )}
        </div>
      ) : (
        // beamix mode — schedule link replaces the run button
        <div className="flex flex-col gap-1.5">
          <Link
            href={scheduleHref}
            className="inline-flex items-center text-[13px] text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            Configure schedule →
          </Link>
          {allotmentLabel && !uncapped && (
            <p className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
              {allotmentLabel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
