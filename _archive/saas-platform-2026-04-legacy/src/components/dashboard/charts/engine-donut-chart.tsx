'use client'

import { useRef, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'

interface EngineDonutData {
  engine: string
  mentions: number
}

interface EngineDonutChartProps {
  data: EngineDonutData[]
}

// Fixed color map for Recharts — cannot use CSS variables in SVG fill attributes
const ENGINE_CHART_COLORS: Record<string, string> = {
  ChatGPT: '#03045e',
  Gemini: '#0077b6',
  Perplexity: '#00b4d8',
  Claude: '#023e8a',
  'Google AI': '#48cae4',
  Grok: '#0096c7',
  'You.com': '#90e0ef',
}

const FALLBACK_COLORS = ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef']

function getEngineColor(engine: string, index: number): string {
  return ENGINE_CHART_COLORS[engine] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function CustomTooltip({ active, payload }: any) {
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
