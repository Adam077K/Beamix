'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * FilterChip — shared console filter-toggle primitive (CRAFT-SYSTEM tell #8).
 *
 * Kills the "wall of identical blue chips": every active filter used to fill
 * with `bg-[#EEF2FF] text-[#3370FF]`, so a rail of 5 engines read as one
 * undifferentiated blue block — the you-vs-data signal flattened into noise.
 *
 * The contract here:
 *  - Resting label ink is NEUTRAL — #374151 inactive, #0A0A0A active. The label
 *    never turns blue just because the chip is on.
 *  - The ground is TRANSPARENT. Active state is signalled by ink weight + the
 *    swatch, not by a blue fill behind every row.
 *  - The engine/bot COLOR is carried by the chip itself — either a ~10px round
 *    swatch (`swatch`) or a 3px colored left-edge bar (`edge`). That is what
 *    differentiates one active filter from the next.
 *  - Brand blue #3370FF appears ONLY on hover/focus (a faint #EEF2FF wash + the
 *    focus ring) — never as the resting fill of every active filter.
 *  - Inactive chips desaturate: the color drops to #D1D5DB so "off" reads at a
 *    glance without color noise.
 *
 * Used by AnalyticsScopeRail (engines), TrafficScopeRail (crawlers),
 * TopicFilterGroup, and PagePathFilterGroup.
 */

type ColorMarker = 'swatch' | 'edge' | 'none'

interface FilterChipProps {
  /** Visible label. Pass a styled node (e.g. mono path) when needed. */
  children: ReactNode
  /** Toggle state. Active = the filter is currently applied. */
  active: boolean
  onToggle: () => void
  /** Accessible label, e.g. "Toggle ChatGPT". */
  ariaLabel: string
  /**
   * The series color for this chip (engine/bot/topic). Carried by the swatch
   * or left-edge bar — NOT by the chip background. Omit for `none`.
   */
  color?: string
  /** How the color is expressed. Default "swatch". */
  marker?: ColorMarker
  className?: string
}

const INACTIVE_MARKER = '#D1D5DB'

export function FilterChip({
  children,
  active,
  onToggle,
  ariaLabel,
  color,
  marker = 'swatch',
  className,
}: FilterChipProps) {
  const markerColor = active ? color ?? '#9CA3AF' : INACTIVE_MARKER

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      data-active={active}
      className={cn(
        'group relative flex w-full items-center gap-2 rounded-md py-1.5 pr-2.5 text-sm transition-colors',
        // 3px edge bar lives in the left padding; swatch/none uses standard pad.
        marker === 'edge' ? 'pl-3.5' : 'pl-2.5',
        // Neutral resting ink — never blue. Active = darker ink, not a blue fill.
        active ? 'text-[#0A0A0A]' : 'text-[#374151]',
        // Blue belongs to interaction only: faint wash on hover, ring on focus.
        'hover:bg-[#EEF2FF] focus-visible:bg-[#EEF2FF]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
        // Inactive labels recede a touch more on idle.
        !active && 'hover:text-[#0A0A0A]',
        className,
      )}
    >
      {/* 3px colored left-edge bar — carries the series identity for `edge`. */}
      {marker === 'edge' && (
        <span
          className="absolute inset-y-1 left-0 w-[3px] rounded-full transition-colors"
          style={{ backgroundColor: markerColor }}
          aria-hidden="true"
        />
      )}

      {/* ~10px round swatch — the default series-color marker. */}
      {marker === 'swatch' && (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full transition-colors"
          style={{ backgroundColor: markerColor }}
          aria-hidden="true"
        />
      )}

      <span className="flex-1 truncate text-left">{children}</span>
    </button>
  )
}
