/**
 * ScanV2View — the v2 richer measurement view for free scan results.
 *
 * Rendered when results.scan_v2 is present (flag-ON envs only for now).
 * v1 view (ScanScoreHero + EngineBand + IssueLedger) renders when scan_v2 is absent.
 *
 * HONESTY CONTRACT (non-negotiable):
 *   - headline_band is labeled "Overall — median across engines", never "your score"
 *   - low_confidence flag → "low confidence / small sample" badge shown
 *   - meta.degraded → non-alarming "limited data this scan" note
 *   - gap_list split: lift (promises_lift=true) vs hygiene (promises_lift=false)
 *   - Tier-3 / hygiene gaps labeled as hygiene, never framed as wins
 *   - contrastive_evidence rendered verbatim (FACT-class sentence — no causal additions)
 *   - ordering_mode === 'impact_fallback' → shown with note "ordered by impact (no competitor comparison this scan)"
 *   - competitors rendered if non-empty; omitted silently if empty
 *   - narration rendered as-is; narration.degraded → plain note
 *   - NO invented numbers, NO hypothesis language
 *
 * Design: warm-minimal, matches existing page tokens (card-console, --color-*,
 * --font-display, Geist Mono numerals, 8px grid, blue #3370FF accent only on CTAs/links).
 * Score colors are data-only per brand guidelines.
 */

import type { ScanV2Result } from '@/lib/scan/scan-v2-types'
import type { EngineSubscore, Band } from '@/lib/scan/measurement-types'
import type { RankedGap, CompetitorFactorAudit } from '@/lib/scan/gap-types'
import type { NarrationResult } from '@/lib/scan/narration'
import {
  formatBand,
  splitLiftVsHygiene,
  fixabilityLabel,
  playbookLabel,
  engineLabel,
  formatPresence,
  formatPosition,
  HEADLINE_BAND_LABEL,
} from './scan-v2-format'

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

/** Tinted pill badge — matches the status pill set from brand guidelines. */
function StatusPill({
  label,
  variant,
}: {
  label: string
  variant: 'info' | 'warning' | 'positive' | 'neutral' | 'agent' | 'critical'
}) {
  const styles: Record<typeof variant, string> = {
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

/** Eyebrow label — consistent 12px uppercase tracking pattern from the page. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Section: Headline band
// ---------------------------------------------------------------------------

interface HeadlineBandSectionProps {
  band: Band
  degraded: boolean
}

function HeadlineBandSection({ band, degraded }: HeadlineBandSectionProps) {
  return (
    <div className="card-console overflow-hidden">
      <div className="border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between gap-3">
        <Eyebrow>{HEADLINE_BAND_LABEL}</Eyebrow>
        <div className="flex items-center gap-2">
          {band.low_confidence && (
            <StatusPill label="Low confidence · small sample" variant="warning" />
          )}
          {degraded && (
            <StatusPill label="Limited data this scan" variant="neutral" />
          )}
        </div>
      </div>
      <div className="px-6 py-5 flex items-baseline gap-3">
        <span
          className="font-mono text-[36px] font-medium tabular-nums leading-none tracking-[-0.02em]"
          style={{ color: bandColor(band.point) }}
          aria-label={`Overall visibility band: ${formatBand(band)}`}
        >
          {formatBand(band)}
        </span>
        <span className="text-[13px] text-[var(--color-text-muted)]">
          / 100 · {band.sample_n} observation{band.sample_n !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section: Per-engine subscores
// ---------------------------------------------------------------------------

interface EngineSubscoreSectionProps {
  subscores: EngineSubscore[]
}

function bandColor(point: number): string {
  if (point >= 75) return 'var(--color-data-3)'
  if (point >= 50) return 'var(--color-data-4)'
  if (point >= 25) return 'var(--color-data-5)'
  return 'var(--color-data-6)'
}

function EngineSubscoreCell({ subscore }: { subscore: EngineSubscore }) {
  const { band, dimensions } = subscore
  const color = bandColor(band.point)

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 py-5">
      {/* Engine name */}
      <span className="text-[13px] font-semibold text-[var(--color-text-secondary)]">
        {engineLabel(subscore.engine)}
      </span>

      {/* Band */}
      <div>
        <span
          className="font-mono text-[22px] font-medium tabular-nums leading-none"
          style={{ color }}
          aria-label={`${engineLabel(subscore.engine)} band: ${formatBand(band)}`}
        >
          {formatBand(band)}
        </span>
        {band.low_confidence && (
          <span className="ml-2 text-[11px] text-[var(--color-status-warning)]">low confidence</span>
        )}
      </div>

      {/* Presence + position — the two most scannable data points */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-disabled)]">
            Presence
          </span>
          <span className="font-mono text-[14px] font-medium text-[var(--color-text-primary)]">
            {formatPresence(dimensions.presence)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-disabled)]">
            Avg position
          </span>
          <span className="font-mono text-[14px] font-medium text-[var(--color-text-primary)]">
            {formatPosition(dimensions.position)}
          </span>
        </div>
      </div>

      {/* Sample n */}
      <span className="text-[11px] text-[var(--color-text-disabled)] font-mono">
        n = {subscore.sample_n}
      </span>
    </div>
  )
}

