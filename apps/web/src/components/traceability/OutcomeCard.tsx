'use client'

import { ChevronDown } from 'lucide-react'
import type { Outcome } from '@/types/traceability'
import { EvidenceRow } from './EvidenceRow'
import { AttributionNote } from './AttributionNote'

interface OutcomeCardProps {
  outcome: Outcome
  expanded: boolean
  onToggle: () => void
}

/**
 * Formats an ISO date string to e.g. "May 28" — short, readable, no year noise.
 */
function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

/**
 * OutcomeCard — one outcome in the traceability list.
 *
 * Color laws:
 *  - Blue: delta pill (collapsed + terminal), verifiable links, CTAs
 *  - Violet: thread line, thread nodes, kind icons — NEVER a button or link
 *  - No green on this surface
 *
 * Motion: expand uses height transition via grid-rows trick (CSS-only);
 * chevron rotates; thread does NOT animate.
 * prefers-reduced-motion: content renders instantly, no transition.
 *
 * A11y:
 *  - header button: aria-expanded + aria-controls
 *  - expanded region: role="region" + aria-labelledby
 *  - thread + nodes: aria-hidden
 */

const panelId = (id: string) => `outcome-panel-${id}`
const headingId = (id: string) => `outcome-heading-${id}`

export function OutcomeCard({ outcome, expanded, onToggle }: OutcomeCardProps) {
  return (
    <div className="card-console overflow-hidden">
      {/* ── COLLAPSED HEADER ─────────────────────────────────── */}
      <button
        type="button"
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-inset"
        aria-expanded={expanded}
        aria-controls={panelId(outcome.id)}
        id={headingId(outcome.id)}
        onClick={onToggle}
      >
        {/* Statement — 2-line clamp on mobile, single-line truncate on sm+ */}
        <span className="min-w-0 flex-1 line-clamp-2 text-[15px] font-medium leading-snug text-[#0A0A0A] sm:line-clamp-1">
          {outcome.statement}
        </span>

        {/* Trailing cluster — shrinks, never wraps */}
        <span className="flex shrink-0 items-center gap-3">
          {/* Blue delta pill — the ONLY blue on the collapsed row */}
          <span className="rounded-full bg-status-info px-2.5 py-0.5 font-mono text-[12px] font-semibold tabular-nums text-status-info">
            +{outcome.deltaPoints} pt
          </span>

          {/* Date — mono, muted */}
          <span className="font-mono text-[12px] tabular-nums text-[#6B7280]">
            {shortDate(outcome.achievedAt)}
          </span>

          {/* Chevron — rotates on expand */}
          <ChevronDown
            className={`h-4 w-4 text-[#9CA3AF] transition-transform duration-200 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* ── EXPANDED PANEL ───────────────────────────────────── */}
      <div
        id={panelId(outcome.id)}
        role="region"
        aria-labelledby={headingId(outcome.id)}
        aria-label={outcome.statement}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#F3F4F6]">
            {/* ── LAYER 1: intro line ──────────────────────── */}
            <div className="px-5 pb-2 pt-4">
              <p className="text-[13px] leading-relaxed text-[#6B7280]">
                Here&apos;s the work that produced this result.
              </p>
            </div>

            {/* ── LAYER 2: deliverables ledger with VioletThread ── */}
            <div className="relative px-5 pb-2">
              {/* VioletThread — vertical line behind nodes, aria-hidden */}
              {outcome.deliverables.length > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-[calc(1.25rem+11px)] top-2 w-px bg-agent opacity-30"
                />
              )}

              {outcome.deliverables.map((d) => (
                <EvidenceRow
                  key={d.id}
                  deliverable={d}
                  displayDate={shortDate(d.occurredAt)}
                />
              ))}

              {/* Terminal pill — thread ends at blue delta summary */}
              {outcome.deliverables.length > 0 && (
                <div className="relative py-3 pl-8">
                  {/* Final node — switches from violet to blue */}
                  <span
                    className="absolute left-[7px] top-[17px] h-2.5 w-2.5 rounded-full bg-status-info ring-4 ring-white"
                    aria-hidden="true"
                  />
                  <span className="rounded-full bg-status-info px-2.5 py-0.5 font-mono text-[12px] font-semibold tabular-nums text-status-info">
                    +{outcome.deltaPoints} pt on {ENGINE_LABEL[outcome.engine]}
                  </span>
                </div>
              )}
            </div>

            {/* ── LAYER 3: attribution ghost toggle ────────── */}
            <AttributionNote deltaPoints={outcome.deltaPoints} engine={outcome.engine} />
          </div>
        </div>
      </div>
    </div>
  )
}

const ENGINE_LABEL: Record<Outcome['engine'], string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}
