import { describe, it, expect } from 'vitest'
import { CIRC, ringOffset } from './ring-math'

describe('ringOffset', () => {
  it('renders the correct arc at full draw under reduced motion (score 50 → half circle)', () => {
    // The reduced-motion path sets drawn = 1; offset must be CIRC/2, NOT squared.
    expect(ringOffset(50, 1)).toBeCloseTo(CIRC / 2, 6)
  })

  it('renders a quarter arc for score 75 at full draw', () => {
    expect(ringOffset(75, 1)).toBeCloseTo(CIRC * 0.25, 6)
  })

  it('is empty (full offset) at the start of the animation', () => {
    expect(ringOffset(50, 0)).toBeCloseTo(CIRC, 6)
  })

  it('does NOT square the fraction (regression: score 50 must not render 25%)', () => {
    // Squared bug would give CIRC - 0.25*CIRC = 0.75*CIRC. Correct is 0.5*CIRC.
    expect(ringOffset(50, 1)).not.toBeCloseTo(CIRC * 0.75, 6)
  })
})
