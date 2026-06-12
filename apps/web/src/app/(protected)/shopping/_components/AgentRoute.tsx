'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AgentRoute — the violet GHOST affordance that routes work to the agents.
 *
 * The single most important spatial execution of blue=you / violet=agents in the
 * product: the DATA is yours (neutral / blue), the FIX is the agents' (violet).
 *
 * Hard rules (DESIGN-VISION §3, beamix-brand-quality-bar):
 *   - Violet #6E56F0 is the agent semantic. It NEVER becomes a solid button.
 *   - This affordance is a tint-fill / underline-on-hover ghost ONLY.
 *   - One shared component so the agent-route fingerprint is identical
 *     everywhere it appears (correctness matrix, drill drawer).
 *
 * Variants:
 *   - "inline"  → compact text+icon affordance used inside a critical-tint cell
 *   - "block"   → a wider tinted-ground ghost row (drill drawer footer)
 */

interface AgentRouteProps {
  href: string
  children: React.ReactNode
  /** Accessible label, e.g. "Correct the Whitening Kit Pro price with an agent" */
  ariaLabel: string
  variant?: 'inline' | 'block'
  className?: string
}

export function AgentRoute({
  href,
  children,
  ariaLabel,
  variant = 'inline',
  className,
}: AgentRouteProps) {
  if (variant === 'block') {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          // tinted violet ground, violet hairline, NEVER a solid fill
          'group inline-flex w-full items-center justify-between gap-2 rounded-lg px-3.5 py-2.5',
          'bg-[#EEEAFD] text-[13px] font-medium text-[#6E56F0]',
          'ring-1 ring-inset ring-[rgba(110,86,240,0.16)]',
          'transition-colors hover:bg-[#E4DDFB]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-1',
          className,
        )}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E56F0]"
            aria-hidden="true"
          />
          {children}
        </span>
        <ArrowUpRight
          className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
          strokeWidth={2}
        />
      </Link>
    )
  }

  // inline ghost — underline-on-hover violet text, lives inside critical cells
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        'group inline-flex items-center gap-1 text-[12px] font-medium text-[#6E56F0]',
        'underline-offset-2 decoration-[rgba(110,86,240,0.35)]',
        'transition-colors hover:text-[#5a44d6] hover:underline',
        'focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-1',
        className,
      )}
    >
      {children}
      <ArrowUpRight
        className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
        strokeWidth={2}
      />
    </Link>
  )
}
