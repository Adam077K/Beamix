'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { Stat } from '@/components/ui/stat'
import { INTENT_ORDER, INTENT_LABELS, formatVolume, type IntentKey } from './market-colors'
import type { MarketPromptRow } from '@/lib/demo/surfaces/types'

/**
 * MarketHeroPanel — TIER-1 focal card (card-console-hero, one per screen).
 *
 * Asymmetry (M3): LEFT figure column dominant, RIGHT 360px intent-donut rail.
 *
 * STEP-1 = 64px Geist Mono addressable monthly volume in INK #0A0A0A (<Stat
 *          size="hero">) — the ONE dominant figure on the page. Data is not an
 *          action: blue is reserved for the trend chip / active nav ONLY (M11,
 *          tell #8). The figure reads TRUE, not clickable.
 * STEP-2 = 30px InterDisplay verdict carrying the ONE Fraunces beat ("wide-open")
 *          — the single editorial moment, never in chrome.
 * STEP-4 = body. Delta chip = mono status pill.
 *
 * The donut splits addressable volume by INTENT in the desaturated data-viz
 * SERIES band (data-1 blue / data-4 green / data-3 cyan — DESIGN-VISION §3), so
 * the ring reads as a finished data object, never a half-empty skeleton. Its
 * inner label is demoted to an 18px mono caption (#374151) so the 64px figure
 * stays the unmistakable single TIER-1 focal (M1/M10).
 */

interface MarketHeroPanelProps {
  addressableVolume: number
  volumeDelta: number
  prompts: MarketPromptRow[]
}

// Intent fills for the donut — the desaturated data-viz SERIES band (NOT the
// hero gradient, which is reserved for hero/AI/score-reveal). Saturated enough
// that the ring reads finished, never a grey loading placeholder.
const INTENT_DONUT: Record<IntentKey, string> = {
  informational: '#3370FF', // data-1
  transactional: '#10B981', // data-4 — revenue-intent green
  navigational: '#06B6D4', // data-3 — cyan
}

const DONUT_SIZE = 168
const STROKE = 24
const RADIUS = (DONUT_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS
// Tiny round-cap gap between segments so the band reads as discrete slices, not
// one continuous ring. Subtracted from each dash, added back to the gap.
const SEG_GAP = 2

interface Segment {
  intent: IntentKey
  value: number
  color: string
}

/** Sum monthly volume per intent across all prompts. */
function buildSegments(prompts: MarketPromptRow[]): Segment[] {
  const totals: Record<IntentKey, number> = {
    informational: 0,
    transactional: 0,
    navigational: 0,
  }
  for (const p of prompts) totals[p.intent] += p.monthlyVolume
  return INTENT_ORDER.map((intent) => ({
    intent,
    value: totals[intent],
    color: INTENT_DONUT[intent],
  }))
}

function IntentDonut({
  segments,
  uncitedVolume,
}: {
  segments: Segment[]
  uncitedVolume: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let cumulative = 0

  return (
    <div
      className="relative shrink-0"
      style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
      role="img"
      aria-label={`Addressable volume by intent: ${segments
        .map((s) => `${INTENT_LABELS[s.intent]} ${formatVolume(s.value)} queries`)
        .join(', ')}.`}
    >
      <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-data-grid)"
          strokeWidth={STROKE}
        />
        {segments.map((seg) => {
          const fraction = seg.value / total
          // Full-coverage segment minus a hairline gap so the ring reads as
          // discrete slices that together fill 100% — never a grey majority.
          const dash = Math.max(fraction * CIRC - SEG_GAP, 0)
          const gap = CIRC - dash
          const offset = -(cumulative / total) * CIRC
          cumulative += seg.value
          return (
            <circle
              key={seg.intent}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
              style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Demoted: 18px mono caption (M1/M10) — the 64px ink figure is the only
            TIER-1 focal. The "unclaimed" narrative lives in the verdict sentence. */}
        <span className="font-mono text-[18px] font-medium leading-none tabular-nums tracking-[-0.01em] text-[#374151]">
          {formatVolume(uncitedVolume)}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
          unclaimed
        </span>
      </div>
    </div>
  )
}

function DeltaChip({ delta }: { delta: number }) {
  const positive = delta >= 0
  const cls = positive
    ? 'bg-status-positive text-status-positive'
    : 'bg-status-critical text-status-critical'
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
      <span className="font-mono tabular-nums">
        {positive ? '+' : ''}
        {delta}%
      </span>
      <span className="font-sans text-[#6B7280]">vs. previous 30d</span>
    </span>
  )
}

export function MarketHeroPanel({
  addressableVolume,
  volumeDelta,
  prompts,
}: MarketHeroPanelProps) {
  const segments = buildSegments(prompts)
  // Whitespace: volume of prompts nobody is cited for.
  const uncitedVolume = prompts
    .filter((p) => !p.cited)
    .reduce((sum, p) => sum + p.monthlyVolume, 0)

  return (
    <section
      aria-labelledby="market-hero-heading"
      className="card-console-hero relative overflow-hidden"
      style={{
        // Stronger warm wash than the chart cards so the TIER-1 hero is felt as
        // elevated (M1). Warm corner under the donut, white under the figure.
        background:
          'radial-gradient(120% 140% at 100% 0%, var(--color-surface-warm) 0%, #FCFBF8 42%, #FFFFFF 100%)',
      }}
    >
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:items-center lg:p-10">
        {/* LEFT — figure + verdict (dominant) */}
        <div className="min-w-0">
          {/* STEP-1 — the ONE 64px mono figure, in INK (data is not an action;
              blue is reserved for the trend chip / nav). Eyebrow on top. */}
          <Stat
            value={formatVolume(addressableVolume)}
            label="Addressable monthly volume"
            labelPosition="top"
            size="hero"
            align="start"
          />
          {/* STEP-2 verdict — the ONE Fraunces beat on "wide-open" */}
          <h2
            id="market-hero-heading"
            className="mt-4 max-w-[540px] font-[var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]"
          >
            A <SerifVerdict>wide-open</SerifVerdict> category: {formatVolume(uncitedVolume)} of
            these monthly prompts cite nobody
          </h2>
          {/* Delta chip */}
          <div className="mt-4">
            <DeltaChip delta={volumeDelta} />
          </div>
          {/* STEP-4 body */}
          <p className="mt-4 max-w-[460px] text-[15px] leading-[1.6] text-[#6B7280]">
            Estimated monthly AI queries across your vertical — and the share still unclaimed. The
            prompts nobody owns are flagged in the table below.
          </p>
        </div>

        {/* RIGHT — 360px intent-donut rail */}
        <div className="flex flex-col items-center gap-5 lg:items-start">
          <IntentDonut segments={segments} uncitedVolume={uncitedVolume} />
          <ul className="w-full space-y-1.5">
            {segments.map((seg) => (
              <li key={seg.intent} className="flex items-center gap-2 text-[13px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-[#6B7280]">{INTENT_LABELS[seg.intent]}</span>
                <span className="font-mono tabular-nums text-[#374151]">
                  {formatVolume(seg.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
