'use client'

import { ResponsivePie } from '@nivo/pie'

const BLUE_SHADES = ['#3370FF', '#5A8FFF', '#1E40AF', '#93B4FF', '#60A5FA']

interface NivoDonutData {
  engine: string
  mentions: number
}

interface NivoDonutChartProps {
  data: NivoDonutData[]
}

export function NivoDonutChart({ data }: NivoDonutChartProps) {
  const chartData = data.filter((d) => d.mentions > 0)
  const totalMentions = data.reduce((sum, d) => sum + d.mentions, 0)

  const nivoData = chartData.map((d, i) => ({
    id: d.engine,
    label: d.engine,
    value: d.mentions,
    color: BLUE_SHADES[i % BLUE_SHADES.length],
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">No mentions yet</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-8">
      {/* Donut — larger and more dominant */}
      <div className="relative shrink-0" style={{ width: 260, height: 260 }}>
        <ResponsivePie
          data={nivoData}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          innerRadius={0.62}
          padAngle={2.5}
          cornerRadius={5}
          colors={{ datum: 'data.color' }}
          borderWidth={0}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          animate
          motionConfig="gentle"
          theme={{
            background: 'transparent',
          }}
        />
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold tracking-[-0.02em] tabular-nums text-foreground leading-none">
            {totalMentions}
          </span>
          <span className="text-xs text-muted-foreground mt-1 font-medium">mentions</span>
        </div>
      </div>

      {/* Legend — cleaner with aligned counts */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {chartData.map((d, i) => (
          <div key={d.engine} className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: BLUE_SHADES[i % BLUE_SHADES.length] }}
              aria-hidden="true"
            />
            <span className="text-xs text-foreground flex-1 truncate font-medium">{d.engine}</span>
            <span className="text-xs font-semibold tabular-nums text-foreground shrink-0">
              {d.mentions}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0 w-8 text-right">
              {Math.round((d.mentions / totalMentions) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
