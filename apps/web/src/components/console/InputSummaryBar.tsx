'use client'

import { cn } from '@/lib/utils'

interface InputSummaryBarProps {
  /** One-line summary of the collapsed inputs, e.g. "3 pages · ChatGPT, Gemini" */
  summary: string
  /** Called when the user clicks "Change inputs" to re-expand the input panel */
  onExpand: () => void
  className?: string
}

/**
 * InputSummaryBar — TIER-3 44px collapsed input panel.
 *
 * Shown after a successful run: the input panel auto-collapses to this bar.
 * ".card-inset" (surface-warm, 1px border, no shadow) — TIER-3 recede.
 * Mono for the summary detail; "Change inputs" is a quiet link.
 */
export function InputSummaryBar({ summary, onExpand, className }: InputSummaryBarProps) {
  return (
    <div
      className={cn(
        'card-inset flex min-h-[44px] items-center justify-between gap-4 px-4',
        className,
      )}
    >
      <span
        className="truncate font-[var(--font-mono)] text-[13px] tabular-nums text-[#6B7280]"
        title={summary}
      >
        {summary}
      </span>

      <button
        type="button"
        onClick={onExpand}
        className="shrink-0 text-[13px] font-medium text-[#3370FF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
      >
        Change inputs
      </button>
    </div>
  )
}
