'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BlueScoreRing } from '@/components/marketing/charts/blue-score-ring'
import { BlueTrendChart } from '@/components/marketing/charts/blue-trend-chart'
import { TrendingUp } from 'lucide-react'

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

const DISPLAY_SCORE = 75
const SCORE_DELTA = 52

const PERIODS = ['7d', '30d', '90d'] as const
type Period = (typeof PERIODS)[number]

// ─── E1: Performance Overview ─────────────────────────────────────────────────

function HeroOverview() {
  const [period, setPeriod] = useState<Period>('7d')

  return (
    <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40">
        <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Performance</span>
        <span className="text-xs text-muted-foreground">Brew &amp; Bean — AI visibility snapshot</span>
      </div>

      {/* 3-column metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
        {/* Brand Presence */}
        <div className="px-5 py-4">
          <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Brand presence</span>
          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">Visibility</span>
              <div className="flex items-center gap-2 mt-1">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#E8EEFB" strokeWidth="2.5" />
                  <circle
                    cx="10" cy="10" r="8" fill="none"
                    stroke="#3370FF"
                    strokeWidth="2.5"
                    strokeDasharray={`${(DISPLAY_SCORE / 100) * 50.3} 50.3`}
                    strokeLinecap="round"
                    transform="rotate(-90 10 10)"
                  />
                </svg>
                <span className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">{DISPLAY_SCORE}%</span>
                <span className="text-xs font-medium text-[#3370FF]">+{SCORE_DELTA}%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Answers mentioning me</span>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">28</span>
                <span className="text-xs font-medium text-[#3370FF]">+20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Citations */}
        <div className="px-5 py-4">
          <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Citations</span>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">Total pages cited</span>
              <div className="mt-1">
                <span className="text-xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">14,808</span>
                <div className="text-xs font-medium text-[#3370FF] mt-0.5">+2,479</div>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">My pages cited</span>
              <div className="mt-1">
                <span className="text-xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">156</span>
                <div className="text-xs font-medium text-[#3370FF] mt-0.5">+18</div>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Pages mentioned</span>
              <div className="mt-1">
                <span className="text-xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">1,068</span>
                <div className="text-xs font-medium text-[#3370FF] mt-0.5">+372</div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="px-5 py-4">
          <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Competitor Analysis</span>
          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">Market share</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">23%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Market position</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">#1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="border-t border-border/40">
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">AI visibility score</span>
          <div className="flex items-center gap-3">
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
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold tracking-[-0.02em] tabular-nums text-foreground">75.48%</span>
              <span className="text-xs font-medium text-[#3370FF]">+52</span>
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">
          <BlueTrendChart data={DEMO_SCAN_HISTORY} />
        </div>
      </div>
    </div>
  )
}

// ─── Before/After ─────────────────────────────────────────────────────────────

function BeforeAfterCard() {
  return (
    <Card className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-3 pt-5 px-5">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Before &amp; After</p>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <div className="flex items-center justify-center gap-6">
          {/* Before */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Before</span>
            <div className="relative flex items-center justify-center">
              {/* Subtle blue glow */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  background: 'radial-gradient(circle, rgba(51,112,255,0.08) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              <BlueScoreRing score={23} size="md" showLabel animate={false} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Invisible</span>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1.5 pb-5">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-border" aria-hidden="true" />
              <span className="rounded-full bg-foreground text-background text-xs font-medium px-2 py-0.5 tabular-nums">
                +52
              </span>
              <div className="h-px w-6 bg-border" aria-hidden="true" />
            </div>
            <span className="text-[10px] text-muted-foreground">points gained</span>
          </div>

          {/* After */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">After</span>
            <div className="relative flex items-center justify-center">
              {/* Brighter blue glow on the After side */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  background: 'radial-gradient(circle, rgba(51,112,255,0.18) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              <BlueScoreRing score={75} size="md" showLabel animate />
            </div>
            <span className="text-sm font-medium text-[#3370FF]">Visible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Group E export ───────────────────────────────────────────────────────────

export function GroupE() {
  return (
    <div className="flex flex-col gap-3">
      {/* E1: Performance overview */}
      <HeroOverview />

      {/* Before/After — full width */}
      <BeforeAfterCard />
    </div>
  )
}
