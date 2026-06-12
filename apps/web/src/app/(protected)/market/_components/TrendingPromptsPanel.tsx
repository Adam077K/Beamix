'use client'

import { useState } from 'react'
import { Check, TrendingUp, ArrowRight } from 'lucide-react'
import { INTENT_PILL, INTENT_LABELS, type IntentKey } from './market-colors'
import type { TrendingPrompt } from '@/lib/demo/surfaces/types'

/**
 * TrendingPromptsPanel — TIER-2, the lighter ~40% half of the weighted 2-up.
 *
 * Emerging queries to promote to tracked. Each row carries the same Track →
 * Tracking flip as the main table (blue → violet status pill), so the spatial
 * promise (you start, agents finish) is consistent across the surface.
 *
 * Growth figures are Geist Mono tabular-nums; the small TrendingUp glyph keeps
 * each row glanceable without a chart.
 */

interface TrendingPromptsPanelProps {
  prompts: TrendingPrompt[]
}

function IntentPill({ intent }: { intent: IntentKey }) {
  const { bg, text } = INTENT_PILL[intent]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {INTENT_LABELS[intent]}
    </span>
  )
}

function PromoteControl() {
  const [tracking, setTracking] = useState(false)

  if (tracking) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-opacity duration-200 ease-out"
        style={{ backgroundColor: '#EEEAFD', color: '#6E56F0' }}
        aria-label="An agent is tracking this prompt"
      >
        <Check className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
        Tracking
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTracking(true)}
      className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-[#3370FF] transition-colors duration-200 ease-out hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
      aria-label="Promote this prompt to tracked"
    >
      Track
      <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
    </button>
  )
}

export function TrendingPromptsPanel({ prompts }: TrendingPromptsPanelProps) {
  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Trending up
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Fast-growing queries worth claiming before competitors do.
        </p>
      </div>

      <ul className="divide-y divide-[#F0F1F3]">
        {prompts.map((p) => (
          <li key={p.query} className="flex items-center gap-3 py-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F5EE]"
              aria-hidden="true"
            >
              <TrendingUp className="h-3.5 w-3.5 text-[#0E9E6E]" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-[#0A0A0A]">{p.query}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 font-mono text-[12px] font-medium tabular-nums text-[#0E9E6E]">
                  +{p.weeklyVolumeGrowth}%
                  <span className="font-sans text-[11px] font-normal text-[#9CA3AF]">/wk</span>
                </span>
                <IntentPill intent={p.intent} />
              </div>
            </div>
            <PromoteControl />
          </li>
        ))}
      </ul>
    </div>
  )
}
