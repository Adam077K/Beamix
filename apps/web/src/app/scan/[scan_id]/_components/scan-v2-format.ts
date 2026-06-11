/**
 * scan-v2-format.ts — Pure formatting helpers for the v2 scan result view.
 *
 * Extracted from JSX for testability. All functions are pure with no side effects.
 * No I/O, no React imports. Vitest-testable.
 *
 * HONESTY CONTRACT: these formatters render only what's in the data.
 * No invented numbers, no hypothesis language, no causal claims.
 */

import type { Band, EngineSubscore } from '@/lib/scan/measurement-types'
import type { RankedGap } from '@/lib/scan/gap-types'

// ---------------------------------------------------------------------------
// Band formatting
// ---------------------------------------------------------------------------

/**
 * Format a Band as "27 (22–31)".
 * The CI bounds are rounded to integers for legibility.
 * Used for headline band + per-engine sub-score bands.
 */
export function formatBand(band: Band): string {
  return `${Math.round(band.point)} (${Math.round(band.ci_low)}–${Math.round(band.ci_high)})`
}

/**
 * Returns the label prefix for the headline band per the honesty contract.
 * Never "your score" — always labeled as a secondary median value.
 */
export const HEADLINE_BAND_LABEL = 'Overall — median across engines'

// ---------------------------------------------------------------------------
// Lift / hygiene split
// ---------------------------------------------------------------------------

/**
 * Split a gap list into lift gaps (promises_lift = true) and hygiene gaps.
 * Preserves original rank order within each group.
 */
export function splitLiftVsHygiene(gaps: RankedGap[]): {
  lift: RankedGap[]
  hygiene: RankedGap[]
} {
  return {
    lift: gaps.filter((g) => g.promises_lift),
    hygiene: gaps.filter((g) => !g.promises_lift),
  }
}

// ---------------------------------------------------------------------------
// Fixability labels
// ---------------------------------------------------------------------------

const FIXABILITY_LABELS: Record<RankedGap['fixability'], string> = {
  fast: 'Quick fix',
  medium: 'Moderate',
  slow: 'Long-term',
}

export function fixabilityLabel(fixability: RankedGap['fixability']): string {
  return FIXABILITY_LABELS[fixability]
}

// ---------------------------------------------------------------------------
// Playbook chip labels
// ---------------------------------------------------------------------------

const PLAYBOOK_LABELS: Record<string, string> = {
  content_optimizer: 'Content',
  schema_generator: 'Schema',
  review_presence_planner: 'Reviews',
  reddit_presence_planner: 'Community',
}

export function playbookLabel(playbookId: string | null): string | null {
  if (!playbookId) return null
  return PLAYBOOK_LABELS[playbookId] ?? playbookId
}

// ---------------------------------------------------------------------------
// Engine display names
// ---------------------------------------------------------------------------

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

export function engineLabel(engine: EngineSubscore['engine']): string {
  return ENGINE_LABELS[engine] ?? engine
}

// ---------------------------------------------------------------------------
// Presence percent display
// ---------------------------------------------------------------------------

/**
 * Format a presence rate (0–1) as a percentage string: "67%"
 * Returns "0%" when undefined/null.
 */
export function formatPresence(presence: number): string {
  return `${Math.round(presence * 100)}%`
}

/**
 * Format avg position. Returns "—" when null (not mentioned in a ranked list).
 */
export function formatPosition(position: number | null): string {
  if (position === null) return '—'
  return `#${Math.round(position)}`
}
