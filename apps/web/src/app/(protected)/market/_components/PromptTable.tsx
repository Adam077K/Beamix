'use client'

import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketRowVisible } from './use-market-filter'
import { INTENT_PILL, INTENT_LABELS, formatVolume, type IntentKey } from './market-colors'
import type { MarketPromptRow } from '@/lib/demo/surfaces/types'

/**
 * PromptTable — THE centerpiece. The only ACTION-bearing analytics table in the
 * product.
 *
 * Columns: Prompt (Inter) · Volume (mono) · Region · Intent pill · Cited? ·
 * Track action.
 *
 * SIGNATURE MOMENT — the Track → Tracking flip:
 *   Each row carries a blue text-button "Track →" (#3370FF). On click it flips
 *   to a violet-tint status PILL "Tracking" (#EEEAFD bg / #6E56F0 text + Check)
 *   in a 200ms opacity swap, zero copy. User initiates (blue) → agent takes over
 *   (violet). Honors "violet never a button" — the post-click state is a status
 *   PILL, not a control. This sits inside the uncited amber row, exactly where
 *   the opportunity is most legible.
 *
 * UNCITED rows (cited === false) get a warm-amber row wash (status-warning-bg
 * #FDF3E0) + a neutral "Not cited" pill — the whitespace opportunity glanceable
 * by ground alone (no icon, no callout).
 *
 * Row hover #F4F6FA + left status-color hairline (M7). Rows dim to 40% when
 * their region/intent filter is off (linked-instrument). Row click (not on the
 * Track button) opens the drill drawer.
 */

interface PromptTableProps {
  prompts: MarketPromptRow[]
  onRowClick: (prompt: MarketPromptRow) => void
}

function IntentPill({ intent }: { intent: IntentKey }) {
  const { bg, text } = INTENT_PILL[intent]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {INTENT_LABELS[intent]}
    </span>
  )
}

function CitedCell({ cited }: { cited: boolean }) {
  if (cited) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-[#374151]">
        <Check className="h-3.5 w-3.5 text-[#0E9E6E]" strokeWidth={2} aria-hidden="true" />
        Cited
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-status-warning px-2 py-0.5 text-[11px] font-medium text-status-warning">
      Not cited
    </span>
  )
}

/**
 * TrackControl — the blue→violet flip. Local optimistic state seeds from the
 * fixture `tracked` flag; clicking flips to the violet "Tracking" status pill.
 */
function TrackControl({ initialTracked }: { initialTracked: boolean }) {
  const [tracking, setTracking] = useState(initialTracked)

  if (tracking) {
    // Post-state: a violet status PILL (not a control) — agent owns it now.
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium transition-opacity duration-200 ease-out"
        style={{ backgroundColor: '#EEEAFD', color: '#6E56F0' }}
        aria-label="An agent is tracking this prompt"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        Tracking
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setTracking(true)
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-medium text-[#3370FF] transition-colors duration-200 ease-out hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
      aria-label="Track this prompt — an agent will pursue it"
    >
      Track
      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
    </button>
  )
}

export function PromptTable({ prompts, onRowClick }: PromptTableProps) {
  const rowVisible = useMarketRowVisible()

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Prompt volume
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Every query in your category, ranked by monthly volume. Amber rows are the prompts nobody
          owns yet — your whitespace.
        </p>
      </div>

      {/* Header row */}
      <div className="hidden grid-cols-[minmax(0,1fr)_88px_140px_120px_96px_84px] gap-3 border-b border-[#E5E7EB] px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] sm:grid">
        <span>Prompt</span>
        <span className="text-right">Volume</span>
        <span>Region</span>
        <span>Intent</span>
        <span>Cited?</span>
        <span className="text-right">Track</span>
      </div>

      <ul>
        {prompts.map((p) => {
          const visible = rowVisible(p)
          const uncited = !p.cited
          return (
            <li
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => onRowClick(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick(p)
                }
              }}
              aria-label={`${p.query} — ${formatVolume(p.monthlyVolume)} monthly searches${
                uncited ? ', not cited' : ''
              }`}
              className={cn(
                'group relative grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-3 transition-opacity duration-200 ease-out sm:grid-cols-[minmax(0,1fr)_88px_140px_120px_96px_84px]',
                'hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                visible ? 'opacity-100' : 'opacity-40',
              )}
              style={uncited ? { backgroundColor: '#FDF3E0' } : undefined}
            >
              {/* Left hairline on hover (M7) */}
              <span
                className={cn(
                  'pointer-events-none absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                )}
                style={{ backgroundColor: uncited ? '#B8770B' : '#3370FF' }}
                aria-hidden="true"
              />

              {/* Prompt (Inter) */}
              <span className="min-w-0 truncate text-[14px] text-[#0A0A0A]">{p.query}</span>

              {/* Volume (mono) — right-aligned */}
              <span className="text-right font-mono text-[14px] tabular-nums text-[#374151] max-sm:hidden">
                {formatVolume(p.monthlyVolume)}
              </span>

              {/* Region */}
              <span className="truncate text-[13px] text-[#6B7280] max-sm:hidden">{p.region}</span>

              {/* Intent pill */}
              <span className="max-sm:hidden">
                <IntentPill intent={p.intent} />
              </span>

              {/* Cited? */}
              <span className="max-sm:hidden">
                <CitedCell cited={p.cited} />
              </span>

              {/* Track action — blue→violet flip */}
              <span className="flex justify-end">
                <TrackControl initialTracked={p.tracked} />
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
