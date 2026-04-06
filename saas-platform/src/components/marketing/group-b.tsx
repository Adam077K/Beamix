'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartCard } from '@/components/ui/chart-card'
import { VisibilityTrendChart } from '@/components/dashboard/charts/visibility-trend-chart'
import { EngineDonutChart } from '@/components/dashboard/charts/engine-donut-chart'
import { SparklineCard } from '@/components/dashboard/charts/sparkline-card'
import { ScanHeatmap } from '@/components/dashboard/charts/scan-heatmap'

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

// ─── Group B component ────────────────────────────────────────────────────────

export function GroupB() {
  const scoreSparkData = DEMO_SCAN_HISTORY.map((d) => d.overall_score ?? 0)
  const mentionsSparkData = DEMO_SCAN_HISTORY.map((d) => d.mentions_count)
  const positionSparkData = DEMO_SCAN_HISTORY.map((d) => d.avg_position ?? 0)

  return (
    <div className="flex flex-col gap-4">

      {/* B1: Visibility Trend — wrapped in ChartCard */}
      <ChartCard
        title="AI Visibility Score"
        subtitle="Track your brand performance over time"
        periods={['7d', '30d', '90d']}
        period="30d"
        contentClassName="px-4 pb-4"
      >
        <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
      </ChartCard>

      {/* B2 + B4: Donut + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* B2: Engine Donut — Shadcn Card with proper header */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-1">
            <CardTitle className="text-base font-semibold">Engine Mentions</CardTitle>
            <p className="text-xs text-muted-foreground">Which AI engines mention your brand</p>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <EngineDonutChart data={DEMO_ENGINE_DATA} />
          </CardContent>
        </Card>

        {/* B4: Scan Heatmap — ChartCard */}
        <ChartCard
          title="Scan Activity"
          subtitle="Your scanning consistency over 13 weeks"
          contentClassName="px-4 pb-4"
        >
          <ScanHeatmap scanDates={DEMO_SCAN_DATES} />
        </ChartCard>
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
