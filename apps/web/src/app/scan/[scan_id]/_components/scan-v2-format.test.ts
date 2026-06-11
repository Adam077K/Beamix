/**
 * Tests for scan-v2-format.ts — pure formatting helpers.
 *
 * Follows the ring-math.test.ts pattern: import pure helpers, assert outputs.
 * No React rendering required — these are plain functions.
 */

import { describe, it, expect } from 'vitest'
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
import type { Band } from '@/lib/scan/measurement-types'
import type { RankedGap } from '@/lib/scan/gap-types'

// ---------------------------------------------------------------------------
// formatBand
// ---------------------------------------------------------------------------

describe('formatBand', () => {
  it('formats a band as "point (ci_low–ci_high)"', () => {
    const band: Band = { point: 27, ci_low: 22, ci_high: 31, sample_n: 6, low_confidence: false }
    expect(formatBand(band)).toBe('27 (22–31)')
  })

  it('rounds fractional point values', () => {
    const band: Band = { point: 27.4, ci_low: 22.1, ci_high: 31.9, sample_n: 6, low_confidence: false }
    expect(formatBand(band)).toBe('27 (22–32)')
  })

  it('handles zero band', () => {
    const band: Band = { point: 0, ci_low: 0, ci_high: 0, sample_n: 1, low_confidence: true }
    expect(formatBand(band)).toBe('0 (0–0)')
  })

  it('handles 100 point', () => {
    const band: Band = { point: 100, ci_low: 95, ci_high: 100, sample_n: 10, low_confidence: false }
    expect(formatBand(band)).toBe('100 (95–100)')
  })

  it('uses an en-dash between ci_low and ci_high', () => {
    const band: Band = { point: 50, ci_low: 40, ci_high: 60, sample_n: 8, low_confidence: false }
    // Must contain the en-dash character (–) not a hyphen (-)
    expect(formatBand(band)).toContain('–')
  })
})

// ---------------------------------------------------------------------------
// HEADLINE_BAND_LABEL
// ---------------------------------------------------------------------------

describe('HEADLINE_BAND_LABEL', () => {
  it('does not contain "your score"', () => {
    expect(HEADLINE_BAND_LABEL.toLowerCase()).not.toContain('your score')
  })

  it('indicates it is a median across engines', () => {
    expect(HEADLINE_BAND_LABEL.toLowerCase()).toContain('median')
  })
})

// ---------------------------------------------------------------------------
// splitLiftVsHygiene
// ---------------------------------------------------------------------------

function makeGap(overrides: Partial<RankedGap>): RankedGap {
  return {
    factor_key: 'test_factor',
    display_name: 'Test Factor',
    tier: 2,
    impact_weight: 0.5,
    playbook_id: null,
    promises_lift: true,
    contrastive_count: 1,
    competitors_with_factor: [],
    contrastive_evidence: 'Evidence here.',
    fixability: 'fast',
    effort_score: 1,
    rank: 1,
    ordering_mode: 'contrastive',
    ...overrides,
  }
}

