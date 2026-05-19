'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TrendDataPoint {
  label: string
  score: number
  sentiment: number
}

interface TrendChartProps {
  data: TrendDataPoint[]
  className?: string
}

const CHART_H = 120
const PADDING = { top: 8, right: 8, bottom: 24, left: 28 }

function buildPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
}

function buildArea(points: Array<{ x: number; y: number }>, h: number): string {
  if (points.length < 2) return ''
  const bottom = h - PADDING.bottom
  const line = buildPath(points)
  return `${line} L${points[points.length - 1].x.toFixed(1)},${bottom} L${points[0].x.toFixed(1)},${bottom} Z`
}

interface TooltipState {
  x: number
  y: number
  point: TrendDataPoint
  visible: boolean
}

function CustomTooltip({ state }: { state: TooltipState }) {
  if (!state.visible) return null
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-gray-100 bg-white px-2.5 py-2 shadow-lg text-xs"
      style={{
        left: state.x + 12,
        top: state.y - 32,
        transform: state.x > 200 ? 'translateX(-110%)' : undefined,
      }}
    >
      <p className="mb-1 font-semibold text-gray-700">{state.point.label}</p>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#3370FF]" />
        <span className="text-gray-500">Score:</span>
        <span className="font-semibold text-gray-800">{state.point.score}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="h-2 w-2 rounded-full bg-[#10B981]" />
        <span className="text-gray-500">Sentiment:</span>
        <span className="font-semibold text-gray-800">{state.point.sentiment}%</span>
      </div>
    </div>
  )
}

export function TrendChart({ data, className }: TrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [tooltip, setTooltip] = useState<TooltipState>({
    x: 0,
    y: 0,
    point: data[0] ?? { label: '', score: 0, sentiment: 0 },
    visible: false,
  })

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const innerW = width - PADDING.left - PADDING.right
  const innerH = CHART_H - PADDING.top - PADDING.bottom

  const scoreMin = Math.max(0, Math.min(...data.map((d) => d.score)) - 10)
  const scoreMax = Math.min(100, Math.max(...data.map((d) => d.score)) + 10)
  const scoreRange = scoreMax - scoreMin || 1

  const sentMin = Math.max(0, Math.min(...data.map((d) => d.sentiment)) - 10)
  const sentMax = Math.min(100, Math.max(...data.map((d) => d.sentiment)) + 10)
  const sentRange = sentMax - sentMin || 1

  const scorePoints = data.map((d, i) => ({
    x: PADDING.left + (i / (data.length - 1)) * innerW,
    y: PADDING.top + (1 - (d.score - scoreMin) / scoreRange) * innerH,
  }))

  const sentPoints = data.map((d, i) => ({
    x: PADDING.left + (i / (data.length - 1)) * innerW,
    y: PADDING.top + (1 - (d.sentiment - sentMin) / sentRange) * innerH,
  }))

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!containerRef.current || data.length === 0) return
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const relX = mouseX - PADDING.left
      const idx = Math.round((relX / innerW) * (data.length - 1))
      const clamped = Math.max(0, Math.min(data.length - 1, idx))
      setTooltip({
        x: mouseX,
        y: e.clientY - rect.top,
        point: data[clamped],
        visible: true,
      })
    },
    [data, innerW],
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }))
  }, [])

  if (data.length < 2) {
    return (
      <div
        className={cn(
          'flex h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50',
          className,
        )}
      >
        <p className="text-xs text-gray-400">Run 2+ scans to see trend</p>
      </div>
    )
  }

  // Y-axis tick labels
  const yTicks = [scoreMin, Math.round((scoreMin + scoreMax) / 2), scoreMax]

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <CustomTooltip state={tooltip} />
      {width > 0 && (
        <svg
          width={width}
          height={CHART_H}
          viewBox={`0 0 ${width} ${CHART_H}`}
          aria-label="Visibility score and sentiment trend chart"
          role="img"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        >
          <defs>
            <linearGradient id="trendScoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3370FF" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3370FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines */}
          {yTicks.map((tick, i) => {
            const y = PADDING.top + (1 - (tick - scoreMin) / scoreRange) * innerH
            return (
              <g key={i}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={width - PADDING.right}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={PADDING.left - 4}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9CA3AF"
                  fontFamily="inherit"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = PADDING.left + (i / (data.length - 1)) * innerW
            const bottom = CHART_H - 6
            return (
              <text
                key={i}
                x={x}
                y={bottom}
                textAnchor="middle"
                fontSize="9"
                fill="#9CA3AF"
                fontFamily="inherit"
              >
                {d.label}
              </text>
            )
          })}

          {/* Score area fill */}
          <path d={buildArea(scorePoints, CHART_H)} fill="url(#trendScoreGrad)" />

          {/* Sentiment line */}
          <path
            d={buildPath(sentPoints)}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="4 3"
            opacity="0.7"
          />

          {/* Score line */}
          <path
            d={buildPath(scorePoints)}
            stroke="#3370FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Score dots */}
          {scorePoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill="#3370FF"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {/* Hover vertical line */}
          {tooltip.visible && (
            <line
              x1={tooltip.x}
              y1={PADDING.top}
              x2={tooltip.x}
              y2={CHART_H - PADDING.bottom}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
          )}
        </svg>
      )}

      {/* Legend */}
      <div className="mt-1 flex items-center gap-4 ps-7">
        <div className="flex items-center gap-1.5">
          <span className="block h-0.5 w-4 rounded-full bg-[#3370FF]" aria-hidden="true" />
          <span className="text-[10px] text-gray-400">Visibility score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="block h-0.5 w-4 rounded-full bg-[#10B981] opacity-70" aria-hidden="true" />
          <span className="text-[10px] text-gray-400">Sentiment</span>
        </div>
      </div>
    </div>
  )
}
