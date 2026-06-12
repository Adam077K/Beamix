'use client'

/**
 * ShareOfVoice — M3 asymmetric 2-up: dominant SoV-over-time + per-engine rail.
 *
 * Renders the share-of-voice chart across 5 weekly points (you vs top competitor).
 *
 * Design laws applied:
 *  - M1/M3: dominant chart left, per-engine breakdown right (not N-equal)
 *  - M4 signature: filled trend area under the "you" line (the Beamix data tell)
 *  - M7: in-cell number-over-label hierarchy in the rail (you dominates, competitor recedes)
 *  - M11: every percentage is Geist Mono tabular-nums
 *
 * Series law (engine-colors.ts / DESIGN-VISION §3 + brief):
 *  - data-1 #3370FF  = you (blue = your territory)
 *  - COMPETITOR_GREY  = the tracked competitor — a NEUTRAL grey field, not a band hue
 *  - violet #6E56F0   is reserved for AGENT-run markers only — never an engine/competitor fill
 *  This mirrors the analytics SoV surface so the two charts read as one instrument.
 */

import { cn } from '@/lib/utils'

// The tracked competitor reads as a neutral grey (the leader grey, mirroring
// COMPETITOR_GREYS['Smile Center'] on the analytics surface). NOT violet.
const COMPETITOR_GREY = '#6B7280'

interface ShareOfVoicePoint {
  date: string
  us: number
  topCompetitor: number
}

interface EngineBreakdown {
  engine: string
  us: number
  competitors: readonly { name: string; value: number }[]
}

interface ShareOfVoiceProps {
  history: readonly ShareOfVoicePoint[]
  engineBreakdown: readonly EngineBreakdown[]
  topCompetitorName: string
  className?: string
}

// ---------------------------------------------------------------------------
// SVG line chart — you vs top competitor over time
// ---------------------------------------------------------------------------

/**
 * niceDomain — produce a readable [min, max] that snaps to a round step and
 * guarantees ~4 evenly-labelled gridlines that sit INSIDE the plot frame.
 * The old math floored to ±5 then filtered the fixed [0,25,50,75] set, which
 * could leave a single orphan label and a flat-looking series. This always
 * returns 4 labelled lines spanning the data with breathing room.
 */
function niceDomain(values: number[]): { min: number; max: number; ticks: number[] } {
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  // Pad ~12% of the spread (min 6pp) so neither series kisses the frame edge.
  const pad = Math.max(6, Math.round((dataMax - dataMin) * 0.12))
  let min = Math.max(0, Math.floor((dataMin - pad) / 5) * 5)
  let max = Math.min(100, Math.ceil((dataMax + pad) / 5) * 5)
  if (max - min < 20) {
    // Guarantee enough vertical room for the lines to read as a trend.
    max = Math.min(100, min + 20)
    if (max - min < 20) min = Math.max(0, max - 20)
  }
  const span = max - min
  const ticks = [0, 1, 2, 3].map((i) => Math.round(min + (span * i) / 3))
  return { min, max, ticks }
}

