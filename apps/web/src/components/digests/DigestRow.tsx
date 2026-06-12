'use client'

import Link from 'next/link'
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
 * DigestRow — the list row.
 *
 * Links to /digests/[digest.id] for the full detail view. Preserves the
 * panel/accordion interaction for the in-page preview (desktop slide-over,
 * mobile accordion).
 *
 * Desktop (≥1024px): Link row; click opens slide-over panel + navigates on
 * direct visit to the detail URL.
 *
 * Mobile (<1024px): Link row navigates to detail page. The accordion is still
 * available via the onSelect handler for the preview panel.
 *
 * Layout (left→right, vertically centered, never wraps):
 *  1. Date stamp: "Week of Jun 8" Inter 14px medium + year/relative 12px muted
 *  2. Headline excerpt: Inter 14px #374151 flex-1 truncate
 *  3. Delta trio: DeltaTrioBadge (3 chips desktop / 1 net mobile)
 *  4. Win count: Geist Mono 12px #6B7280
 *  5. Reviewed pill: bg-status-agent/text-status-agent when approvals > 0
 *  6. Chevron icon
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

  return (
    <Link
      href={`/digests/${digest.id}`}
      className={cn(
        'relative flex w-full items-start gap-4 px-5 py-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
        'hover:bg-[#F4F6FA]',
        isSelected && !isMobile && 'bg-accent-tint',
      )}
      aria-current={isSelected ? 'page' : undefined}
      onClick={(e) => {
        // On mobile, toggle the inline preview without navigating — use button fallback behavior.
        // On desktop, let the link navigate to the detail page.
        if (isMobile) {
          e.preventDefault()
          onSelect(digest.id, e.currentTarget as HTMLElement)
        }
      }}
    >
      {/* Left blue rail — selected state (desktop only) */}
      {isSelected && !isMobile && (
        <span
          className="absolute left-0 top-0 h-full w-0.5 bg-[#3370FF] rounded-r-full"
          aria-hidden="true"
        />
      )}

      {/* Date stamp — relative label is prose (Inter), week label medium ink */}
      <div className="w-[6.5rem] shrink-0 text-left">
        <p className="text-[13px] font-medium leading-snug text-[#0A0A0A]">
          {digest.weekLabel}
        </p>
        <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{digest.weekRelative}</p>
      </div>

      {/*
       * Verdict — the content, and the dominant row element (audit #1/#9).
       * Two-line clamp (never single-line truncate to nonsense). Ink #0A0A0A.
       */}
      <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-[#0A0A0A] line-clamp-2">
        {digest.digest.headline}
      </p>

      {/* Delta trio — secondary metric, fixed right column */}
      <div className="hidden shrink-0 sm:block">
        {isMobile ? (
          <DeltaTrioBadge deltas={digest.digest.engineDeltas} compact />
        ) : (
          <DeltaTrioBadge deltas={digest.digest.engineDeltas} />
        )}
      </div>

      {/* TIER-3 metadata column — quiet, right-aligned, demoted under the verdict */}
      <div className="flex w-[5.5rem] shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[12px] text-[#9CA3AF] tabular-nums">
          {winCount} win{winCount !== 1 ? 's' : ''}
        </span>
        {approvalCount > 0 && (
          <span
            className="rounded-full bg-status-agent px-1.5 py-0.5 text-[11px] font-medium text-status-agent"
            aria-label={`${approvalCount} reviewed`}
          >
            {approvalCount} reviewed
          </span>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight
        className={cn(
          'h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200',
          isExpanded && isMobile && 'rotate-90',
        )}
        aria-hidden="true"
      />
    </Link>
  )
}