function EngineSubscoreSection({ subscores }: EngineSubscoreSectionProps) {
  if (subscores.length === 0) {
    return (
      <div className="card-console overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-6 py-3">
          <Eyebrow>By engine</Eyebrow>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-[15px] text-[var(--color-text-muted)]">
            No per-engine data available for this scan.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-console overflow-hidden" aria-label="Per-engine visibility scores">
      <div className="border-b border-[var(--color-border)] px-6 py-3">
        <Eyebrow>By engine</Eyebrow>
      </div>
      <div className="flex flex-col divide-y divide-[var(--color-border)] sm:flex-row sm:divide-x sm:divide-y-0">
        {subscores.map((s) => (
          <EngineSubscoreCell key={s.engine} subscore={s} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section: Gap list (lift + hygiene)
// ---------------------------------------------------------------------------

interface GapRowProps {
  gap: RankedGap
  isHygiene: boolean
}

function GapRow({ gap, isHygiene }: GapRowProps) {
  const fixLabel = fixabilityLabel(gap.fixability)
  const playbookChip = playbookLabel(gap.playbook_id)
  const showImpactFallbackNote = gap.ordering_mode === 'impact_fallback'

  // Fixability color
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
          {isHygiene && (
            <StatusPill label="Hygiene" variant="neutral" />
          )}
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

        {/* Impact fallback note — only when ordering mode is degraded */}
        {showImpactFallbackNote && (
          <p className="mt-1 text-[12px] text-[var(--color-text-disabled)] italic">
            Ordered by impact (no competitor comparison this scan)
          </p>
        )}
      </div>
    </div>
  )
}

interface GapListSectionProps {
  gaps: RankedGap[]
}

function GapListSection({ gaps }: GapListSectionProps) {
  if (gaps.length === 0) {
    return (
      <div className="card-console overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-6 py-3">
          <Eyebrow>Priority gaps</Eyebrow>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-[15px] text-[var(--color-text-muted)]">
            No gaps detected in this scan.
          </p>
        </div>
      </div>
    )
  }

  const { lift, hygiene } = splitLiftVsHygiene(gaps)

  return (
    <div className="card-console overflow-hidden" aria-label="Priority gaps">
      <div className="border-b border-[var(--color-border)] px-6 py-3 flex items-baseline justify-between gap-3">
        <Eyebrow>Priority gaps</Eyebrow>
        <span className="font-mono text-[12px] text-[var(--color-text-muted)]">
          {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
        </span>
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

// ---------------------------------------------------------------------------
// Section: Competitors
// ---------------------------------------------------------------------------

interface CompetitorsSectionProps {
  competitors: CompetitorFactorAudit[]
}

function CompetitorsSection({ competitors }: CompetitorsSectionProps) {
  // If empty, this section is simply omitted by the parent — not rendered at all.
  return (
    <div className="card-console overflow-hidden" aria-label="Competitors identified in scan">
      <div className="border-b border-[var(--color-border)] px-6 py-3">
        <Eyebrow>Competitors in scan</Eyebrow>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {competitors.map((comp) => (
          <div key={comp.domain} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
                {comp.competitor_name}
              </span>
              <span className="font-mono text-[12px] text-[var(--color-text-muted)] truncate">
                {comp.domain}
              </span>
            </div>
            <span className="shrink-0 font-mono text-[12px] text-[var(--color-text-muted)]">
              {comp.observations.length} factor{comp.observations.length !== 1 ? 's' : ''} checked
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section: Narration
// ---------------------------------------------------------------------------

interface NarrationSectionProps {
  narration: NarrationResult
}

function NarrationSection({ narration }: NarrationSectionProps) {
  return (
    <div className="card-console overflow-hidden">
      <div className="border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between gap-3">
        <Eyebrow>What the scan found</Eyebrow>
        {narration.degraded && (
          <StatusPill label="Summary only · limited data" variant="neutral" />
        )}
      </div>
      <div className="px-6 py-5 space-y-4">
        {/* Summary */}
        <p className="text-[15px] leading-[1.6] text-[var(--color-text-primary)]">
          {narration.summary}
        </p>

        {/* Per-gap explanations — only if the narration provided them */}
        {narration.gap_explanations.length > 0 && (
          <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
            {narration.gap_explanations.map((expl) => (
              <div key={expl.factor_key} className="flex gap-3">
                <span
                  className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-disabled)] self-start translate-y-[6px]"
                  aria-hidden="true"
                />
                <p className="text-[14px] leading-[1.5] text-[var(--color-text-muted)]">
                  {expl.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export: ScanV2View
// ---------------------------------------------------------------------------

interface ScanV2ViewProps {
  v2: ScanV2Result
}

/**
 * Render the v2 richer measurement view.
 *
 * Section order:
 *   1. Headline band (labeled + CI + low_confidence/degraded badges)
 *   2. Per-engine subscores (chatgpt/gemini/perplexity bands + presence/position)
 *   3. Priority gap checklist (lift section then hygiene section)
 *   4. Competitors (only if non-empty)
 *   5. Narration
 *
 * All sections handle empty/null states gracefully.
 */
export function ScanV2View({ v2 }: ScanV2ViewProps) {
  const { engine_subscores, headline_band, gap_list, competitors, narration, meta } = v2

  return (
    <div className="space-y-6">
      {/* 1. Headline band */}
      <HeadlineBandSection band={headline_band} degraded={meta.degraded} />

      {/* 2. Per-engine subscores */}
      <EngineSubscoreSection subscores={engine_subscores} />

      {/* 3. Gap checklist */}
      <GapListSection gaps={gap_list} />

      {/* 4. Competitors — only when non-empty */}
      {competitors.length > 0 && (
        <CompetitorsSection competitors={competitors} />
      )}

      {/* 5. Narration */}
      <NarrationSection narration={narration} />
    </div>
  )
}
