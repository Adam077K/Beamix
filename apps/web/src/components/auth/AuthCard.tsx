import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  /** Small label above the heading — e.g. "Welcome back" */
  eyebrow: string
  /**
   * Card heading. Pass a ReactNode to embed the single Fraunces italic beat:
   *   <>Sign <em className="font-[var(--font-serif)] italic font-normal">in</em>.</>
   */
  heading: ReactNode
  /** Optional supporting sentence below the heading. */
  subheading?: string
  /** The form and any divider + OAuth button. */
  children: ReactNode
  /**
   * Cross-link footer rendered below the form.
   * Use Button variant=link for the actionable word.
   */
  footer: ReactNode
}

/**
 * AuthCard — presentational wrapper for all three auth screens.
 *
 * Card finish mirrors ScoreHeroPanel.PanelFrame exactly:
 *   - card-console-hero class (border + three-layer shadow + 16px radius)
 *   - linear-gradient(135deg, #FFFFFF → --color-surface-warm)
 *
 * Typography rhythm:
 *   eyebrow → heading → optional subheading → form (mt-8) → footer (mt-6)
 *
 * The Fraunces italic beat lives in `heading` (caller's responsibility);
 * this component never renders Fraunces itself.
 */
export function AuthCard({
  eyebrow,
  heading,
  subheading,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div
      className={cn('card-console-hero relative overflow-hidden')}
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="p-8">
        {/* Eyebrow */}
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {eyebrow}
        </p>

        {/* Heading — the InterDisplay beat + single Fraunces italic word */}
        <h1
          className="text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {heading}
        </h1>

        {/* Optional subheading */}
        {subheading && (
          <p className="mt-2 text-[15px] leading-[1.5] text-[#6B7280]">
            {subheading}
          </p>
        )}

        {/* Form area */}
        <div className="mt-8">{children}</div>

        {/* Footer cross-links */}
        <div className="mt-6 text-center text-[14px] text-[#6B7280]">
          {footer}
        </div>
      </div>
    </div>
  )
}
