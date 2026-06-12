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
 * RunControl — "who runs this → go" as ONE clustered spatial unit
 * (CONSOLE-SPINE-DIRECTION.md §A Zone 3).
 *
 * The toggle and its consequent action share a single enclosure on a recede
 * ground (`.card-inset`) with a TIGHT internal gap, so "who runs this → go"
 * reads as one object — not two disconnected rows separated by a generic gap
 * (tell #5 / M1 / M12). The run button is sized to its content and
 * left-anchored — never a full-bleed #3370FF slab (tell #5; prompts P1-4,
 * blog-studio P2-4).
 *
 *   mode=myself + enabled      → content-width blue Run button
 *   mode=myself + cap-exhausted→ disabled Run + quiet routing toward beamix mode
 *   mode=myself + tier-locked  → tier-locked button + lockedTierCta upgrade link
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
    // Single enclosure: toggle + action clustered on one recede ground (M1/M12).
    // Wraps to a column only when the row can't fit (mobile); left-anchored throughout.
    <div className="card-inset flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <ModeToggle
        mode={mode}
        onChange={onModeChange}
        allotmentLabel={allotmentLabel}
        uncapped={uncapped}
      />

      {/* Consequence: what happens when you press go — left-anchored, content-sized */}
      {mode === 'myself' ? (
        runState === 'tier-locked' ? (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <Button
              variant="tier-locked"
              size="default"
              disabled
              aria-label="Upgrade to unlock this tool"
            >
              {runLabel}
            </Button>
            {lockedTierCta && <div className="text-[13px]">{lockedTierCta}</div>}
          </div>
        ) : runState === 'cap-exhausted' ? (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
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
            className="self-start sm:self-auto"
          >
            {runLabel}
          </Button>
        )
      ) : (
        // beamix mode — schedule link replaces the run button (agent territory)
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Link
            href={scheduleHref}
            className="inline-flex items-center text-[13px] font-medium text-[#6E56F0] transition-colors hover:text-[#5a45d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-1"
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
