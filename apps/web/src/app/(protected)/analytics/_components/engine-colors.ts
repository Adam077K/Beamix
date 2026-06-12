/**
 * Engine swatch colors — MUST mirror AnalyticsScopeRail's ENGINE_COLORS so the
 * rail swatch and the chart series read as one instrument.
 *
 * Law (DESIGN-VISION §3 + brief): data-viz uses the desaturated data-1..6 band.
 * #3370FF (data-1) = the brand/aggregate line. Competitors render as neutral
 * greys (handled in the SoV chart). Violet #6E56F0 is reserved for agent
 * annotations ONLY — never an engine fill.
 */
export const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#3370FF', // data-1 — brand blue (aggregate)
  Gemini: '#06B6D4', // data-3 — cyan
  Perplexity: '#10B981', // data-4 — green
  Claude: '#F59E0B', // data-5 — amber
  'AI Overviews': '#EF4444', // data-6 — red
}

export const ENGINE_ORDER = [
  'ChatGPT',
  'Gemini',
  'Perplexity',
  'Claude',
  'AI Overviews',
] as const

/** Violet agent-annotation color — ReferenceLine + dot only. Never a fill. */
export const AGENT_VIOLET = '#6E56F0'

/**
 * Competitor greys — descending tints so the stacked SoV chart reads "you (blue)
 * vs. a field of neutral competitors". The leader is the darkest grey.
 */
export const COMPETITOR_GREYS: Record<string, string> = {
  'Smile Center': '#6B7280',
  'Dental Plus': '#9CA3AF',
  'Ramat Gan Dental': '#C4C8CF',
  Others: '#E0E2E7',
}

/** Format a weekly ISO date as a short axis tick: "May 12". */
export function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Score-band tint for the topic heatmap cell background (low-opacity ground). */
export function scoreBandTint(
  band: 'excellent' | 'good' | 'fair' | 'critical',
): { bg: string; text: string } {
  switch (band) {
    case 'excellent':
      return { bg: 'rgba(6,182,212,0.10)', text: '#0E7490' }
    case 'good':
      return { bg: 'rgba(16,185,129,0.10)', text: '#047857' }
    case 'fair':
      return { bg: 'rgba(245,158,11,0.12)', text: '#B45309' }
    case 'critical':
      return { bg: 'rgba(239,68,68,0.10)', text: '#B91C1C' }
  }
}
