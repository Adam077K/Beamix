'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { SovWeek } from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 160
const CHART_PAD_TOP = 12
const CHART_PAD_BOTTOM = 24
const INNER_HEIGHT = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM

const LINE_COLORS: Record<string, string> = {
  you: '#3370FF',
  _0: '#ef4444',
  _1: '#f59e0b',
  _2: '#8b5cf6',
}

function getLineColor(key: string, index: number): string {
  if (key === 'you') return LINE_COLORS['you']!
  return LINE_COLORS[`_${index}`] ?? '#9ca3af'
}

// ─── Event marker ─────────────────────────────────────────────────────────────

interface EventMarker {
  weekIndex: number
  label: string
  deltaLabel: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SovTrendChartProps {
  trend: SovWeek[]
  competitorNames: string[]
  events?: EventMarker[]
  className?: string
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipState {
  x: number
  y: number
  weekIndex: number
}

// ─── Main chart ──────────────────────────────────────────────────────────────

export function SovTrendChart({
  trend,
  competitorNames,
  events = [],
  className,
}: SovTrendChartProps) {
  const [tooltip, setTooltip] = React.useState<TooltipState | null>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [svgWidth, setSvgWidth] = React.useState(600)

  React.useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setSvgWidth(w)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  if (!trend.length) return null

  const PAD_LEFT = 32
  const PAD_RIGHT = 16
  const innerWidth = svgWidth - PAD_LEFT - PAD_RIGHT

  // Collect all values across all series for shared scale
  const allValues = trend.flatMap((w) => [
    w.you,
    ...competitorNames.map((n) => w.competitors[n] ?? 0),
  ])
  const minVal = Math.max(0, Math.floor(Math.min(...allValues) - 2))
  const maxVal = Math.min(100, Math.ceil(Math.max(...allValues) + 4))
  const range = maxVal - minVal || 1

  function xOf(i: number) {
    return PAD_LEFT + (i / (trend.length - 1)) * innerWidth
  }
  function yOf(v: number) {
    return CHART_PAD_TOP + INNER_HEIGHT - ((v - minVal) / range) * INNER_HEIGHT
  }

  // Y-axis grid lines
  const gridValues = Array.from({ length: 5 }, (_, i) =>
    Math.round(minVal + ((maxVal - minVal) / 4) * i),
  )

  // Build line paths
  const buildPath = (values: number[]) => {
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`)
      .join(' ')
  }

  // Build area path
  const buildArea = (values: number[]) => {
    const line = values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`)
      .join(' ')
    const bottom = `L ${xOf(values.length - 1).toFixed(1)} ${yOf(minVal).toFixed(1)} L ${PAD_LEFT} ${yOf(minVal).toFixed(1)} Z`
    return line + ' ' + bottom
  }

  const seriesKeys = ['you', ...competitorNames]

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left - PAD_LEFT
    const frac = Math.max(0, Math.min(1, relX / innerWidth))
    const weekIndex = Math.round(frac * (trend.length - 1))
    const x = xOf(weekIndex)
    const y = yOf(trend[weekIndex]?.you ?? 0)
    setTooltip({ x, y, weekIndex })
  }

