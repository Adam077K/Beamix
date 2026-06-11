'use client'

import { cn } from '@/lib/utils'
import type { EngineVisibilityDelta } from '@/types/digest'

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

interface EngineScoreCardProps {
  delta: EngineVisibilityDelta
}

/**
 * EngineScoreCard — NOW score / THEN score / delta pill + optional 4-week sparkline.
 *
 * Color law: blue (#3370FF / --color-data-1) for customer movement.
 * Violet NEVER appears here. Honest on dips (warning amber, not hidden).
 *
 * Layout:
 *  - Engine name: Inter 11px uppercase tracking-[0.08em] #9CA3AF
 *  - NOW: Geist Mono ~44px tabular-nums #0A0A0A
 *  - THEN: "from 66" muted Geist Mono ~13px #9CA3AF
 *  - Delta pill: Geist Mono 12px (status-positive / neutral / warning)
 *  - 4-week sparkline when fourWeeksAgo is non-null
 */
export function EngineScoreCard({ delta }: EngineScoreCardProps) {
  const { engine, thisWeek, lastWeek, fourWeeksAgo, delta: change } = delta

  const deltaVariant =
    change > 0 ? 'positive' : change < 0 ? 'warning' : 'neutral'

  const deltaSign = change > 0 ? '+' : ''

  const deltaBgClass = {
    positive: 'bg-status-positive text-status-positive',
    warning: 'bg-status-warning text-status-warning',
    neutral: 'bg-status-neutral text-status-neutral',
  }[deltaVariant]

  const label = `${ENGINE_LABELS[engine] ?? engine}: score ${thisWeek}, was ${lastWeek}, change ${deltaSign}${change}`

  return (
    <div
      className="flex flex-col gap-1 rounded-xl border border-[#E5E7EB] bg-white p-4"
      aria-label={label}
    >
      {/* Engine name */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {ENGINE_LABELS[engine] ?? engine}
      </p>

      {/* NOW score */}
      <p className="font-mono text-[44px] font-semibold leading-none tabular-nums text-[#0A0A0A]">
        {thisWeek}
      </p>

      {/* THEN + delta row */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] text-[#9CA3AF] tabular-nums">
          from {lastWeek}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[12px] tabular-nums',
            deltaBgClass,
          )}
          aria-label={`Change: ${deltaSign}${change}`}
        >
          {deltaSign}
          {change}
        </span>
      </div>

      {/* 4-week sparkline — only when we have the data point */}
      {fourWeeksAgo !== null && (
        <SparkLine points={[fourWeeksAgo, lastWeek, thisWeek]} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Micro sparkline — three-point SVG using --color-data-1
// ---------------------------------------------------------------------------

interface SparkLineProps {
  points: number[]
}

function SparkLine({ points }: SparkLineProps) {
  if (points.length < 2) return null

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const W = 48
  const H = 16
  const step = W / (points.length - 1)

  const coords = points.map((v, i) => ({
    x: i * step,
    y: H - ((v - min) / range) * H,
  }))

  const d = coords
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ')

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="mt-1"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-data-1)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End-point dot */}
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="2"
        fill="var(--color-data-1)"
      />
    </svg>
  )
}
