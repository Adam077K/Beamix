'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StageState } from './pipeline-contract'

interface StageRowProps {
  stage: StageState
  isLast: boolean
}

/**
 * StageRow — a single pipeline ledger row.
 *
 * Mirrors EngineRow from the scan ledger, with blue recolored to violet.
 * Hairline border-b dividers, NO per-row card boxes (anti-generic #4).
 *
 * DONE   → filled VIOLET #6E56F0 check circle
 * ACTIVE → spinning violet ring (border-t-[#6E56F0]) + live mono substep + scan-shimmer
 * QUEUED → hollow grey ring, dimmed text
 * ERROR  → "couldn't reach {label}"
 *
 * M6 Violet Structure: violet glyphs only — the rows themselves are neutral.
 * Violet NEVER on a button.
 */
export function StageRow({ stage, isLast }: StageRowProps) {
  const isDone = stage.status === 'done'
  const isActive = stage.status === 'active'
  const isQueued = stage.status === 'queued'
  const isError = stage.status === 'error'

  return (
    <div
      className={cn(
        'flex items-center py-4',
        !isLast && 'border-b border-[rgba(110,86,240,0.12)]',
      )}
    >
      {/* State glyph — 18px */}
      <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        {isDone && (
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#6E56F0]">
            <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
        )}
        {isActive && (
          <span
            className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-[#6E56F0]/20 border-t-[#6E56F0] motion-safe:animate-[scan-spin_0.7s_linear_infinite]"
            style={{ willChange: 'transform' }}
            aria-hidden="true"
          />
        )}
        {(isQueued || isError) && (
          <span className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-[#E5E7EB]" />
        )}
      </div>

      {/* Stage label */}
      <span
        className={cn(
          'ml-3 text-[15px] font-medium transition-colors duration-200',
          isQueued ? 'text-[#9CA3AF]' : 'text-[#0A0A0A]',
        )}
      >
        {stage.label}
      </span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Right: substep or status (mono, tabular) */}
      <div className="flex items-center gap-2 font-[var(--font-mono)] tabular-nums">
        {isDone && (
          <span className="text-[12px] tracking-[0.04em] text-[#6B7280]">done</span>
        )}
        {isActive && (
          <span
            className="scan-count-shimmer max-w-[200px] truncate text-[13px] text-[#6E56F0] motion-safe:animate-[scan-shimmer_1.5s_ease-in-out_infinite]"
            title={stage.substep ?? undefined}
          >
            {stage.substep ?? 'working…'}
          </span>
        )}
        {isQueued && (
          <span className="text-[12px] tracking-[0.04em] text-[#9CA3AF]">queued</span>
        )}
        {isError && (
          <span className="text-[12px] tracking-[0.04em] text-[#9CA3AF]">
            couldn&apos;t reach {stage.label}
          </span>
        )}
      </div>
    </div>
  )
}