  return (
    <div className={cn('', className)}>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0a0a0a]">
            Share of voice — 12 weeks
          </h2>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Weekly citation rate across all tracked queries
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {seriesKeys.map((key, i) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="h-0.5 w-6 rounded-full"
                style={{ backgroundColor: getLineColor(key, i - 1) }}
              />
              <span className="text-[11px] text-[#6b7280]">
                {key === 'you' ? 'You' : key}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <svg
          ref={svgRef}
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${svgWidth} ${CHART_HEIGHT}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          role="img"
          aria-label="Share of voice trend over 12 weeks"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {gridValues.map((v) => (
            <g key={v}>
              <line
                x1={PAD_LEFT}
                y1={yOf(v).toFixed(1)}
                x2={svgWidth - PAD_RIGHT}
                y2={yOf(v).toFixed(1)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 4}
                y={parseFloat(yOf(v).toFixed(1)) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="ui-monospace, monospace"
              >
                {v}%
              </text>
            </g>
          ))}

          {/* X-axis labels (every 3 weeks) */}
          {trend.map((w, i) => {
            if (i % 3 !== 0 && i !== trend.length - 1) return null
            return (
              <text
                key={i}
                x={xOf(i).toFixed(1)}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {w.week}
              </text>
            )
          })}

          {/* Area fill for "You" */}
          <defs>
            <linearGradient id="sov-you-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3370FF" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#3370FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d={buildArea(trend.map((w) => w.you))}
            fill="url(#sov-you-area)"
          />

          {/* Competitor lines */}
          {competitorNames.map((name, i) => (
            <path
              key={name}
              d={buildPath(trend.map((w) => w.competitors[name] ?? 0))}
              fill="none"
              stroke={getLineColor('_x', i)}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
              opacity="0.7"
            />
          ))}

          {/* Your line on top */}
          <path
            d={buildPath(trend.map((w) => w.you))}
            fill="none"
            stroke="#3370FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Event markers */}
          {events.map((ev) => {
            const x = xOf(ev.weekIndex)
            const y = yOf(trend[ev.weekIndex]?.you ?? 0)
            return (
              <g key={ev.weekIndex}>
                <line
                  x1={x}
                  y1={CHART_PAD_TOP}
                  x2={x}
                  y2={yOf(minVal)}
                  stroke="#3370FF"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.4"
                />
                <circle cx={x} cy={y} r="5" fill="white" stroke="#3370FF" strokeWidth="2" />
                {/* Label above */}
                <foreignObject
                  x={x - 60}
                  y={CHART_PAD_TOP - 4}
                  width="120"
                  height="32"
                >
                  <div
                    className="text-center"
                    style={{ fontSize: 10, color: '#3370FF', fontWeight: 600 }}
                  >
                    {ev.deltaLabel}
                  </div>
                </foreignObject>
              </g>
            )
          })}

          {/* Tooltip crosshair */}
          {tooltip && (
            <g>
              <line
                x1={tooltip.x}
                y1={CHART_PAD_TOP}
                x2={tooltip.x}
                y2={yOf(minVal)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {seriesKeys.map((key, idx) => {
                const val =
                  key === 'you'
                    ? trend[tooltip.weekIndex]?.you ?? 0
                    : trend[tooltip.weekIndex]?.competitors[key] ?? 0
                return (
                  <circle
                    key={key}
                    cx={tooltip.x}
                    cy={yOf(val)}
                    r="4"
                    fill={getLineColor(key, idx - 1)}
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
            </g>
          )}
        </svg>

        {/* Tooltip box */}
        {tooltip && trend[tooltip.weekIndex] && (
          <div
            className="absolute pointer-events-none bg-white rounded-lg border border-[#e5e7eb] shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-3 py-2.5 text-[11px] z-10 min-w-[140px]"
            style={{
              left: Math.min(
                tooltip.x + 12,
                svgWidth - PAD_RIGHT - 160,
              ),
              top: tooltip.y - 60,
              position: 'absolute',
            }}
          >
            <p className="font-semibold text-[#0a0a0a] mb-1.5 text-[11px]">
              Week of {trend[tooltip.weekIndex]?.week}
            </p>
            {seriesKeys.map((key, i) => {
              const val =
                key === 'you'
                  ? trend[tooltip.weekIndex]!.you
                  : trend[tooltip.weekIndex]!.competitors[key] ?? 0
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[#6b7280]">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: getLineColor(key, i - 1) }}
                    />
                    {key === 'you' ? 'You' : key}
                  </span>
                  <span className="font-semibold tabular-nums text-[#0a0a0a]">
                    {val}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
