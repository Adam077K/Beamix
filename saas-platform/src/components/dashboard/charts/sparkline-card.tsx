'use client'

import { useRef, useState, useEffect } from 'react'
import { LineChart, Line } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { TrendBadge } from '@/components/ui/trend-badge'
import { cn } from '@/lib/utils'

interface SparklineCardProps {
  label: string
  value: string | number
  delta?: number | null
  sparkData: number[]
  accentColor: string
  suffix?: string
  inverseDelta?: boolean
  className?: string
}

export function SparklineCard({
  label,
  value,
  delta,
  sparkData,
  accentColor,
  suffix = '',
  inverseDelta = false,
  className,
}: SparklineCardProps) {
  const sparkRef = useRef<HTMLDivElement>(null)
  const [sparkWidth, setSparkWidth] = useState(0)
  const SPARK_HEIGHT = 40

  useEffect(() => {
    function measure() {
      if (sparkRef.current) {
        setSparkWidth(sparkRef.current.clientWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const chartData = sparkData.map((v, i) => ({ i, v }))

  // For inverse delta (like avg position — lower is better), flip the visual
  const displayDelta = inverseDelta && delta != null ? -delta : delta

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 shadow-none',
        className
      )}
    >
      {/* Top accent stripe */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />
      <CardContent className="p-4 flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold leading-none text-slate-900 tabular-nums">
              {value}
              {suffix && (
                <span className="text-sm font-medium text-slate-400 ml-0.5">{suffix}</span>
              )}
            </span>
          </div>
          {/* Mini sparkline — 40px tall */}
          <div ref={sparkRef} className="h-10 w-20 shrink-0">
            {sparkWidth > 0 && (
              <LineChart width={sparkWidth} height={SPARK_HEIGHT} data={chartData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            )}
          </div>
        </div>
        {displayDelta != null && (
          <div className="mt-1">
            <TrendBadge value={displayDelta} size="sm" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
