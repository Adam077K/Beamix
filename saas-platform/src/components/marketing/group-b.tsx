'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BlueTrendChart } from '@/components/marketing/charts/blue-trend-chart'
import { BlueDonutChart } from '@/components/marketing/charts/blue-donut-chart'
import { SparklineCard } from '@/components/dashboard/charts/sparkline-card'
import { ScanHeatmap } from '@/components/dashboard/charts/scan-heatmap'
import { cn } from '@/lib/utils'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_SCAN_HISTORY = [
  { created_at: '2026-03-01', overall_score: 42 },
  { created_at: '2026-03-05', overall_score: 48 },
  { created_at: '2026-03-10', overall_score: 55 },
  { created_at: '2026-03-15', overall_score: 52 },
  { created_at: '2026-03-20', overall_score: 61 },
  { created_at: '2026-03-25', overall_score: 67 },
  { created_at: '2026-03-28', overall_score: 72 },
  { created_at: '2026-03-30', overall_score: 75 },
]

const DEMO_ENGINE_DATA = [
  { engine: 'ChatGPT', mentions: 8 },
  { engine: 'Gemini', mentions: 5 },
  { engine: 'Perplexity', mentions: 7 },
  { engine: 'Google AI', mentions: 3 },
  { engine: 'Claude', mentions: 3 },
]

const DEMO_SPARKLINE_SCORES = [42, 48, 55, 52, 61, 67, 72, 75]
const DEMO_SPARKLINE_MENTIONS = [8, 12, 15, 14, 18, 22, 26, 28]
const DEMO_SPARKLINE_POSITIONS = [4.2, 3.8, 3.5, 3.6, 3.2, 2.9, 2.7, 2.5]

const DEMO_SCAN_DATES = [
  '2026-01-05', '2026-01-12', '2026-01-19', '2026-01-26',
  '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23',
  '2026-03-01', '2026-03-05', '2026-03-10', '2026-03-15',
  '2026-03-20', '2026-03-25', '2026-03-28', '2026-03-30',
]

const PERIODS = ['7d', '30d', '90d'] as const
type Period = (typeof PERIODS)[number]

// ─── Group B component ────────────────────────────────────────────────────────

export function GroupB() {
  const [period, setPeriod] = useState<Period>('30d')

  return (
    <div className="flex flex-col gap-3">

      {/* B1: Visibility Trend */}
      <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">AI visibility score</p>
            <div className="flex items-center gap-3 shrink-0">
              {/* Period toggle */}
              <div className="flex items-center gap-0.5" role="group" aria-label="Select time period">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    aria-pressed={period === p}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                      period === p
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {/* Score display */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold tracking-[-0.02em] tabular-nums text-foreground">75.48%</span>
                <span className="text-xs font-medium text-[#3370FF]">+33</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <BlueTrendChart data={DEMO_SCAN_HISTORY} />
        </CardContent>
      </Card>

      {/* B2 + B4: Donut + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* B2: Engine Donut */}
        <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <CardHeader className="pb-0 pt-5 px-5">
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Engine Mentions</p>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            <BlueDonutChart data={DEMO_ENGINE_DATA} />
          </CardContent>
        </Card>

        {/* B4: Scan Heatmap */}
        <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <CardHeader className="pb-0 pt-5 px-5">
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Scan Activity</p>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            <ScanHeatmap scanDates={DEMO_SCAN_DATES} />
          </CardContent>
        </Card>
      </div>

      {/* B3: Sparkline metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SparklineCard
          label="Visibility Score"
          value={75}
          delta={33}
          sparkData={DEMO_SPARKLINE_SCORES}
          accentColor="#3370FF"
        />
        <SparklineCard
          label="AI Mentions"
          value={28}
          delta={20}
          sparkData={DEMO_SPARKLINE_MENTIONS}
          accentColor="#5A8FFF"
        />
        <SparklineCard
          label="Avg Position"
          value="2.5"
          delta={-1.7}
          sparkData={DEMO_SPARKLINE_POSITIONS}
          accentColor="#1E40AF"
          inverseDelta
        />
      </div>
    </div>
  )
}
