'use client'

import NumberFlow from '@number-flow/react'
import { BlueTrendChart } from '@/components/marketing/charts/blue-trend-chart'
import { NivoDonutChart } from '@/components/marketing/charts/nivo-donut-chart'
import { AnimatedCard, CARD } from '@/components/marketing/card'
import { Stagger, StaggerItem } from '@/components/marketing/motion'

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

// ─── Group B component ────────────────────────────────────────────────────────

export function GroupB() {
  return (
    <div className="flex flex-col gap-4">

      {/* B1: Visibility Trend — chart presentation recipe */}
      <AnimatedCard className="overflow-hidden">
        <div className="flex items-baseline justify-between px-6 pt-6 pb-1">
          <div>
            <p className="text-sm font-medium text-gray-500">AI Visibility Score</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums text-gray-900">
              75.48%
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#3370FF]">
            +52 pts
          </span>
        </div>
        <div className="px-4 pb-4 pt-2">
          <BlueTrendChart data={DEMO_SCAN_HISTORY} />
        </div>
      </AnimatedCard>

      {/* B2: Engine Donut */}
      <AnimatedCard className="p-6" delay={0.1}>
        <p className="text-sm font-medium text-gray-500 mb-5">Engine Mentions</p>
        <NivoDonutChart data={DEMO_ENGINE_DATA} />
      </AnimatedCard>

      {/* B3: Metric cards — unique data (not duplicating hero) */}
      <Stagger className="grid grid-cols-3 gap-4">
        <StaggerItem>
          <div className={`${CARD} p-6`}>
            <p className="text-xs text-gray-400">Share of Voice</p>
            <div className="flex items-baseline gap-2 mt-2">
              <NumberFlow
                value={8.2}
                suffix="%"
                format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                className="text-[28px] font-semibold tracking-tight tabular-nums text-gray-900 leading-none"
              />
              <span className="text-xs font-medium text-[#3370FF]">+3.1%</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">of AI answers</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className={`${CARD} p-6`}>
            <p className="text-xs text-gray-400">Top Engine</p>
            <div className="mt-2">
              <span className="text-[28px] font-semibold tracking-tight text-gray-900 leading-none">ChatGPT</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">38% of mentions</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className={`${CARD} p-6`}>
            <p className="text-xs text-gray-400">Weekly Trend</p>
            <div className="mt-2">
              <NumberFlow
                value={12}
                suffix="%"
                prefix="+"
                className="text-[28px] font-semibold tracking-tight tabular-nums text-[#3370FF] leading-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">vs previous week</p>
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
