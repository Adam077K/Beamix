'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { bandWord } from './score-band'

/**
 * ShoppingHero — TIER-1 focal (card-console-hero, ONE per screen).
 *
 * STEP-1 = a single 64px Geist Mono #3370FF figure (the one blue structural
 * focal). A quiet toggle swaps the headline between AI shopping visibility (%)
 * and AI-attributed revenue (₪). One Fraunces beat lives in the verdict line.
 *
 * Asymmetry (M3): dominant left figure column, narrow right sparkline rail.
 */

type HeroMode = 'visibility' | 'revenue'

interface ShoppingHeroProps {
  /** AI shopping visibility % (0–100) */
  visibility: number
  /** AI-attributed revenue in ILS */
  revenue: number
  /** Period-over-period delta in percentage points (visibility) */
  visibilityDelta: number
  /** Period-over-period delta in % (revenue) */
  revenueDelta: number
  /** Last-5-weeks visibility points for the sparkline */
  trend: number[]
  /** Best/worst-moving SKU this period — feeds the rail mini-ledger */
  topMover?: { name: string; delta: number }
  bottomMover?: { name: string; delta: number }
}

function ils(n: number): string {
  return `₪${n.toLocaleString('en-US')}`
}

function DeltaChip({ value, unit }: { value: number; unit: 'pp' | '%' }) {
  const positive = value >= 0
  const cls = positive
    ? 'bg-status-positive text-status-positive'
    : 'bg-status-critical text-status-critical'
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium',
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
      <span className="font-mono tabular-nums">
        {positive ? '+' : ''}
        {value}
        {unit}
      </span>
      <span className="font-sans text-[#6B7280]">vs. previous period</span>
    </span>
  )
}

/**
 * HeroTrendLine — a dedicated BLUE trend line for the hero rail.
 *
 * This is YOUR visibility metric (blue=you), so the line is rendered in the
 * #3370FF accent — NOT the score-band green. That keeps green reserved for true
 * positive-state semantics (the delta chip, sentiment) and stops three unrelated
 * greens from reading as one (P2-3). A separate component from the score-band
 * EngineMicroSparkline by design.
 */
function HeroTrendLine({ points }: { points: number[] }) {
  const w = 188
  const h = 52
  const padX = 3
  const padY = 6
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  const step = innerW / (points.length - 1)
  const toY = (v: number) => h - padY - ((v - min) / range) * innerH
  const coords = points.map((v, i) => ({ x: padX + i * step, y: toY(v) }))
  const line = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const area = `${padX},${h - padY} ${line} ${padX + innerW},${h - padY}`
  const last = coords[coords.length - 1]

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="hero-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3370FF" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#3370FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#hero-trend-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#3370FF"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={3} fill="#3370FF" />
      <circle cx={last.x} cy={last.y} r={5} fill="#3370FF" fillOpacity={0.18} />
    </svg>
  )
}

export function ShoppingHero({
  visibility,
  revenue,
  visibilityDelta,
  revenueDelta,
  trend,
  topMover,
  bottomMover,
}: ShoppingHeroProps) {
  const [mode, setMode] = useState<HeroMode>('visibility')
  const isVis = mode === 'visibility'

  return (
    <section
      aria-labelledby="shopping-hero-heading"
      className="card-console-hero relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 46%, var(--color-surface-warm) 100%)',
      }}
    >
      {/* Top blue accent hairline — anchors the hero as TIER-1 and as YOURS
          (blue=you), giving the eye an unambiguous first landing (P2-1/M1). */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#3370FF_0%,#3370FF_55%,rgba(51,112,255,0)_100%)]"
      />
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_236px] lg:items-center lg:p-10">
        {/* LEFT — figure + verdict (dominant) */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            {/* STEP-3 eyebrow */}
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              {isVis ? 'AI shopping visibility' : 'AI-attributed revenue'}
            </p>

            {/* Quiet metric toggle — not the focal */}
            <div
              role="group"
              aria-label="Switch hero metric"
              className="flex shrink-0 rounded-lg bg-[#F3F4F6] p-1 ring-1 ring-inset ring-[#E5E7EB]"
            >
              {(['visibility', 'revenue'] as HeroMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                    mode === m
                      ? 'bg-white text-[#0A0A0A] shadow-sm ring-1 ring-inset ring-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#0A0A0A]',
                  )}
                >
                  {m === 'visibility' ? 'Visibility' : 'Revenue'}
                </button>
              ))}
            </div>
          </div>

          {/* STEP-1 — the one blue 64px mono figure */}
          <div className="mt-3 flex items-end gap-3">
            <span className="font-mono text-[64px] font-medium leading-[0.9] tracking-[-0.03em] tabular-nums text-[#3370FF]">
              {isVis ? `${visibility}%` : ils(revenue)}
            </span>
          </div>

          {/* STEP-2 verdict + the ONE Fraunces beat.
              max-w tuned + a non-breaking space binds "ask AI" so the two-letter
              "AI" never orphans onto its own line (M2/M12). */}
          <h2
            id="shopping-hero-heading"
            className="mt-4 max-w-[18ch] font-[var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-balance text-[#0A0A0A]"
          >
            Your shop shows up <SerifVerdict>{bandWord(visibility)}</SerifVerdict> when shoppers
            ask&nbsp;AI
          </h2>

          {/* Delta chip */}
          <div className="mt-4">
            {isVis ? (
              <DeltaChip value={visibilityDelta} unit="pp" />
            ) : (
              <DeltaChip value={revenueDelta} unit="%" />
            )}
          </div>

          {/* STEP-4 body */}
          <p className="mt-4 max-w-[460px] text-[15px] leading-[1.6] text-[#6B7280]">
            This is how often answer engines recommend your products when shoppers ask what to buy —
            and the revenue that traces back to those recommendations.
          </p>
        </div>

        {/* RIGHT — data-texture rail: blue trend + a 2-row mover ledger so the
            column has a second thing to say instead of a lonely line (P2-2). */}
        <div className="lg:border-l lg:border-[#EDEDEA] lg:pl-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Last 5 weeks
            </p>
            <p className="font-mono text-[12px] tabular-nums text-[#6B7280]">
              {trend[0]}%&nbsp;&rarr;&nbsp;{trend[trend.length - 1]}%
            </p>
          </div>

          <div className="mt-2.5">
            <HeroTrendLine points={trend} />
          </div>

          {/* Mini-ledger — top mover this period + the SKU furthest behind */}
          {(topMover || bottomMover) && (
            <dl className="mt-5 space-y-3 border-t border-[#EDEDEA] pt-4">
              {topMover && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF]">
                    Top mover
                  </dt>
                  <dd className="mt-1 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-[12.5px] text-[#374151]">
                      {topMover.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 font-mono text-[12px] tabular-nums text-status-positive">
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" strokeWidth={2.25} />+
                      {topMover.delta}pp
                    </span>
                  </dd>
                </div>
              )}
              {bottomMover && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF]">
                    Furthest behind
                  </dt>
                  <dd className="mt-1 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-[12.5px] text-[#374151]">
                      {bottomMover.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 font-mono text-[12px] tabular-nums text-status-critical">
                      <ArrowDownRight className="h-3 w-3" aria-hidden="true" strokeWidth={2.25} />
                      {bottomMover.delta}pp
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
