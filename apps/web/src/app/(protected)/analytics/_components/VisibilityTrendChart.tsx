'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { ENGINE_COLORS, ENGINE_ORDER, AGENT_VIOLET, shortDate } from './engine-colors'
import type { EngineVisibilityPoint } from '@/lib/demo/surfaces/types'

/**
 * VisibilityTrendChart — TIER-2, dominant full-width.
 *
 * One Recharts <Line> per active engine. ChatGPT (the brand/aggregate) = #3370FF
 * at 2px; other engines render at 1.5px in their desaturated band color.
 *
 * Each agentEvent date gets a violet <ReferenceLine> + 6px dot + 11px label —
 * the only violet on the page, marking where the agents moved the needle.
 *
 * Linked-instrument: toggling an engine in the rail fades its line to 40% via a
 * 200ms opacity transition (engineOpacity). No refetch, no remount.
 */

interface VisibilityTrendChartProps {
  data: EngineVisibilityPoint[]
}

interface ChartRow {
  date: string
  label: string
  agentEvent: string | null
  [engine: string]: string | number | null
}

interface AgentMarker {
  date: string
  label: string
}

function AgentTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
        {label}
      </p>
      <ul className="space-y-0.5">
        {payload
          .filter((p) => typeof p.value === 'number')
          .map((p) => (
            <li key={p.name} className="flex items-center gap-2 text-[12px]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
                aria-hidden="true"
              />
              <span className="flex-1 text-[#374151]">{p.name}</span>
              <span className="font-mono tabular-nums text-[#0A0A0A]">{p.value}%</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

export function VisibilityTrendChart({ data }: VisibilityTrendChartProps) {
  const { engines } = useAnalyticsFilter()

  const { rows, agentMarkers } = useMemo(() => {
    const rows: ChartRow[] = data.map((pt) => {
      const row: ChartRow = {
        date: pt.date,
        label: shortDate(pt.date),
        agentEvent: pt.agentEvent?.label ?? null,
      }
      for (const engine of ENGINE_ORDER) {
        row[engine] = pt.values[engine] ?? null
      }
      return row
    })
    const agentMarkers: AgentMarker[] = data
      .filter((pt) => pt.agentEvent)
      .map((pt) => ({ date: shortDate(pt.date), label: pt.agentEvent!.label }))
    return { rows, agentMarkers }
  }, [data])

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Visibility trend
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          How often each engine surfaces you, week over week.{' '}
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

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 24, right: 12, bottom: 4, left: -16 }}>
            <CartesianGrid stroke="var(--color-data-grid)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              dy={6}
            />
            <YAxis
              domain={[0, 40]}
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip
              content={<AgentTooltip />}
              cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            />

            {/* Violet agent-event markers (the only violet on the page) */}
            {agentMarkers.map((m) => (
              <ReferenceLine
                key={`${m.date}-${m.label}`}
                x={m.date}
                stroke="rgba(110,86,240,0.4)"
                strokeWidth={1}
                label={{
                  value: m.label,
                  position: 'top',
                  fontSize: 11,
                  fill: '#6E56F0',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            ))}

            {ENGINE_ORDER.map((engine) => {
              const isBrand = engine === 'ChatGPT'
              const visible = engines[engine] !== false
              return (
                <Line
                  key={engine}
                  type="monotone"
                  dataKey={engine}
                  name={engine}
                  stroke={ENGINE_COLORS[engine]}
                  strokeWidth={isBrand ? 2 : 1.5}
                  strokeOpacity={visible ? 1 : 0.18}
                  dot={false}
                  activeDot={visible ? { r: 4, strokeWidth: 0 } : false}
                  connectNulls
                  isAnimationActive={false}
                  style={{ transition: 'stroke-opacity 200ms ease-out' }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
