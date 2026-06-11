'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DeltaTrioBadge } from './DeltaTrioBadge'
import type { WeeklyDigest } from '@/types/digest'

interface DigestRowProps {
  digest: WeeklyDigest
  isSelected: boolean
  isExpanded: boolean
  isMobile: boolean
  onSelect: (id: string, triggerEl?: HTMLElement) => void
}

/**
 * DigestRow — the list row button.
 *
 * Desktop (≥1024px): click opens slide-over panel. Selected row gets left
 * blue 2px rail + bg-accent-tint.
 *
 * Mobile (<1024px): click expands in-place accordion. Chevron rotates.
 *
 * Layout (left→right, vertically centered, never wraps):
 *  1. Date stamp: "Week of Jun 8" Inter 14px medium + year/relative 12px muted
 *  2. Headline excerpt: Inter 14px #374151 flex-1 truncate
 *  3. Delta trio: DeltaTrioBadge (3 chips desktop / 1 net mobile)
 *  4. Win count: Geist Mono 12px #6B7280
 *  5. Reviewed pill: bg-status-agent/text-status-agent when approvals > 0
 *  6. Chevron icon (mobile only)
 */
export function DigestRow({
  digest,
  isSelected,
  isExpanded,
  isMobile,
  onSelect,
}: DigestRowProps) {
  const approvalCount = digest.digest.resolvedApprovals.length
  const winCount = digest.digest.wins.length

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect(digest.id, e.currentTarget)
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
        'hover:bg-[#F4F6FA]',
        isSelected && !isMobile && 'bg-accent-tint',
      )}
      aria-expanded={isMobile ? isExpanded : undefined}
      aria-selected={!isMobile ? isSelected : undefined}
      onClick={handleClick}
    >
      {/* Left blue rail — selected state (desktop only) */}
      {isSelected && !isMobile && (
        <span
          className="absolute left-0 top-0 h-full w-0.5 bg-[#3370FF] rounded-r-full"
          aria-hidden="true"
        />
      )}

      {/* Date stamp */}
      <div className="w-24 shrink-0 text-left">
        <p className="text-[14px] font-medium leading-snug text-[#0A0A0A]">
          {digest.weekLabel}
        </p>
        <p className="mt-0.5 font-mono text-[12px] text-[#6B7280] tabular-nums">
          {digest.weekRelative}
        </p>
      </div>

      {/* Headline excerpt */}
      <p className="min-w-0 flex-1 truncate text-[14px] text-[#374151]">
        {digest.digest.headline}
      </p>

      {/* Delta trio — compact on mobile */}
      <div className="shrink-0">
        {isMobile ? (
          <DeltaTrioBadge deltas={digest.digest.engineDeltas} compact />
        ) : (
          <DeltaTrioBadge deltas={digest.digest.engineDeltas} />
        )}
      </div>

      {/* Win count */}
      <span className="shrink-0 font-mono text-[12px] text-[#6B7280] tabular-nums">
        {winCount} win{winCount !== 1 ? 's' : ''}
      </span>

      {/* Reviewed pill — violet, agent work signal */}
      {approvalCount > 0 && (
        <span
          className="shrink-0 rounded-full bg-status-agent px-2 py-0.5 text-[11px] font-medium text-status-agent"
          aria-label={`${approvalCount} reviewed`}
        >
          {approvalCount} reviewed
        </span>
      )}

      {/* Chevron — mobile accordion indicator */}
      {isMobile && (
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200',
            isExpanded && 'rotate-90',
          )}
          aria-hidden="true"
        />
      )}
    </button>
  )
}
