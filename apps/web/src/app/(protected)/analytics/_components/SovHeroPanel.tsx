'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { COMPETITOR_GREYS } from './engine-colors'
import type { SovTrendPoint } from '@/lib/demo/surfaces/types'

/**
 * SovHeroPanel — TIER-1 focal card (card-console-hero, one per screen).
 *
 * Asymmetry (M3): LEFT figure column dominant, RIGHT 360px donut rail.
 * Mirrors the dashboard ScoreHeroPanel's earned asymmetry — not an N-equal grid.
 *
 * STEP-1 = 64px Geist Mono SoV % in #3370FF (the one blue structural figure).
 * STEP-2 = 30px InterDisplay verdict. STEP-4 = body. Delta chip = mono status.
 */

interface SovHeroPanelProps {
  heroSov: number
  sovDelta: number
  /** Latest SoV snapshot — drives the donut: you (blue) vs top competitors (greys). */
  latest: SovTrendPoint
}

const DONUT_SIZE = 168
const STROKE = 22
const RADIUS = (DONUT_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

interface Segment {
  name: string
  value: number
  color: string
}

function buildSegments(latest: SovTrendPoint): Segment[] {
  const segments: Segment[] = [{ name: 'You', value: latest.us, color: '#3370FF' }]
  // Competitors descending, capped at the named set; greys from the map.
  const competitorEntries = Object.entries(latest.competitors)
  for (const [name, value] of competitorEntries) {
    segments.push({ name, value, color: COMPETITOR_GREYS[name] ?? '#D1D5DB' })
  }
  return segments
}

function Donut({ segments, heroSov }: { segments: Segment[]; heroSov: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 100
  let cumulative = 0

  return (
    <div
      className="relative shrink-0"
      style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
      role="img"
      aria-label={`Share of voice: you hold ${heroSov} percent of AI answers. ${segments
        .slice(1)
        .map((s) => `${s.name} ${s.value} percent`)
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
              key={seg.name}
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
        {/* Neutral mono — reserves the blue 64px hero figure as the single TIER-1 focal. */}
        <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.02em] tabular-nums text-[#374151]">
          {heroSov}%
        </span>
        <span className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
          your share
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
        {delta}pp
      </span>
      <span className="font-sans text-[#6B7280]">vs. previous 30d</span>
    </span>
  )
}

export function SovHeroPanel({ heroSov, sovDelta, latest }: SovHeroPanelProps) {
  const segments = buildSegments(latest)

  return (
    <section
      aria-labelledby="sov-hero-heading"
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
            Share of voice
          </p>
          {/* STEP-1 — the one blue 64px mono figure */}
          <div className="flex items-end gap-3">
            <span className="font-mono text-[64px] font-medium leading-[0.9] tracking-[-0.03em] tabular-nums text-[#3370FF]">
              {heroSov}%
            </span>
          </div>
          {/* STEP-2 verdict */}
          <h2
            id="sov-hero-heading"
            className="mt-4 max-w-[520px] font-[var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]"
          >
            You hold {heroSov}% of AI answers in your category
          </h2>
          {/* Delta chip */}
          <div className="mt-4">
            <DeltaChip delta={sovDelta} />
          </div>
          {/* STEP-4 body */}
          <p className="mt-4 max-w-[440px] text-[15px] leading-[1.6] text-[#6B7280]">
            This is your slice of every answer engines give for the prompts that matter to your
            business — measured against the field below.
          </p>
        </div>

        {/* RIGHT — 360px donut rail */}
        <div className="flex flex-col items-center gap-5 lg:items-start">
          <Donut segments={segments} heroSov={heroSov} />
          {/* Legend — you + top competitors */}
          <ul className="w-full space-y-1.5">
            {segments.map((seg) => (
              <li key={seg.name} className="flex items-center gap-2 text-[13px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span
                  className={
                    seg.name === 'You'
                      ? 'flex-1 font-medium text-[#0A0A0A]'
                      : 'flex-1 text-[#6B7280]'
                  }
                >
                  {seg.name}
                </span>
                <span className="font-mono tabular-nums text-[#374151]">{seg.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
