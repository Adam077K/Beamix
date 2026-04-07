'use client'

import NumberFlow from '@number-flow/react'
import { BlueScoreRing } from '@/components/marketing/charts/blue-score-ring'
import { BlueTrendChart } from '@/components/marketing/charts/blue-trend-chart'
import { AnimatedCard, CARD } from '@/components/marketing/card'
import { FadeUp, Pulse } from '@/components/marketing/motion'

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

// ─── Metric helper ───────────────────────────────────────────────────────────

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

// ─── E1: Performance Overview ─────────────────────────────────────────────────

function HeroOverview() {
  return (
    <AnimatedCard className="overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <p className="text-sm font-medium text-gray-500">Performance</p>
      </div>

      {/* 3-column metrics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Brand Presence */}
        <div className="px-6 py-5">
          <p className="text-sm font-medium text-gray-900 mb-4">Brand Presence</p>
          <div className="grid grid-cols-2 gap-6">
            <Metric label="Visibility">
              <div className="flex items-center gap-2.5">
                <svg className="size-5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#F3F4F6" strokeWidth="2.5" />
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#3370FF" strokeWidth="2.5"
                    strokeDasharray={`${(75 / 100) * 50.3} 50.3`}
                    strokeLinecap="round" transform="rotate(-90 10 10)" />
                </svg>
                <NumberFlow value={75} suffix="%"
                  className="text-[28px] font-semibold tracking-tight tabular-nums text-gray-900 leading-none" />
                <span className="text-sm font-medium text-[#3370FF]">+52%</span>
              </div>
            </Metric>
            <Metric label="Mentions">
              <div className="flex items-baseline gap-2">
                <NumberFlow value={28}
                  className="text-[28px] font-semibold tracking-tight tabular-nums text-gray-900 leading-none" />
                <span className="text-sm font-medium text-[#3370FF]">+20</span>
              </div>
            </Metric>
          </div>
        </div>

        {/* Citations */}
        <div className="px-6 py-5">
          <p className="text-sm font-medium text-gray-900 mb-4">Citations</p>
          <div className="grid grid-cols-3 gap-4">
            <Metric label="Total cited">
              <NumberFlow value={14808} format={{ notation: 'standard' }}
                className="text-xl font-semibold tracking-tight tabular-nums text-gray-900" />
              <p className="text-xs font-medium text-[#3370FF] mt-1">+2,479</p>
            </Metric>
            <Metric label="My pages">
              <span className="text-xl font-semibold tracking-tight tabular-nums text-gray-900">156</span>
              <p className="text-xs font-medium text-[#3370FF] mt-1">+18</p>
            </Metric>
            <Metric label="Mentioned">
              <span className="text-xl font-semibold tracking-tight tabular-nums text-gray-900">1,068</span>
              <p className="text-xs font-medium text-[#3370FF] mt-1">+372</p>
            </Metric>
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="px-6 py-5">
          <p className="text-sm font-medium text-gray-900 mb-4">Competitor Analysis</p>
          <div className="grid grid-cols-2 gap-6">
            <Metric label="Market share">
              <span className="text-[28px] font-semibold tracking-tight tabular-nums text-gray-900 leading-none">23%</span>
            </Metric>
            <Metric label="Position">
              <span className="text-[28px] font-semibold tracking-tight tabular-nums text-gray-900 leading-none">#1</span>
            </Metric>
          </div>
        </div>
      </div>

      {/* Chart — presentation recipe */}
      <div className="border-t border-gray-100">
        <div className="flex items-baseline justify-between px-6 pt-4 pb-1">
          <p className="text-sm font-medium text-gray-500">AI Visibility Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight tabular-nums text-gray-900">75.48%</span>
            <span className="text-sm font-medium text-[#3370FF]">+52</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <BlueTrendChart data={DEMO_SCAN_HISTORY} />
        </div>
      </div>
    </AnimatedCard>
  )
}

// ─── Before/After ─────────────────────────────────────────────────────────────

function BeforeAfterCard() {
  return (
    <AnimatedCard className="p-8" delay={0.15}>
      <p className="text-sm font-medium text-gray-500 mb-8 text-center">Before & After Beamix</p>
      <div className="flex items-center justify-center gap-10">
        <FadeUp delay={0}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-gray-400">Before</span>
            <div className="relative flex items-center justify-center">
              <div className="absolute rounded-full" style={{ width: 160, height: 160, background: 'radial-gradient(circle, rgba(51,112,255,0.06) 0%, transparent 70%)' }} aria-hidden="true" />
              <BlueScoreRing score={23} size="md" showLabel animate={false} />
            </div>
            <span className="text-sm font-medium text-gray-400">Invisible</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-col items-center gap-2 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-gray-200" aria-hidden="true" />
              <Pulse>
                <span className="rounded-full bg-[#3370FF] text-white text-sm font-bold px-4 py-1.5 tabular-nums shadow-[0_4px_16px_rgba(51,112,255,0.3)]">
                  +52
                </span>
              </Pulse>
              <div className="h-px w-10 bg-gray-200" aria-hidden="true" />
            </div>
            <span className="text-xs text-gray-400">points gained</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.5}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-[#3370FF] font-medium">After</span>
            <div className="relative flex items-center justify-center">
              <div className="absolute rounded-full" style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(51,112,255,0.20) 0%, rgba(51,112,255,0.08) 40%, transparent 70%)' }} aria-hidden="true" />
              <BlueScoreRing score={75} size="md" showLabel animate />
            </div>
            <span className="text-sm font-medium text-[#3370FF]">Visible</span>
          </div>
        </FadeUp>
      </div>
    </AnimatedCard>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function GroupE() {
  return (
    <div className="flex flex-col gap-4">
      <HeroOverview />
      <BeforeAfterCard />
    </div>
  )
}