describe('splitLiftVsHygiene', () => {
  it('separates lift gaps (promises_lift=true) from hygiene gaps (promises_lift=false)', () => {
    const gaps: RankedGap[] = [
      makeGap({ factor_key: 'a', promises_lift: true, rank: 1 }),
      makeGap({ factor_key: 'b', promises_lift: false, rank: 2 }),
      makeGap({ factor_key: 'c', promises_lift: true, rank: 3 }),
      makeGap({ factor_key: 'd', promises_lift: false, tier: 3, rank: 4 }),
    ]

    const { lift, hygiene } = splitLiftVsHygiene(gaps)
    expect(lift.map((g) => g.factor_key)).toEqual(['a', 'c'])
    expect(hygiene.map((g) => g.factor_key)).toEqual(['b', 'd'])
  })

  it('returns empty arrays for an empty gap list', () => {
    const { lift, hygiene } = splitLiftVsHygiene([])
    expect(lift).toHaveLength(0)
    expect(hygiene).toHaveLength(0)
  })

  it('all hygiene = all in hygiene bucket', () => {
    const gaps: RankedGap[] = [
      makeGap({ factor_key: 'a', promises_lift: false, tier: 3 }),
      makeGap({ factor_key: 'b', promises_lift: false, tier: 3 }),
    ]
    const { lift, hygiene } = splitLiftVsHygiene(gaps)
    expect(lift).toHaveLength(0)
    expect(hygiene).toHaveLength(2)
  })

  it('preserves original order within each group', () => {
    const gaps: RankedGap[] = [
      makeGap({ factor_key: 'a', promises_lift: true, rank: 1 }),
      makeGap({ factor_key: 'b', promises_lift: true, rank: 2 }),
      makeGap({ factor_key: 'c', promises_lift: false, rank: 3 }),
    ]
    const { lift } = splitLiftVsHygiene(gaps)
    expect(lift[0]!.factor_key).toBe('a')
    expect(lift[1]!.factor_key).toBe('b')
  })
})

// ---------------------------------------------------------------------------
// fixabilityLabel
// ---------------------------------------------------------------------------

describe('fixabilityLabel', () => {
  it('maps fast → "Quick fix"', () => {
    expect(fixabilityLabel('fast')).toBe('Quick fix')
  })

  it('maps medium → "Moderate"', () => {
    expect(fixabilityLabel('medium')).toBe('Moderate')
  })

  it('maps slow → "Long-term"', () => {
    expect(fixabilityLabel('slow')).toBe('Long-term')
  })
})

// ---------------------------------------------------------------------------
// playbookLabel
// ---------------------------------------------------------------------------

describe('playbookLabel', () => {
  it('returns null for null playbook_id', () => {
    expect(playbookLabel(null)).toBeNull()
  })

  it('maps known playbook IDs', () => {
    expect(playbookLabel('content_optimizer')).toBe('Content')
    expect(playbookLabel('schema_generator')).toBe('Schema')
    expect(playbookLabel('review_presence_planner')).toBe('Reviews')
    expect(playbookLabel('reddit_presence_planner')).toBe('Community')
  })

  it('returns the raw id for unknown playbook IDs (graceful fallback)', () => {
    expect(playbookLabel('unknown_future_agent')).toBe('unknown_future_agent')
  })
})

// ---------------------------------------------------------------------------
// engineLabel
// ---------------------------------------------------------------------------

describe('engineLabel', () => {
  it('maps chatgpt → "ChatGPT"', () => {
    expect(engineLabel('chatgpt')).toBe('ChatGPT')
  })

  it('maps gemini → "Gemini"', () => {
    expect(engineLabel('gemini')).toBe('Gemini')
  })

  it('maps perplexity → "Perplexity"', () => {
    expect(engineLabel('perplexity')).toBe('Perplexity')
  })
})

// ---------------------------------------------------------------------------
// formatPresence
// ---------------------------------------------------------------------------

describe('formatPresence', () => {
  it('formats 0 as "0%"', () => {
    expect(formatPresence(0)).toBe('0%')
  })

  it('formats 1 as "100%"', () => {
    expect(formatPresence(1)).toBe('100%')
  })

  it('formats 0.67 as "67%"', () => {
    expect(formatPresence(0.67)).toBe('67%')
  })

  it('rounds to nearest integer', () => {
    expect(formatPresence(0.334)).toBe('33%')
    expect(formatPresence(0.335)).toBe('34%')
  })
})

// ---------------------------------------------------------------------------
// formatPosition
// ---------------------------------------------------------------------------

describe('formatPosition', () => {
  it('returns "—" for null position', () => {
    expect(formatPosition(null)).toBe('—')
  })

  it('formats position as "#N"', () => {
    expect(formatPosition(3)).toBe('#3')
    expect(formatPosition(1)).toBe('#1')
  })

  it('rounds fractional positions', () => {
    expect(formatPosition(2.7)).toBe('#3')
  })
})
