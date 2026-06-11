'use client'

/**
 * ShareOfVoice — M3 asymmetric 2-up: dominant SoV-over-time + per-engine rail.
 *
 * Renders the share-of-voice chart across 5 weekly points (you vs top competitor).
 * Reuses EngineMicroSparkline logic for the per-engine mini-bars.
 *
 * Design laws applied:
 *  - M3: dominant chart left, per-engine breakdown right (not N-equal)
 *  - M11: every percentage is Geist Mono tabular-nums
 *  - data-1 (#3370FF) = you (blue = your territory)
 *  - data-2 (#6E56F0) = top competitor (the agent-tracked comparison)
 */

import { cn } from '@/lib/utils'

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

function SoVLineChart({
  history,
  topCompetitorName,
}: {
  history: readonly ShareOfVoicePoint[]
  topCompetitorName: string
}) {
  const W = 480
  const H = 140
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const allValues = history.flatMap((p) => [p.us, p.topCompetitor])
  const minVal = Math.max(0, Math.min(...allValues) - 5)
  const maxVal = Math.min(100, Math.max(...allValues) + 5)
  const range = maxVal - minVal || 1

  const toX = (i: number) => PAD.left + (i / (history.length - 1)) * innerW
  const toY = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH

  const usPoints = history.map((p, i) => `${toX(i)},${toY(p.us)}`).join(' ')
  const compPoints = history.map((p, i) => `${toX(i)},${toY(p.topCompetitor)}`).join(' ')

  // Y-axis gridlines at 0, 25, 50, 75, 100 (whatever falls in range)
  const gridLines = [0, 25, 50, 75].filter((v) => v >= minVal - 2 && v <= maxVal + 2)

  // Format date label: "May 12" from ISO
  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex items-center gap-5">
        <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <span className="inline-block h-0.5 w-6 rounded-full bg-[var(--color-data-1)]" />
          Bright Smile Dental
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <span
            className="inline-block h-0.5 w-6 rounded-full"
            style={{ backgroundColor: 'var(--color-data-2)' }}
          />
          {topCompetitorName}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        aria-label={`Share of Voice: Bright Smile Dental vs ${topCompetitorName} over 5 weeks`}
        role="img"
      >
        {/* Grid lines */}
        {gridLines.map((v) => (
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
              x={PAD.left - 6}
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
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#9CA3AF"
          >
            {fmtDate(p.date)}
          </text>
        ))}

        {/* Competitor line (behind) */}
        <polyline
          points={compPoints}
          fill="none"
          stroke="var(--color-data-2)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.6}
        />

        {/* Us line (in front, bolder) */}
        <polyline
          points={usPoints}
          fill="none"
          stroke="var(--color-data-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points — us */}
        {history.map((p, i) => (
          <circle
            key={`us-${p.date}`}
            cx={toX(i)}
            cy={toY(p.us)}
            r={3}
            fill="var(--color-data-1)"
          />
        ))}

        {/* Latest point callout */}
        <text
          x={toX(history.length - 1) + 6}
          y={toY(history[history.length - 1].us)}
          dominantBaseline="middle"
          fontSize={11}
          fontFamily="var(--font-mono)"
          fill="var(--color-data-1)"
          fontWeight="600"
        >
          {history[history.length - 1].us}%
        </text>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-engine horizontal bar — you vs top competitor
// ---------------------------------------------------------------------------

function EngineBar({
  engine,
  us,
  competitors,
}: EngineBreakdown) {
  const topComp = competitors[0]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#0A0A0A]">{engine}</span>
        <span className="font-mono text-xs tabular-nums text-[#6B7280]">
          you{' '}
          <span className="font-semibold text-[var(--color-data-1)]">
            {us}%
          </span>
        </span>
      </div>

      {/* You bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className="h-full rounded-full bg-[var(--color-data-1)] transition-all"
          style={{ width: `${us}%` }}
        />
      </div>

      {/* Top competitor */}
      <div className="flex items-center justify-between">
        <span className="truncate text-xs text-[#9CA3AF]">{topComp?.name ?? '—'}</span>
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: 'var(--color-data-2)' }}
        >
          {topComp?.value ?? 0}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${topComp?.value ?? 0}%`,
            backgroundColor: 'var(--color-data-2)',
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
      className={cn('card-console overflow-hidden rounded-[16px]', className)}
      aria-labelledby="sov-heading"
    >
      {/* Section header */}
      <div className="border-b border-[#F3F4F6] px-6 py-4">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Share of Voice
        </p>
        <div className="flex items-baseline gap-3">
          <h2
            id="sov-heading"
            className="font-mono text-[36px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-[#0A0A0A]"
          >
            {latest.us}%
          </h2>
          <span
            className={cn(
              'font-mono text-sm tabular-nums font-medium',
              delta > 0 ? 'text-[#10B981]' : delta < 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]',
            )}
          >
            {delta > 0 ? '+' : ''}
            {delta}% this week
          </span>
        </div>
      </div>

      {/* M3 asymmetric 2-up: chart (dominant) + engine rail */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_200px]">
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