function SoVLineChart({
  history,
  topCompetitorName,
}: {
  history: readonly ShareOfVoicePoint[]
  topCompetitorName: string
}) {
  const W = 520
  const H = 210
  // Right padding reserves room for the end-of-line callout so it never clips
  // against the card edge (P3.10). Left padding holds the axis labels.
  const PAD = { top: 18, right: 44, bottom: 30, left: 38 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const allValues = history.flatMap((p) => [p.us, p.topCompetitor])
  const { min: minVal, max: maxVal, ticks } = niceDomain(allValues)
  const range = maxVal - minVal || 1

  const toX = (i: number) => PAD.left + (i / (history.length - 1)) * innerW
  const toY = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH

  const usPoints = history.map((p, i) => `${toX(i)},${toY(p.us)}`).join(' ')
  const compPoints = history.map((p, i) => `${toX(i)},${toY(p.topCompetitor)}`).join(' ')

  // Filled trend area under the "you" line — the Beamix signature (M4): a bare
  // stroke reads as a sparkline; the filled area reads as an owned metric.
  const baseY = PAD.top + innerH
  const usArea = `${toX(0)},${baseY} ${usPoints} ${toX(history.length - 1)},${baseY}`

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const last = history[history.length - 1]

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex items-center gap-5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#0A0A0A]">
          <span className="inline-block h-[3px] w-6 rounded-full bg-[var(--color-data-1)]" />
          You
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <span
            className="inline-block h-[3px] w-6 rounded-full"
            style={{ backgroundColor: COMPETITOR_GREY }}
          />
          {topCompetitorName}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto', aspectRatio: `${W} / ${H}` }}
        aria-label={`Share of Voice over 5 weeks: you at ${last.us}%, ${topCompetitorName} at ${last.topCompetitor}%`}
        role="img"
      >
        <defs>
          <linearGradient id="sov-us-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-data-1)" stopOpacity={0.14} />
            <stop offset="100%" stopColor="var(--color-data-1)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines — always 4, always labelled */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={toY(v)}
              y2={toY(v)}
              stroke="var(--color-data-grid)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={toY(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="#9CA3AF"
              fontFamily="var(--font-mono)"
            >
              {v}%
            </text>
          </g>
        ))}

        {/* X-axis date labels */}
        {history.map((p, i) => (
          <text
            key={p.date}
            x={toX(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#9CA3AF"
          >
            {fmtDate(p.date)}
          </text>
        ))}

        {/* Filled "you" trend area (M4 signature) */}
        <polygon points={usArea} fill="url(#sov-us-fill)" />

        {/* Competitor line — neutral grey, behind the focal "you" line */}
        <polyline
          points={compPoints}
          fill="none"
          stroke={COMPETITOR_GREY}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />

        {/* Competitor end-dot — small, recedes */}
        <circle
          cx={toX(history.length - 1)}
          cy={toY(last.topCompetitor)}
          r={2.5}
          fill={COMPETITOR_GREY}
          opacity={0.7}
        />

        {/* "You" line — the focal series, in front, bolder */}
        <polyline
          points={usPoints}
          fill="none"
          stroke="var(--color-data-1)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points — you */}
        {history.map((p, i) => (
          <circle
            key={`us-${p.date}`}
            cx={toX(i)}
            cy={toY(p.us)}
            r={i === history.length - 1 ? 3.5 : 2.5}
            fill="var(--color-data-1)"
          />
        ))}

        {/* Latest "you" callout — anchored inside the reserved right padding */}
        <text
          x={toX(history.length - 1) + 10}
          y={toY(last.us)}
          dominantBaseline="middle"
          fontSize={12}
          fontFamily="var(--font-mono)"
          fill="var(--color-data-1)"
          fontWeight="600"
        >
          {last.us}%
        </text>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-engine breakdown — you dominant, competitor recedes (M7)
// ---------------------------------------------------------------------------

function EngineBar({ engine, us, competitors }: EngineBreakdown) {
  const topComp = competitors[0]

  return (
    <div className="space-y-2.5">
      {/* You — number-over-label dominance (M7): the figure leads, big + blue. */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-[#0A0A0A]">{engine}</span>
        <span className="font-mono text-[15px] font-semibold tabular-nums leading-none text-[var(--color-data-1)]">
          {us}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className="h-full rounded-full bg-[var(--color-data-1)] transition-all"
          style={{ width: `${us}%` }}
        />
      </div>

      {/* Top competitor — recedes hard: smaller, grey, thinner bar. */}
      <div className="flex items-baseline justify-between gap-2 pt-0.5">
        <span className="truncate text-[11px] text-[#9CA3AF]">{topComp?.name ?? '—'}</span>
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: COMPETITOR_GREY }}
        >
          {topComp?.value ?? 0}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${topComp?.value ?? 0}%`,
            backgroundColor: COMPETITOR_GREY,
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ShareOfVoice — exported component
// ---------------------------------------------------------------------------

export function ShareOfVoice({
  history,
  engineBreakdown,
  topCompetitorName,
  className,
}: ShareOfVoiceProps) {
  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const delta = latest.us - prev.us

  return (
    <section
      className={cn('overflow-hidden rounded-[16px]', className)}
      aria-labelledby="sov-heading"
    >
      {/* Section header — STEP-1 hero figure (M2) */}
      <div className="border-b border-[#F3F4F6] px-6 py-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Share of Voice
        </p>
        <div className="flex items-baseline gap-3">
          <h2
            id="sov-heading"
            className="font-mono text-[64px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-[#0A0A0A]"
          >
            {latest.us}%
          </h2>
          <span
            className={cn(
              'font-mono text-sm font-medium tabular-nums',
              delta > 0 ? 'text-[#10B981]' : delta < 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]',
            )}
          >
            {delta > 0 ? '+' : ''}
            {delta}% this week
          </span>
        </div>
      </div>

      {/* M3 asymmetric 2-up: chart (dominant) + engine rail */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_208px]">
        {/* Dominant — line chart */}
        <div className="border-b border-[#F3F4F6] p-6 lg:border-b-0 lg:border-r">
          <SoVLineChart history={history} topCompetitorName={topCompetitorName} />
        </div>

        {/* Rail — per-engine breakdown */}
        <div className="space-y-5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            By engine
          </p>
          {engineBreakdown.map((eb) => (
            <EngineBar key={eb.engine} {...eb} />
          ))}
        </div>
      </div>
    </section>
  )
}
