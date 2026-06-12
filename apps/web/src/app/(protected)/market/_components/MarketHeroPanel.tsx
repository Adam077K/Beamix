'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { INTENT_ORDER, INTENT_LABELS, formatVolume, type IntentKey } from './market-colors'
import type { MarketPromptRow } from '@/lib/demo/surfaces/types'

/**
 * MarketHeroPanel — TIER-1 focal card (card-console-hero, one per screen).
 *
 * Asymmetry (M3): LEFT figure column dominant, RIGHT 360px intent-donut rail.
 *
 * STEP-1 = 64px Geist Mono addressable monthly volume in #3370FF — the ONE blue
 * structural figure on the page.
 * STEP-2 = 30px InterDisplay verdict carrying the ONE Fraunces beat ("wide-open")
 *          — the single editorial moment, never in chrome.
 * STEP-4 = body. Delta chip = mono status pill.
 *
 * The donut splits addressable volume by INTENT in pastel data-band fills; its
 * inner label is neutral mono (#374151) so the blue 64px figure stays the only
 * TIER-1 focal.
 */

interface MarketHeroPanelProps {
  addressableVolume: number
  volumeDelta: number
  prompts: MarketPromptRow[]
}

// Pastel intent fills for the donut (low-opacity data band — never loud).
const INTENT_DONUT: Record<IntentKey, string> = {
  informational: '#9DB8FF', // pastel blue
  transactional: '#7FD7B4', // pastel green
  navigational: '#CBCFD6', // pastel neutral
}

const DONUT_SIZE = 168
const STROKE = 22
const RADIUS = (DONUT_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

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
          const dash = fraction * CIRC
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
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
              style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Neutral mono — the blue 64px hero figure is the only TIER-1 focal. */}
        <span className="font-mono text-[26px] font-medium leading-none tabular-nums tracking-[-0.02em] text-[#374151]">
          {formatVolume(uncitedVolume)}
        </span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
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
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_360px] lg:items-center lg:p-10">
        {/* LEFT — figure + verdict (dominant) */}
        <div className="min-w-0">
          {/* STEP-3 eyebrow */}
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Addressable monthly volume
          </p>
          {/* STEP-1 — the one blue 64px mono figure */}
          <div className="flex items-end gap-3">
            <span className="font-mono text-[64px] font-medium leading-[0.9] tracking-[-0.03em] tabular-nums text-[#3370FF]">
              {formatVolume(addressableVolume)}
            </span>
          </div>
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
