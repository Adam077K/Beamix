'use client'

import type { ScanEngineResult } from './EngineBreakdownTable'

// Re-export so consumers can import from any of the three files
export type { ScanEngineResult }

// ─── Types ────────────────────────────────────────────────────────────────────

interface SentimentCounts {
  positive: number
  neutral: number
  negative: number
  total: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const THRESHOLD = 0.2

function countSentiments(results: ScanEngineResult[]): SentimentCounts {
  let positive = 0
  let neutral = 0
  let negative = 0

  for (const r of results) {
    const s = r.sentiment_score
    if (s === null || (s >= -THRESHOLD && s <= THRESHOLD)) {
      neutral++
    } else if (s > THRESHOLD) {
      positive++
    } else {
      negative++
    }
  }

  return { positive, neutral, negative, total: results.length }
}

/** Map a count to a bar width in SVG units (0–280). Clamped to min 2px when >0 so bars are always visible. */
function barWidth(count: number, total: number, maxWidth = 280): number {
  if (total === 0 || count === 0) return 0
  const raw = (count / total) * maxWidth
  return Math.max(raw, 2)
}

// ─── Bar row ──────────────────────────────────────────────────────────────────

interface BarRowProps {
  label: string
  count: number
  total: number
  y: number
  colorClass: string
  svgColorFill: string
}

function BarRow({ label, count, total, y, svgColorFill }: BarRowProps) {
  const w = barWidth(count, total)
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <g>
      <rect
        x={0}
        y={y}
        width={w}
        height={16}
        rx={3}
        fill={svgColorFill}
        opacity={count === 0 ? 0.18 : 1}
      />
      {/* Ghost track behind bar */}
      <rect
        x={0}
        y={y}
        width={280}
        height={16}
        rx={3}
        fill={svgColorFill}
        opacity={0.07}
      />
      {/* Label — rendered via foreignObject for Tailwind classes; fallback text for SVG-only renderers */}
      <text
        x={0}
        y={y + 30}
        fontSize={11}
        fill="#71717a"
        fontFamily="inherit"
      >
        {label} ({count})
        {count > 0 ? ` · ${pct}%` : ''}
      </text>
    </g>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  results: ScanEngineResult[]
}

export function SentimentHistogram({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm font-medium text-zinc-500">No sentiment data</p>
        <p className="mt-1 text-xs text-zinc-400">Sentiment is collected during scan execution</p>
      </div>
    )
  }

  const counts = countSentiments(results)

  // All zero sentiment scores → still render but show as neutral
  const allNeutral = counts.positive === 0 && counts.negative === 0

  return (
    <div className="w-full space-y-1">
      {/* Legend row */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
        <span>Sentiment distribution</span>
        <span className="tabular-nums">{counts.total} result{counts.total !== 1 ? 's' : ''}</span>
      </div>

      {/* SVG bars — 3 rows × (16px bar + 14px label + 8px gap) = ~114px viewBox height */}
      <svg
        width="100%"
        viewBox="0 0 300 114"
        preserveAspectRatio="none"
        aria-label="Sentiment distribution chart"
        role="img"
      >
        <title>Sentiment distribution: {counts.positive} positive, {counts.neutral} neutral, {counts.negative} negative</title>

        {/* Positive */}
        <BarRow
          label="Positive"
          count={counts.positive}
          total={counts.total}
          y={0}
          colorClass="text-emerald-500"
          svgColorFill={allNeutral ? '#d1fae5' : '#10b981'}
        />

        {/* Neutral */}
        <BarRow
          label="Neutral"
          count={counts.neutral}
          total={counts.total}
          y={38}
          colorClass="text-zinc-400"
          svgColorFill="#a1a1aa"
        />

        {/* Negative */}
        <BarRow
          label="Negative"
          count={counts.negative}
          total={counts.total}
          y={76}
          colorClass="text-red-500"
          svgColorFill="#ef4444"
        />
      </svg>

      {/* Threshold footnote */}
      <p className="pt-1 text-[10px] text-zinc-300 tabular-nums">
        Threshold ±{THRESHOLD} · scores outside range classified as positive/negative
      </p>
    </div>
  )
}
