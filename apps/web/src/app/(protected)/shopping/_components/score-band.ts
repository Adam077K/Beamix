/**
 * Score → band mapping for the Shopping surface.
 *
 * Mirrors the dashboard ScoreHeroPanel + EngineMicroSparkline band logic so the
 * whole product reads one consistent visibility language. Score colors are
 * data-viz ONLY (never buttons/links) per the brand bar.
 */

export type Band = 'excellent' | 'good' | 'fair' | 'critical'

export function bandOf(score: number): Band {
  if (score >= 75) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 25) return 'fair'
  return 'critical'
}

/** Fraunces verdict word for the hero beat (one per screen). */
export function bandWord(score: number): string {
  const b = bandOf(score)
  if (b === 'excellent') return 'Everywhere'
  if (b === 'good') return 'Often'
  if (b === 'fair') return 'Sometimes'
  return 'Rarely'
}

/** Score-band hex — data-viz series tokens only. */
export function bandColor(score: number): string {
  const b = bandOf(score)
  if (b === 'excellent') return '#06B6D4' // data-3 cyan
  if (b === 'good') return '#10B981' // data-4 green
  if (b === 'fair') return '#F59E0B' // data-5 amber
  return '#EF4444' // data-6 red
}
