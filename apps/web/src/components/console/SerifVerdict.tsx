import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SerifVerdictSize = 'inline' | 'beat'

interface SerifVerdictProps {
  /** The single Fraunces italic verdict word, e.g. "Excellent" or "climbing". */
  children: ReactNode
  /**
   * Visual weight of the beat:
   *  - "beat"   (default) — the one felt editorial moment: STEP-2 weight,
   *    ~1.15em over the surrounding sans, near-black ink so it reads as
   *    intentional, not body-grey 16px.
   *  - "inline" — a quieter beat that matches the surrounding run-size but keeps
   *    the serif + ink contrast (use only where a 30px-ish word would break the line).
   */
  size?: SerifVerdictSize
  className?: string
}

/**
 * SerifVerdict — M5 serif beat, one per screen (CRAFT-SYSTEM tell #6).
 *
 * Wraps exactly ONE Fraunces italic word inside a sans sentence — the verdict
 * word only. E.g.:
 *   <p>Your visibility is <SerifVerdict>climbing</SerifVerdict>.</p>
 *
 * Contract (enforced by this component, audited by design-critic):
 *  - Italic applies to the VERDICT WORD only. Never wrap chrome (nav, labels,
 *    table rows, buttons) — Fraunces in chrome is tell #6, not the beat.
 *  - The beat must be FELT: it carries its own ink (#0A0A0A near-black) and a
 *    size bump so it does not melt into 16px body grey. Don't strip these by
 *    forcing `text-inherit` from a muted parent.
 *  - Exactly one beat per screen. DESIGN-VISION.md §4: "Serif — disciplined."
 */
export function SerifVerdict({ children, size = 'beat', className }: SerifVerdictProps) {
  return (
    <em
      className={cn(
        // Fraunces, genuinely italic, near-black ink so the beat is felt.
        'font-[var(--font-serif)] italic text-[#0A0A0A]',
        size === 'beat' && 'text-[1.15em] leading-none tracking-[-0.01em]',
        className,
      )}
      // Belt-and-braces: guarantee italic even if a utility resets font-style.
      style={{ fontStyle: 'italic' }}
    >
      {children}
    </em>
  )
}
