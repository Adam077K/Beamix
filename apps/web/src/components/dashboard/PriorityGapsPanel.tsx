/**
 * PriorityGapsPanel — Presentational dashboard panel for the user's top priority gaps.
 *
 * Accepts pre-loaded RankedGap[] (real or demo). Renders the lift vs. hygiene split
 * using the same GapRow format as the /scan/[scan_id] ScanV2View.
 *
 * Design tokens match the existing dashboard card system (card-console, --color-*).
 * Honesty contract is inherited from the RankedGap shape: contrastive_evidence is
 * rendered verbatim, ordering_mode==='impact_fallback' gets a note.
 */

import type { RankedGap } from '@/lib/scan/gap-types'
import {
  splitLiftVsHygiene,
  fixabilityLabel,
  playbookLabel,
} from '@/app/scan/[scan_id]/_components/scan-v2-format'

// ---------------------------------------------------------------------------
// Status pill (local — matches ScanV2View's StatusPill)
// ---------------------------------------------------------------------------

type PillVariant = 'info' | 'warning' | 'positive' | 'neutral' | 'agent' | 'critical'

function StatusPill({ label, variant }: { label: string; variant: PillVariant }) {
  const styles: Record<PillVariant, string> = {
    info: 'text-[var(--color-status-info)] bg-[var(--color-status-info-bg)]',
    warning: 'text-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)]',
    positive: 'text-[var(--color-status-positive)] bg-[var(--color-status-positive-bg)]',
    neutral: 'text-[var(--color-status-neutral)] bg-[var(--color-status-neutral-bg)]',
    agent: 'text-[var(--color-status-agent)] bg-[var(--color-status-agent-bg)]',
    critical: 'text-[var(--color-status-critical)] bg-[var(--color-status-critical-bg)]',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${styles[variant]}`}
    >
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Eyebrow label — consistent with ScanV2View
// ---------------------------------------------------------------------------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// GapRow — mirrors GapRow in ScanV2View (uses same scan-v2-format helpers)
// ---------------------------------------------------------------------------

interface GapRowProps {
  gap: RankedGap
  isHygiene: boolean
}

function GapRow({ gap, isHygiene }: GapRowProps) {
  const fixLabel = fixabilityLabel(gap.fixability)
  const playbookChip = playbookLabel(gap.playbook_id)

  const fixColor =
    gap.fixability === 'fast'
      ? 'text-[var(--color-status-positive)] bg-[var(--color-status-positive-bg)]'
      : gap.fixability === 'medium'
      ? 'text-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)]'
      : 'text-[var(--color-status-neutral)] bg-[var(--color-status-neutral-bg)]'

  return (
    <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-start sm:gap-4">
      {/* Rank number */}
      <span
        className="shrink-0 font-mono text-[13px] font-medium text-[var(--color-text-disabled)] sm:pt-0.5 sm:w-5 sm:text-right"
        aria-hidden="true"
      >
        {gap.rank}.
      </span>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Name + chips row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            {gap.display_name}
          </span>
          {isHygiene && <StatusPill label="Hygiene" variant="neutral" />}
          {playbookChip && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none text-[var(--color-status-agent)] bg-[var(--color-status-agent-bg)]"
              aria-label={`Agent: ${playbookChip}`}
            >
              {playbookChip}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${fixColor}`}
          >
            {fixLabel}
          </span>
        </div>

        {/* Contrastive evidence — verbatim FACT-class sentence */}
        <p className="text-[14px] leading-[1.5] text-[var(--color-text-muted)]">
          {gap.contrastive_evidence}
        </p>
        {/* Impact fallback note is shown once in the panel header, not per-row */}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PriorityGapsPanel — main export
// ---------------------------------------------------------------------------

export interface PriorityGapsPanelProps {
  gaps: RankedGap[]
}

/**
 * Dashboard panel showing the user's top priority gaps.
 *
 * Empty state: shown when gaps.length === 0.
 * Lift vs. hygiene split: mirrors GapListSection in ScanV2View.
 * Impact fallback hint: shown when any gap has ordering_mode === 'impact_fallback'.
 */
export function PriorityGapsPanel({ gaps }: PriorityGapsPanelProps) {
  if (gaps.length === 0) {
    return (
      <div className="card-console overflow-hidden" aria-label="Priority gaps">
        <div className="border-b border-[var(--color-border)] px-6 py-3">
          <Eyebrow>Priority gaps</Eyebrow>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-[15px] text-[var(--color-text-muted)]">
            No priority gaps yet — run a scan to see what your competitors have that you don&apos;t.
          </p>
        </div>
      </div>
    )
  }

  const { lift, hygiene } = splitLiftVsHygiene(gaps)

  // Show the impact-fallback hint if any gap uses that ordering mode
  const hasImpactFallback = gaps.some((g) => g.ordering_mode === 'impact_fallback')

  return (
    <div className="card-console overflow-hidden" aria-label="Priority gaps">
      <div className="border-b border-[var(--color-border)] px-6 py-3 flex items-baseline justify-between gap-3">
        <Eyebrow>Priority gaps</Eyebrow>
        <div className="flex items-center gap-3">
          {hasImpactFallback && (
            <span className="text-[12px] text-[var(--color-text-disabled)] italic">
              Ordered by impact (no competitor comparison this scan)
            </span>
          )}
          <span className="font-mono text-[12px] text-[var(--color-text-muted)]">
            {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Lift section */}
      {lift.length > 0 && (
        <>
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-warm)] px-6 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
              Competitive gaps · ranked by competitor comparison
            </p>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {lift.map((gap) => (
              <GapRow key={gap.factor_key} gap={gap} isHygiene={false} />
            ))}
          </div>
        </>
      )}

      {/* Hygiene section */}
      {hygiene.length > 0 && (
        <>
          <div
            className={`border-b border-[var(--color-border)] bg-[var(--color-surface-warm)] px-6 py-2 ${lift.length > 0 ? 'border-t' : ''}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
              Hygiene items · not a ranking lever
            </p>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {hygiene.map((gap) => (
              <GapRow key={gap.factor_key} gap={gap} isHygiene={true} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
