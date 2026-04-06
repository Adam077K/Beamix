'use client'

import { useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BlueTrendChart } from '@/components/marketing/charts/blue-trend-chart'
import { NivoDonutChart } from '@/components/marketing/charts/nivo-donut-chart'
import { cn } from '@/lib/utils'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_SCAN_HISTORY = [
  { created_at: '2026-03-01', overall_score: 23 },
  { created_at: '2026-03-05', overall_score: 31 },
  { created_at: '2026-03-10', overall_score: 40 },
  { created_at: '2026-03-15', overall_score: 38 },
  { created_at: '2026-03-20', overall_score: 52 },
  { created_at: '2026-03-25', overall_score: 63 },
  { created_at: '2026-03-28', overall_score: 70 },
  { created_at: '2026-03-30', overall_score: 75 },
]

const DEMO_ENGINE_DATA = [
  { engine: 'ChatGPT', mentions: 8 },
  { engine: 'Gemini', mentions: 5 },
  { engine: 'Perplexity', mentions: 7 },
  { engine: 'Google AI', mentions: 3 },
  { engine: 'Claude', mentions: 3 },
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
                <NumberFlow
                  value={75.48}
                  suffix="%"
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  className="text-lg font-semibold tracking-[-0.02em] tabular-nums text-foreground"
                />
                <span className="text-xs font-medium text-[#3370FF]">+52</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <BlueTrendChart data={DEMO_SCAN_HISTORY} />
        </CardContent>
      </Card>

      {/* B2: Engine Donut — full width (nivo/pie with spring animations) */}
      <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Engine Mentions</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <NivoDonutChart data={DEMO_ENGINE_DATA} />
        </CardContent>
      </Card>

      {/* B3: Custom stat cards — no uppercase labels */}
      <div className="grid grid-cols-3 gap-3">
        {/* Visibility Score */}
        <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-5">
          <p className="text-xs text-muted-foreground">Visibility Score</p>
          <div className="flex items-baseline gap-2 mt-1">
            <NumberFlow
              value={75}
              className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground"
            />
            <span className="text-xs font-medium text-[#3370FF]">+52</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">out of 100</p>
        </div>

        {/* AI Mentions */}
        <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-5">
          <p className="text-xs text-muted-foreground">AI Mentions</p>
          <div className="flex items-baseline gap-2 mt-1">
            <NumberFlow
              value={28}
              className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground"
            />
            <span className="text-xs font-medium text-[#3370FF]">+20</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">across 7 engines</p>
        </div>

        {/* Avg Position */}
        <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-5">
          <p className="text-xs text-muted-foreground">Avg Position</p>
          <div className="flex items-baseline gap-2 mt-1">
            <NumberFlow
              value={2.5}
              prefix="#"
              format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
              className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground"
            />
            <span className="text-xs font-medium text-[#3370FF]">+1.7</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">in search results</p>
        </div>
      </div>
    </div>
  )
}
