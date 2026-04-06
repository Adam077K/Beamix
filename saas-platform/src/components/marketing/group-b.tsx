'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { VisibilityTrendChart } from '@/components/dashboard/charts/visibility-trend-chart'
import { EngineDonutChart } from '@/components/dashboard/charts/engine-donut-chart'
import { SparklineCard } from '@/components/dashboard/charts/sparkline-card'
import { ScanHeatmap } from '@/components/dashboard/charts/scan-heatmap'
import { cn } from '@/lib/utils'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_SCAN_HISTORY = [
  { created_at: '2026-03-01', overall_score: 42, mentions_count: 8, avg_position: 4.2, sentiment_positive_pct: 55 },
  { created_at: '2026-03-05', overall_score: 48, mentions_count: 12, avg_position: 3.8, sentiment_positive_pct: 62 },
  { created_at: '2026-03-10', overall_score: 55, mentions_count: 15, avg_position: 3.5, sentiment_positive_pct: 68 },
  { created_at: '2026-03-15', overall_score: 52, mentions_count: 14, avg_position: 3.6, sentiment_positive_pct: 65 },
  { created_at: '2026-03-20', overall_score: 61, mentions_count: 18, avg_position: 3.2, sentiment_positive_pct: 71 },
  { created_at: '2026-03-25', overall_score: 67, mentions_count: 22, avg_position: 2.9, sentiment_positive_pct: 75 },
  { created_at: '2026-03-28', overall_score: 72, mentions_count: 26, avg_position: 2.7, sentiment_positive_pct: 78 },
  { created_at: '2026-03-30', overall_score: 75, mentions_count: 28, avg_position: 2.5, sentiment_positive_pct: 81 },
]

const DEMO_ENGINE_DATA = [
  { engine: 'ChatGPT', mentions: 8 },
  { engine: 'Gemini', mentions: 5 },
  { engine: 'Perplexity', mentions: 7 },
  { engine: 'Google AI', mentions: 3 },
  { engine: 'Claude', mentions: 3 },
]

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

  const scoreSparkData = DEMO_SCAN_HISTORY.map((d) => d.overall_score ?? 0)
  const mentionsSparkData = DEMO_SCAN_HISTORY.map((d) => d.mentions_count)
  const positionSparkData = DEMO_SCAN_HISTORY.map((d) => d.avg_position ?? 0)

  return (
    <div className="flex flex-col gap-4">

      {/* B1: Visibility Trend */}
      <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">AI visibility score</p>
            </div>
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
                <span className="text-lg font-semibold tabular-nums text-foreground">75.48%</span>
                <span className="text-xs font-medium text-emerald-600">+33</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
        </CardContent>
      </Card>

      {/* B2 + B4: Donut + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* B2: Engine Donut */}
        <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-0 pt-5 px-5">
            <p className="text-sm font-medium text-foreground">Engine Mentions</p>
            <p className="text-xs text-muted-foreground">Which AI engines mention your brand</p>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            <EngineDonutChart data={DEMO_ENGINE_DATA} />
          </CardContent>
        </Card>

        {/* B4: Scan Heatmap */}
        <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-0 pt-5 px-5">
            <p className="text-sm font-medium text-foreground">Scan Activity</p>
            <p className="text-xs text-muted-foreground">Your scanning consistency</p>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-3">
            <ScanHeatmap scanDates={DEMO_SCAN_DATES} />
          </CardContent>
        </Card>
      </div>

      {/* B3: Sparkline metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SparklineCard
          label="Visibility Score"
          value={75}
          delta={33}
          sparkData={scoreSparkData}
          accentColor="#3370FF"
        />
        <SparklineCard
          label="AI Mentions"
          value={28}
          delta={20}
          sparkData={mentionsSparkData}
          accentColor="#10B981"
        />
        <SparklineCard
          label="Avg Position"
          value="2.5"
          delta={-1.7}
          sparkData={positionSparkData}
          accentColor="#F59E0B"
          inverseDelta
        />
      </div>
    </div>
  )
}
