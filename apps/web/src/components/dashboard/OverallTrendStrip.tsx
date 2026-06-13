'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

/**
 * OverallTrendStrip — the dominant week-over-week trend chart (P1 fix #1).
 *
 * The #1 gap vs Profound/Plausible: both lead their dashboard with a full
 * trend chart answering the buyer's whole question — "am I climbing?". Beamix
 * previously answered it only with an invisible 64px corner sparkline. This is
 * the dominant TIER-2 trend element that sits directly under the hero.
 *
 * Craft moves applied:
 * M3 — TIER-2 weight: felt elevation under the TIER-1 hero, never competing.
 * M4 — the signature trend detail, full-scale (an area+line chart with a real
 *       y-domain and date axis), not a corner sparkline.
 * M7 — number-over-label: a 40px mono current score + a colored mono delta
 *       token read at a glance, matching Profound's "65% +5%" convention.
 * M9 — craft-enter entrance, no looping motion; reduced-motion safe (the path
 *       grow uses a CSS transition the browser drops under reduced-motion).
 * M11 — every figure in Geist Mono tabular-nums; the slope is the honest truth.
 *
 * Null-safe: with < 2 points it renders a designed baseline (a flat dashed
 * track + "Your trend builds after your next scan"), never a stranded stroke
 * or fabricated data (M4 "never fake data").
 */

export interface OverallTrendPoint {
  /** ISO-8601 week-start date. */
  weekOf: string
  /** Overall visibility score for that week (0–100). */
  score: number
}

interface OverallTrendStripProps {
  /** Week-over-week overall score points, oldest → newest. */
  points: OverallTrendPoint[] | null | undefined
}

const W = 720
const H = 132
const PAD_L = 8
const PAD_R = 8
const PAD_T = 14
const PAD_B = 22 // headroom for the x-axis date labels
const Y_MIN = 0
const Y_MAX = 100
const Y_TICKS = [100, 75, 50, 25, 0]

function bandColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)' // green — good
  if (score >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' //                 red — critical
}

function fmtWeek(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="overall-trend-heading"
      /* M3 TIER-2 elevation, felt under the hero | M9 staggered entrance */
      className="card-console relative overflow-hidden p-5 sm:p-6 craft-enter craft-enter-2"
    >
      {children}
    </section>
  )
}

function Header({
  current,
  delta,
}: {
  current: number | null
  delta: number | null
}) {
  const up = delta != null && delta > 0
  const down = delta != null && delta < 0
  const deltaColor = up
    ? 'var(--color-status-positive)'
    : down
      ? 'var(--color-status-critical)'
      : '#9CA3AF'

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {/* M2 STEP-3 eyebrow */}
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Overall visibility · last 4 weeks
        </p>
        {/* M7 number-over-label: 40px mono figure + colored mono delta, at-a-glance */}
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-mono text-[40px] font-medium leading-none tracking-[-0.02em] text-[#0A0A0A] tabular-nums">
            {current ?? '--'}
            <span className="ml-1 align-baseline font-mono text-[15px] text-[#9CA3AF]">
              /100
            </span>
          </span>
          {delta != null && (
            <span
              className="inline-flex items-center gap-0.5 font-mono text-[15px] font-medium tabular-nums"
              style={{ color: deltaColor }}
            >
              {up ? (
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              ) : down ? (
                <ArrowDownRight className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              ) : (
                <Minus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              )}
              {delta === 0 ? '±0' : `${up ? '+' : ''}${delta}`}
            </span>
          )}
        </div>
      </div>
      <Link
        href="/scans"
        className="shrink-0 rounded text-[13px] font-medium text-accent transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      >
        View scan history
      </Link>
    </div>
  )
}

export function OverallTrendStrip({ points }: OverallTrendStripProps) {
  const series = points ?? []
  const hasLine = series.length >= 2
  const current = series.length >= 1 ? series[series.length - 1].score : null
  const delta =
    series.length >= 2
      ? series[series.length - 1].score - series[0].score
      : null

  // ---- Designed baseline when history < 2 points (M4: never fabricate) ----
  if (!hasLine) {
    return (
      <Shell>
        <Header current={current} delta={delta} />
        <div className="mt-5">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[100px] w-full sm:h-[120px]"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1={PAD_L}
              y1={H - PAD_B}
              x2={W - PAD_R}
              y2={H - PAD_B}
              stroke="var(--color-data-grid)"
              strokeWidth={1.5}
              strokeDasharray="2 5"
            />
          </svg>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            Your trend builds after your next scan — two data points draw the
            first line.
          </p>
        </div>
      </Shell>
    )
  }

  // ---- Geometry over a fixed 0–100 y-domain (honest slope, M11) ----
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const n = series.length
  const x = (i: number) => PAD_L + (i / (n - 1)) * innerW
  const y = (v: number) =>
    PAD_T + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH

  const linePts = series.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')
  const areaPts = `${linePts} ${x(n - 1)},${H - PAD_B} ${x(0)},${H - PAD_B}`
  const color = bandColor(current ?? 0)
  const lastX = x(n - 1)
  const lastY = y(series[n - 1].score)

  return (
    <Shell>
      <Header current={current} delta={delta} />

      <div className="mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[100px] w-full sm:h-[120px]"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Overall visibility trend over the last ${n} weeks, currently ${current} out of 100, ${
            delta === 0
              ? 'unchanged'
              : `${delta! > 0 ? 'up' : 'down'} ${Math.abs(delta!)} points`
          }`}
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* y-axis gridlines — receding, give the chart a real measured frame */}
          {Y_TICKS.map((t) => (
            <line
              key={t}
              x1={PAD_L}
              y1={y(t)}
              x2={W - PAD_R}
              y2={y(t)}
              stroke="var(--color-data-grid)"
              strokeWidth={1}
              strokeDasharray={t === 0 ? undefined : '2 4'}
              opacity={t === 0 ? 0.9 : 0.55}
            />
          ))}

          {/* area fill under the line — soft band wash, score-colored */}
          <polygon points={areaPts} fill="url(#trend-fill)" />

          {/* the trend line itself */}
          <polyline
            points={linePts}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* endpoint dot anchors the eye on "now" */}
          <circle cx={lastX} cy={lastY} r={4.5} fill="#FFFFFF" stroke={color} strokeWidth={2.5} />
        </svg>

        {/* x-axis date labels — first and last week, Profound's date-axis convention */}
        <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[#9CA3AF] tabular-nums">
          <span>{fmtWeek(series[0].weekOf)}</span>
          {n > 2 && (
            <span className="hidden sm:inline">
              {fmtWeek(series[Math.floor((n - 1) / 2)].weekOf)}
            </span>
          )}
          <span>{fmtWeek(series[n - 1].weekOf)}</span>
        </div>
      </div>
    </Shell>
  )
}
