'use client'

import { useRef, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, type TooltipProps } from 'recharts'

interface EngineDonutData {
  engine: string
  mentions: number
}

interface EngineDonutChartProps {
  data: EngineDonutData[]
}

// Fixed color map for Recharts — cannot use CSS variables in SVG fill attributes
const ENGINE_CHART_COLORS: Record<string, string> = {
  ChatGPT: '#10B981',
  Gemini: '#3370FF',
  Perplexity: '#8B5CF6',
  Claude: '#F59E0B',
  'Google AI': '#3B82F6',
  Grok: '#EF4444',
  'You.com': '#06B6D4',
}

const FALLBACK_COLORS = ['#3370FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#3B82F6']

function getEngineColor(engine: string, index: number): string {
  return ENGINE_CHART_COLORS[engine] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-900">{item.name}</p>
      <p className="text-slate-500 mt-0.5">
        {item.value} mention{item.value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function EngineDonutChart({ data }: EngineDonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const CHART_HEIGHT = 200
  const DONUT_WIDTH = 160

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const totalMentions = data.reduce((sum, d) => sum + d.mentions, 0)
  const chartData = data.filter((d) => d.mentions > 0)

  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-center">
        <p className="text-sm text-slate-500">No mentions yet</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex items-center gap-4" style={{ height: CHART_HEIGHT }}>
      {/* Donut chart */}
      <div className="shrink-0 relative" style={{ width: DONUT_WIDTH, height: CHART_HEIGHT }}>
        <PieChart width={DONUT_WIDTH} height={CHART_HEIGHT}>
          <Pie
            data={chartData}
            dataKey="mentions"
            nameKey="engine"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.engine}
                fill={getEngineColor(entry.engine, index)}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tabular-nums text-slate-900 leading-none">
            {totalMentions}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">mentions</span>
        </div>
      </div>

      {/* Right-side legend */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {chartData.slice(0, 6).map((entry, index) => (
          <div key={entry.engine} className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: getEngineColor(entry.engine, index) }}
                aria-hidden="true"
              />
              <span className="text-xs text-slate-500 truncate">{entry.engine}</span>
            </span>
            <span className="text-xs font-medium tabular-nums text-slate-900 shrink-0">
              {entry.mentions}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
