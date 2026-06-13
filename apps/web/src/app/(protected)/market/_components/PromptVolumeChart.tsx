'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useIntentVisible } from './use-market-filter'
import {
  INTENT_ORDER,
  INTENT_LABELS,
  AGENT_VIOLET,
  formatVolume,
  type IntentKey,
} from './market-colors'
import type { MarketPromptRow } from '@/lib/demo/surfaces/types'

/**
 * PromptVolumeChart — TIER-2, dominant full-width.
 *
 * Stacked AreaChart of category monthly query volume over the last 8 weeks,
 * split by INTENT (informational / transactional / navigational). The series
 * are derived deterministically from the fixture's per-intent totals with a
 * smooth real growth ramp — never fabricated noise.
 *
 * Violet <ReferenceLine> marks the week an agent promoted content for a prompt
 * cluster — the ONLY violet on the page besides the Tracking status pill.
 *
 * Linked-instrument: toggling an intent in the rail fades its <Area> to ~18%
 * via a 200ms opacity transition. No refetch, no remount.
 */

interface PromptVolumeChartProps {
  prompts: MarketPromptRow[]
}

// Desaturated data-viz SERIES band (DESIGN-VISION §3) — same tokens as the hero
// donut so chart + donut read as ONE instrument. Hex (not CSS var) because
// recharts gradient stops need a resolvable color string.
const INTENT_AREA: Record<IntentKey, string> = {
  informational: '#3370FF', // data-1
  transactional: '#10B981', // data-4
  navigational: '#06B6D4', // data-3
}

// 8 weekly buckets; the final bucket equals the fixture's current per-intent
// total. Earlier weeks ramp up smoothly (real growth, not random noise).
const WEEKS = 8
const RAMP = [0.86, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98, 1.0]

interface ChartRow {
  week: string
  informational: number
  transactional: number
  navigational: number
}

const AGENT_WEEK = 'W6'

function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const total = payload.reduce((s, p) => s + (typeof p.value === 'number' ? p.value : 0), 0)
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
        {label}
      </p>
      <ul className="space-y-0.5">
        {payload.map((p) => (
          <li key={p.dataKey} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-[#374151]">
              {INTENT_LABELS[p.dataKey as IntentKey] ?? p.name}
            </span>
            <span className="font-mono tabular-nums text-[#0A0A0A]">{formatVolume(p.value)}</span>
          </li>
        ))}
        <li className="mt-1 flex items-center gap-2 border-t border-[#F0F1F3] pt-1 text-[12px]">
          <span className="flex-1 font-medium text-[#0A0A0A]">Total</span>
          <span className="font-mono tabular-nums text-[#0A0A0A]">{formatVolume(total)}</span>
        </li>
      </ul>
    </div>
  )
}

export function PromptVolumeChart({ prompts }: PromptVolumeChartProps) {
  const intentVisible = useIntentVisible()

  const rows = useMemo<ChartRow[]>(() => {
    const totals: Record<IntentKey, number> = {
      informational: 0,
      transactional: 0,
      navigational: 0,
    }
    for (const p of prompts) totals[p.intent] += p.monthlyVolume
    return Array.from({ length: WEEKS }, (_, i) => ({
      week: `W${i + 1}`,
      informational: Math.round(totals.informational * RAMP[i]),
      transactional: Math.round(totals.transactional * RAMP[i]),
      navigational: Math.round(totals.navigational * RAMP[i]),
    }))
  }, [prompts])

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Category demand
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          Estimated monthly query volume across your vertical, by intent.{' '}
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-3 rounded-full align-middle"
              style={{ backgroundColor: AGENT_VIOLET }}
              aria-hidden="true"
            />
            <span className="text-[#6E56F0]">marks an agent run.</span>
          </span>
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 24, right: 12, bottom: 4, left: -8 }}>
            <defs>
              {INTENT_ORDER.map((intent) => (
                <linearGradient key={intent} id={`grad-${intent}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INTENT_AREA[intent]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={INTENT_AREA[intent]} stopOpacity={0.08} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--color-data-grid)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={40}
            />
            <Tooltip content={<VolumeTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />

            {/* Violet agent-run marker — the only violet on the chart. The
                label is anchored tight to the W6 line top-left (not floated in
                dead center) so it reads as "this line = an agent run" (M6). */}
            <ReferenceLine
              x={AGENT_WEEK}
              stroke="rgba(110,86,240,0.55)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={(props: { viewBox?: { x?: number; y?: number } }) => {
                const x = props.viewBox?.x ?? 0
                const y = props.viewBox?.y ?? 0
                const text = 'Agent promoted content'
                const w = text.length * 5.6 + 16
                return (
                  <g transform={`translate(${x - w - 6}, ${y + 2})`}>
                    <rect
                      width={w}
                      height={18}
                      rx={9}
                      fill="#EEEAFD"
                    />
                    <circle cx={9} cy={9} r={3} fill="#6E56F0" />
                    <text
                      x={17}
                      y={13}
                      fontSize={10}
                      fontWeight={600}
                      fill="#6E56F0"
                      fontFamily="var(--font-sans)"
                    >
                      {text}
                    </text>
                  </g>
                )
              }}
            />

            {INTENT_ORDER.map((intent) => {
              const visible = intentVisible(intent)
              return (
                <Area
                  key={intent}
                  type="monotone"
                  dataKey={intent}
                  name={INTENT_LABELS[intent]}
                  stackId="volume"
                  stroke={INTENT_AREA[intent]}
                  strokeWidth={1.5}
                  fill={`url(#grad-${intent})`}
                  fillOpacity={visible ? 1 : 0.18}
                  strokeOpacity={visible ? 1 : 0.25}
                  isAnimationActive={false}
                  style={{ transition: 'fill-opacity 200ms ease-out, stroke-opacity 200ms ease-out' }}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
