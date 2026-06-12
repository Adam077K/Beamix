'use client'

import type { ComponentProps } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AgentRoute — the one violet ghost affordance that routes work to the Beamix
 * agents. The recognizable Beamix fingerprint across every surface: blue = you,
 * violet = the agents doing the work.
 *
 * M6 Violet Structure law: violet is NEVER a solid button and NEVER a link.
 * This renders as a ghost pill — violet text on a faint --color-agent-tint
 * ground (#EEEAFD) with a violet hairline, underline-on-hover. It signals
 * "the agents will handle this", not "you click a primary action".
 *
 * Used for: re-run audit, route-to-fix-agent, correct-attribute — one shape,
 * one meaning, everywhere.
 */
export function AgentRoute({
  children,
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full border border-[rgba(110,86,240,0.18)] bg-[#EEEAFD] px-3 py-1.5',
        'text-[13px] font-medium text-[#6E56F0] transition-colors',
        'hover:bg-[#E6E0FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56F0] focus-visible:ring-offset-1',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="underline-offset-2 group-hover:underline">{children}</span>
    </button>
  )
}
