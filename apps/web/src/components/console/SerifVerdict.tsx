import type { ReactNode } from 'react'

interface SerifVerdictProps {
  /** The single italic Fraunces word, e.g. "Excellent" or "Critical" */
  children: ReactNode
}

/**
 * SerifVerdict — M5 Serif beat (one per screen).
 *
 * Wraps exactly ONE Fraunces italic word. Used inline within a sans sentence,
 * never standalone. E.g.:
 *   <p>Your visibility is <SerifVerdict>climbing</SerifVerdict>.</p>
 *
 * Fraunces is ONLY for this editorial moment. Never in nav, cards, tables,
 * or forms. DESIGN-VISION.md §4: "Serif — disciplined expansion."
 */
export function SerifVerdict({ children }: SerifVerdictProps) {
  return (
    <em
      className="not-italic font-[var(--font-serif)] italic text-inherit"
      style={{ fontStyle: 'italic' }}
    >
      {children}
    </em>
  )
}
