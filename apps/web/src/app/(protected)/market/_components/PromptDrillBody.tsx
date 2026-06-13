'use client'

import { Check, ArrowRight } from 'lucide-react'
import { DrillSubRow } from '@/components/console/AnalyticsDrillDrawer'
import { DemographicBars } from './DemographicBars'
import { COMPETITOR_GREYS, formatVolume } from './market-colors'
import type { MarketPromptRow, MarketPromptDrill } from '@/lib/demo/surfaces/types'

/**
 * PromptDrillBody — the per-prompt drill drawer content.
 *
 * Rows (DrillSubRow / TIER-3 inset):
 *  1. Volume trend — a blue polyline of the last ~12 weeks (real fixture points;
 *     flat baseline when absent — never fabricated).
 *  2. Audience — PASTEL demographic distribution bars (age / income / gender).
 *  3. Who's cited — a fan-out: per competitor cited for this prompt (grey), you
 *     highlighted blue. When nobody owns it, a designed "Nobody owns this yet"
 *     note + a blue "Track this prompt" CTA repeating the action.
 */

interface PromptDrillBodyProps {
  prompt: MarketPromptRow
  drill: MarketPromptDrill | null
}

const SPARK_W = 380
const SPARK_H = 64
const SPARK_PAD = 6

/** Blue volume sparkline from real fixture points; flat baseline if absent. */
function VolumeTrend({ points }: { points: number[] | null }) {
  if (!points || points.length < 2) {
    return (
      <svg
        width="100%"
        height={SPARK_H}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1={0}
          y1={SPARK_H / 2}
          x2={SPARK_W}
          y2={SPARK_H / 2}
          stroke="#E5E7EB"
          strokeWidth={1}
        />
      </svg>
    )
  }
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const toY = (v: number) =>
    SPARK_H - SPARK_PAD - ((v - min) / range) * (SPARK_H - SPARK_PAD * 2)
  const step = SPARK_W / (points.length - 1)
  const line = points.map((v, i) => `${i * step},${toY(v)}`).join(' ')
  const area = `0,${SPARK_H} ${line} ${SPARK_W},${SPARK_H}`

  return (
    <div>
      <svg
        width="100%"
        height={SPARK_H}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="drill-vol-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3370FF" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#3370FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#drill-vol-grad)" />
        <polyline
          points={line}
          fill="none"
          stroke="#3370FF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span className="text-[#9CA3AF]">~12 weeks</span>
        <span className="font-mono tabular-nums text-[#374151]">
          {formatVolume(points[points.length - 1])}/mo
        </span>
      </div>
    </div>
  )
}

function WhoCited({
  prompt,
  citedBy,
  onTrack,
}: {
  prompt: MarketPromptRow
  citedBy: string[]
  onTrack: () => void
}) {
  if (prompt.cited || citedBy.length > 0) {
    const youName = 'Bright Smile Dental'
    const list = prompt.cited && !citedBy.includes(youName) ? [youName, ...citedBy] : citedBy
    return (
      <ul className="space-y-2">
        {list.map((name) => {
          const isYou = name === youName
          return (
            <li key={name} className="flex items-center gap-2 text-[13px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: isYou ? '#3370FF' : COMPETITOR_GREYS[name] ?? '#C4C8CF' }}
                aria-hidden="true"
              />
              <span className={isYou ? 'font-medium text-[#0A0A0A]' : 'text-[#6B7280]'}>
                {isYou ? 'You' : name}
              </span>
              {isYou && (
                <Check className="h-3.5 w-3.5 text-[#0E9E6E]" strokeWidth={2} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  // Uncited — the designed whitespace note + repeated Track CTA.
  return (
    <div className="rounded-lg bg-status-warning px-3.5 py-3">
      <p className="text-[13px] font-medium text-[#0A0A0A]">Nobody owns this yet</p>
      <p className="mt-0.5 text-[12px] leading-[1.5] text-[#6B7280]">
        No competitor is cited for this prompt — claim it before they do.
      </p>
      <button
        type="button"
        onClick={onTrack}
        className="mt-3 inline-flex items-center gap-1 rounded-md bg-[#3370FF] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1f5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      >
        Track this prompt
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}

export function PromptDrillBody({ prompt, drill }: PromptDrillBodyProps) {
  const demographics = drill?.demographics ?? null
  const citedBy = drill?.whoCited ?? []

  const handleTrack = () => {
    // Optimistic, mock-only — the prompt becomes tracked in the live table flip.
    // No backend in Phase 1B; this CTA mirrors the row-level Track affordance.
  }

  return (
    <>
      <DrillSubRow label="Volume trend">
        <VolumeTrend points={drill?.volumeTrend ?? null} />
      </DrillSubRow>

      <DrillSubRow label="Audience">
        {demographics ? (
          <DemographicBars demographics={demographics} compact />
        ) : (
          <p className="text-[13px] text-[#9CA3AF]">
            Audience data appears once this prompt is tracked.
          </p>
        )}
      </DrillSubRow>

      <DrillSubRow label="Who's cited">
        <WhoCited prompt={prompt} citedBy={citedBy} onTrack={handleTrack} />
      </DrillSubRow>
    </>
  )
}
