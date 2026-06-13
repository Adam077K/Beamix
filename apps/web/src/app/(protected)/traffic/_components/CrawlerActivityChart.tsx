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
import { useAnalyticsFilter } from '@/components/console/AnalyticsFilterContext'
import { BOT_COLORS, BOT_ORDER, BRAND_BOT, AGENT_VIOLET, shortDate } from './bot-colors'
import type { CrawlerTrend } from '@/lib/demo/surfaces/types'

/**
 * CrawlerActivityChart — TIER-2, dominant full-width.
 *
 * Stacked Recharts AreaChart, one <Area> per bot — crawler hits/day. GPTBot
 * (the brand/aggregate) renders at 2px in #3370FF; other bots at 1.5px in their
 * desaturated band color.
 *
 * Each agentEvent date gets a violet <ReferenceLine> + label — the ONLY violet
 * on the page, marking where the agents acted (sitemap submitted, schema fixed).
 * The markers stay PINNED regardless of which bots are toggled.
 *
 * Linked-instrument (the page signature): toggling a bot in the rail fades its
 * Area to 40% via a 200ms opacity transition (engineOpacity semantics). No
 * refetch, no remount.
 */

interface CrawlerActivityChartProps {
  data: CrawlerTrend[]
}

interface ChartRow {
  date: string
  label: string
  [bot: string]: string | number | null
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
              <span className="font-mono tabular-nums text-[#0A0A0A]">{p.value}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

export function CrawlerActivityChart({ data }: CrawlerActivityChartProps) {
  const { engines } = useAnalyticsFilter()

  const { rows, agentMarkers } = useMemo(() => {
    // Build a date-keyed row, one column per bot.
    const dateMap = new Map<string, ChartRow>()
    const markers = new Map<string, string>()

    for (const series of data) {
      for (const pt of series.points) {
        const existing = dateMap.get(pt.date)
        const row: ChartRow = existing ?? { date: pt.date, label: shortDate(pt.date) }
        row[series.bot] = pt.hits
        dateMap.set(pt.date, row)
        if (pt.agentEvent) markers.set(pt.date, pt.agentEvent.label)
      }
    }

    const rows = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    const agentMarkers: AgentMarker[] = Array.from(markers.entries())
      .map(([date, label]) => ({ date: shortDate(date), label }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return { rows, agentMarkers }
  }, [data])

  return (
    <div className="card-console p-6">
      <div className="mb-5">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Crawler activity
        </p>
        <p className="text-[14px] leading-[1.5] text-[#6B7280]">
          AI-crawler hits on your site, week over week.{' '}
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-3 rounded-full align-middle"
              style={{ backgroundColor: AGENT_VIOLET }}
              aria-hidden="true"
            />
            <span className="text-[#6E56F0]">marks an agent action.</span>
          </span>
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 24, right: 12, bottom: 4, left: -16 }}>
            <defs>
              {BOT_ORDER.map((bot) => {
                const color = BOT_COLORS[bot] ?? '#9CA3AF'
                return (
                  <linearGradient key={bot} id={`crawl-${bot}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                )
              })}
            </defs>
            <CartesianGrid stroke="var(--color-data-grid)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip content={<AgentTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />

            {/* Violet agent-action markers — pinned regardless of bot filter */}
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

            {BOT_ORDER.map((bot) => {
              const isBrand = bot === BRAND_BOT
              const visible = engines[bot] !== false
              const color = BOT_COLORS[bot] ?? '#9CA3AF'
              return (
                <Area
                  key={bot}
                  type="monotone"
                  dataKey={bot}
                  name={bot}
                  stroke={color}
                  strokeWidth={isBrand ? 2 : 1.5}
                  strokeOpacity={visible ? 1 : 0.18}
                  fill={`url(#crawl-${bot})`}
                  fillOpacity={visible ? 1 : 0.15}
                  dot={false}
                  activeDot={visible ? { r: 4, strokeWidth: 0 } : false}
                  connectNulls
                  isAnimationActive={false}
                  style={{ transition: 'stroke-opacity 200ms ease-out, fill-opacity 200ms ease-out' }}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
