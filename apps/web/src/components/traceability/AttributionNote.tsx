'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { AIEngine } from '@/types/traceability'

interface AttributionNoteProps {
  deltaPoints: number
  engine: AIEngine
}

const ENGINE_LABEL: Record<AIEngine, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

/**
 * AttributionNote — LAYER 3 in the expanded OutcomeCard.
 *
 * Ghost toggle: "Show how this moved the score" / "Hide".
 * Reveal text is directional — never causal. The delta is not-italic
 * font-mono font-semibold text-accent tabular-nums, embedded in italic
 * surrounding copy.
 */
export function AttributionNote({ deltaPoints, engine }: AttributionNoteProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-[#F3F4F6] px-5 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[13px] text-[#6B7280] transition-colors hover:text-[#374151] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      >
        {open ? 'Hide' : 'Show how this moved the score'}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <p className="mt-2 text-[13px] italic leading-relaxed text-[#6B7280]">
          This work contributed to a{' '}
          <span className="not-italic font-mono font-semibold text-accent tabular-nums">
            +{deltaPoints} pt
          </span>{' '}
          movement on {ENGINE_LABEL[engine]}. Attribution is directional — multiple factors
          affect ranking.
        </p>
      )}
    </div>
  )
}
