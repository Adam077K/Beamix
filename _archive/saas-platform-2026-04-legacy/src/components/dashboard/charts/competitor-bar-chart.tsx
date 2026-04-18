'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Button } from '@/components/ui/button'

interface CompetitorBarData {
  name: string
  score: number
  isUser?: boolean
}

interface CompetitorBarChartProps {
  data: CompetitorBarData[]
  hasRealData?: boolean
}

const MOCK_DATA: CompetitorBarData[] = [
  { name: 'Competitor A', score: 72 },
  { name: 'Competitor B', score: 61 },
  { name: 'Competitor C', score: 44 },
  { name: 'Competitor D', score: 38 },
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-900">{item.payload?.name}</p>
      <p className="text-slate-500 mt-0.5">Score: {item.value}</p>
    </div>
  )
}

export function CompetitorBarChart({ data, hasRealData = false }: CompetitorBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const CHART_HEIGHT = 180

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const displayData = hasRealData ? data : MOCK_DATA
  const chartData = [...displayData].sort((a, b) => b.score - a.score)

  return (
    <div ref={containerRef} className="relative" style={{ height: CHART_HEIGHT }}>
      {containerWidth > 0 && (
        <BarChart
          layout="vertical"
          width={containerWidth}
          height={CHART_HEIGHT}
          data={chartData}
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.8 }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isUser ? '#3370FF' : '#CBD5E1'}
              />
            ))}
          </Bar>
        </BarChart>
      )}

      {/* Frosted glass overlay when no real data */}
      {!hasRealData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl backdrop-blur-[2px] bg-white/70">
          <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <p className="text-xs font-medium text-slate-500">Estimated data</p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7 rounded-lg text-xs border-blue-200 text-[#3370FF] hover:bg-blue-50"
          >
            <Link href="/dashboard/agents">Unlock real data</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
