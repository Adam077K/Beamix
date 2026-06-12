/**
 * market-colors — page-local color + label maps for /market, mirroring the
 * structure of analytics/engine-colors.ts so the rail swatch and the chart
 * series read as one instrument.
 *
 * Law (DESIGN-VISION §3): data-viz uses the desaturated data-1..6 band.
 * #3370FF (data-1) is the brand/your line. Competitors render as neutral greys.
 * Violet #6E56F0 is reserved for agent annotation ONLY — never an engine fill,
 * never a button.
 *
 * /market's primary scope dimension is REGION (not engine), with INTENT as the
 * injected topic group. The filter context stores region keys in `topics`.
 */

export const AGENT_VIOLET = '#6E56F0'

// ---------------------------------------------------------------------------
// Regions — the rail's primary scope dimension
// ---------------------------------------------------------------------------

export const REGION_ORDER = ['Israel', 'US', 'UK', 'Germany', 'Global'] as const
export type RegionKey = (typeof REGION_ORDER)[number]

/**
 * Region swatch colors — desaturated data band. 'Global' is the neutral
 * aggregate grey; the rest take distinct band colors so the volume chart's
 * region split reads cleanly.
 */
export const REGION_COLORS: Record<string, string> = {
  Israel: '#3370FF', // data-1 — brand blue (home market aggregate)
  US: '#06B6D4', // data-3 — cyan
  UK: '#10B981', // data-4 — green
  Germany: '#F59E0B', // data-5 — amber
  Global: '#9CA3AF', // neutral aggregate
}

/**
 * Map a fixture region string (e.g. "Ramat Gan, IL", "Gush Dan, IL") to its
 * top-level rail region key. The dental fixture is entirely Israel-based, so
 * any "…, IL" / Israel / Gush Dan string folds into 'Israel'.
 */
export function regionKeyFor(region: string): RegionKey {
  if (/\bIL\b|israel|gush dan|ramat gan/i.test(region)) return 'Israel'
  if (/\bUS\b|united states|usa/i.test(region)) return 'US'
  if (/\bUK\b|united kingdom|britain/i.test(region)) return 'UK'
  if (/germany|deutschland|\bDE\b/i.test(region)) return 'Germany'
  return 'Global'
}

// ---------------------------------------------------------------------------
// Intent — the injected topic group
// ---------------------------------------------------------------------------

export const INTENT_ORDER = ['informational', 'transactional', 'navigational'] as const
export type IntentKey = (typeof INTENT_ORDER)[number]

export const INTENT_LABELS: Record<IntentKey, string> = {
  informational: 'Informational',
  transactional: 'Transactional',
  navigational: 'Navigational',
}

/**
 * Intent pill colors — status tints (ground + saturated text). Always a tinted
 * ground, never a loud fill. Informational = info-blue, transactional =
 * positive-green (revenue intent), navigational = neutral.
 */
export const INTENT_PILL: Record<IntentKey, { bg: string; text: string }> = {
  informational: { bg: '#EEF2FF', text: '#3370FF' },
  transactional: { bg: '#E6F5EE', text: '#0E9E6E' },
  navigational: { bg: '#F3F4F6', text: '#6B7280' },
}

// ---------------------------------------------------------------------------
// Co-citation competitors — neutral greys (descending darkness = "the field")
// ---------------------------------------------------------------------------

export const COMPETITOR_GREYS: Record<string, string> = {
  'Smile Center': '#6B7280',
  'Dental Plus': '#9CA3AF',
  'PerfectSmile IL': '#B5B9C0',
  'Ramat Gan Dental': '#C4C8CF',
}

/** Format a large monthly volume figure with thousands separators. */
export function formatVolume(n: number): string {
  return n.toLocaleString('en-US')
}
