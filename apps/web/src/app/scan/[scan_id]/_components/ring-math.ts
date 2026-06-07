/**
 * Score-ring geometry for ScanScoreHero. Extracted as pure functions so the
 * stroke-dashoffset math is unit-testable independent of React.
 */
export const RING_SIZE = 200
export const STROKE = 14
export const RADIUS = (RING_SIZE - STROKE) / 2
export const CIRC = 2 * Math.PI * RADIUS

/**
 * strokeDashoffset for a score at animation progress `drawn` (0 → 1).
 * At full draw (drawn = 1) the arc fills exactly score/100 of the circle:
 *   offset = CIRC - (score/100) * CIRC
 * `drawn` must represent progress only — never the score fraction, or the
 * arc gets squared (the reduced-motion bug fixed here).
 */
export function ringOffset(score: number, drawn: number): number {
  return CIRC - drawn * (score / 100) * CIRC
}

export function ringColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)'
  if (score >= 50) return 'var(--color-data-4)'
  if (score >= 25) return 'var(--color-data-5)'
  return 'var(--color-data-6)'
}
