import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** Optional uppercase label that recedes above the title. */
  eyebrow?: string
  /** Page title. Rendered as the console-register H1. */
  title: string
  /** Optional calm caption beneath the title. */
  subtitle?: string
  /** Optional right-aligned slot — typically the primary CTA for the surface. */
  action?: ReactNode
  className?: string
}

/**
 * PageHeader — the single heading system for the Beamix console.
 *
 * Spec (DESIGN-DIRECTION §4.1):
 *  - H1: Inter (display voice), Medium, 30px (mobile 28px), -0.02em, leading-1.1, #0A0A0A
 *  - Subtitle: Inter 400, 15px, #6B7280, leading-1.5, max-w-[480px]
 *  - Eyebrow: Inter 600, 12px, uppercase, tracking-[0.08em], #9CA3AF
 *  - Gaps: eyebrow→H1 8px, H1→subtitle 8px, subtitle→content 32px (mb-8 on header)
 *
 * Body never drops below 16px on mobile (iOS zoom guard) — that rule lives in
 * page content, not the header; the H1 steps 30→28 which stays well above 16.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-[480px] text-[15px] font-normal leading-[1.5] text-[#6B7280]">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 sm:pt-1">{action}</div>}
    </header>
  )
}
