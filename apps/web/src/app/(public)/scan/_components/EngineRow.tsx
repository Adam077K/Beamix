'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EngineId, EngineState } from './scan-contract'

/**
 * A single ledger row (DESIGN-DIRECTION §4 ACT 2 "The ledger").
 *
 * Hairline `border-b` divider, NO card box (Plausible move, anti-generic #4).
 * Three states: DONE (filled blue check), ACTIVE (spinning blue ring + live
 * mono count + shimmer), QUEUED (hollow grey ring, dimmed). Engine logos are
 * greyscale when queued, full-tone when active/done.
 */

interface EngineRowProps {
  engine: EngineState
  isLast: boolean
}

export function EngineRow({ engine, isLast }: EngineRowProps) {
  const isDone = engine.status === 'done'
  const isActive = engine.status === 'querying'
  const isQueued = engine.status === 'queued'
  const isError = engine.status === 'error'

  return (
    <div
      className={cn(
        'flex items-center py-5',
        !isLast && 'border-b border-[#E5E7EB]',
      )}
    >
      {/* State glyph — 18px */}
      <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        {isDone && (
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#3370FF]">
            <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
        )}
        {isActive && (
          <span
            className="scan-ring-spin block h-[18px] w-[18px] rounded-full border-[1.5px] border-[#3370FF]/20 border-t-[#3370FF] motion-safe:animate-[scan-spin_0.7s_linear_infinite]"
            style={{ willChange: 'transform' }}
            aria-hidden="true"
          />
        )}
        {(isQueued || isError) && (
          <span className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-[#E5E7EB]" />
        )}
      </div>

      {/* Engine logo — greyscale when queued */}
      <EngineMark
        id={engine.id}
        tone={isQueued ? 'muted' : 'full'}
        className="ml-2 shrink-0"
      />

      {/* Engine label */}
      <span
        className={cn(
          'ml-2 text-[15px] font-medium transition-colors duration-200',
          isQueued ? 'text-[#9CA3AF]' : 'text-[#0A0A0A]',
        )}
      >
        {engine.label}
      </span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Right: count + status word (mono, tabular) */}
      <div className="flex items-center gap-2 font-[var(--font-mono)] tabular-nums">
        {isDone && (
          <>
            <span className="text-[13px] text-[#6B7280]">
              {engine.totalQueries} queries
            </span>
            <span className="text-[12px] tracking-[0.04em] text-[#6B7280]">
              done
            </span>
          </>
        )}
        {isActive && (
          <span className="scan-count-shimmer text-[13px] text-[#6B7280] motion-safe:animate-[scan-shimmer_1.5s_ease-in-out_infinite]">
            querying… {engine.queryCount}
          </span>
        )}
        {isQueued && (
          <span className="text-[12px] tracking-[0.04em] text-[#9CA3AF]">
            queued
          </span>
        )}
        {isError && (
          <span className="text-[12px] tracking-[0.04em] text-[#9CA3AF]">
            couldn’t reach {engine.label}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Engine marks — clean inline SVG, monochrome-tintable ────────────────────
// Simplified recognizable silhouettes, not pixel-exact brand logos (avoids
// trademark-asset shipping while reading as "those engines").

function EngineMark({
  id,
  tone,
  className,
}: {
  id: EngineId
  tone: 'full' | 'muted'
  className?: string
}) {
  const color = tone === 'muted' ? '#9CA3AF' : COLORS[id]
  return (
    <span
      className={cn('inline-flex h-4 w-4 items-center justify-center', className)}
      aria-hidden="true"
    >
      {MARKS[id](color)}
    </span>
  )
}

const COLORS: Record<EngineId, string> = {
  chatgpt: '#0A0A0A',
  gemini: '#3370FF',
  perplexity: '#0A0A0A',
}

const MARKS: Record<EngineId, (c: string) => JSX.Element> = {
  // ChatGPT — interlocking knot motif
  chatgpt: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5a4 4 0 0 1 3.46 2 4 4 0 0 1 1.04 7.4 4 4 0 0 1-1.04 5.6 4 4 0 0 1-7-1.5 4 4 0 0 1-1.04-7.4A4 4 0 0 1 8.54 3.5 4 4 0 0 1 12 3.5Z"
        stroke={c}
        strokeWidth="1.6"
      />
    </svg>
  ),
  // Gemini — four-point spark
  gemini: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c.4 4.8 2.2 6.6 7 7-4.8.4-6.6 2.2-7 7-.4-4.8-2.2-6.6-7-7 4.8-.4 6.6-2.2 7-7Z"
        fill={c}
      />
    </svg>
  ),
  // Perplexity — concentric query mark
  perplexity: (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke={c} strokeWidth="1.6" />
      <path d="M12 3.5v17M5 8.5l14 7M19 8.5l-14 7" stroke={c} strokeWidth="1.3" />
    </svg>
  ),
}
