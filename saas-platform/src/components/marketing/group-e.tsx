'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScoreRing } from '@/components/ui/score-ring'
import { VisibilityTrendChart } from '@/components/dashboard/charts/visibility-trend-chart'
import { TrendingUp } from 'lucide-react'

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

const ENGINES_COVERAGE = [
  { name: 'ChatGPT', mentioned: true, color: '#3370FF' },
  { name: 'Gemini', mentioned: true, color: '#2563EB' },
  { name: 'Perplexity', mentioned: true, color: '#1E40AF' },
  { name: 'Google AI', mentioned: false, color: '#D1D5DB' },
  { name: 'Claude', mentioned: true, color: '#5A8FFF' },
  { name: 'Grok', mentioned: false, color: '#D1D5DB' },
  { name: 'You.com', mentioned: true, color: '#60A5FA' },
]

const MILESTONES = [
  { label: 'First scan', score: 42, color: '#93B4FF' },
  { label: 'Content Agent', score: 55, color: '#5A8FFF' },
  { label: 'Schema Fixed', score: 67, color: '#3370FF' },
  { label: 'FAQ Added', score: 75, color: '#1E40AF' },
]

const DISPLAY_SCORE = 75
const SCORE_DELTA = 33

const PERIODS = ['7d', '30d', '90d'] as const
type Period = (typeof PERIODS)[number]

// ─── E1: Performance Overview — exact dashboard pattern ───────────────────────

function HeroOverview() {
  const [period, setPeriod] = useState<Period>('7d')

  return (
    <div className="rounded-lg border border-border/40 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40">
        <span className="text-xs font-medium text-foreground">Performance</span>
        <span className="text-xs text-muted-foreground">Acme Coffee — AI visibility snapshot</span>
      </div>

      {/* 3-column metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
        {/* Brand Presence */}
        <div className="px-5 py-4">
          <span className="text-sm font-medium text-foreground">Brand presence</span>
          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">Visibility</span>
              <div className="flex items-center gap-2 mt-1">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
                  <circle
                    cx="10" cy="10" r="8" fill="none"
                    stroke="#3370FF"
                    strokeWidth="2.5"
                    strokeDasharray={`${(DISPLAY_SCORE / 100) * 50.3} 50.3`}
                    strokeLinecap="round"
                    transform="rotate(-90 10 10)"
                  />
                </svg>
                <span className="text-2xl font-semibold tabular-nums text-foreground">{DISPLAY_SCORE}%</span>
                <span className="text-xs font-medium text-[#3370FF]">+{SCORE_DELTA}%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Answers mentioning me</span>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="text-2xl font-semibold tabular-nums text-foreground">28</span>
                <span className="text-xs font-medium text-[#3370FF]">+20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Citations */}
        <div className="px-5 py-4">
          <span className="text-sm font-medium text-foreground">Citations</span>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">Total pages cited</span>
              <div className="mt-1">
                <span className="text-xl font-semibold tabular-nums text-foreground">14,808</span>
                <div className="text-xs font-medium text-[#3370FF] mt-0.5">+2,479</div>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">My pages cited</span>
              <div className="mt-1">
                <span className="text-xl font-semibold tabular-nums text-foreground">156</span>
                <div className="text-xs font-medium text-[#3370FF] mt-0.5">+18</div>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Pages mentioned</span>
              <div className="mt-1">
                <span className="text-xl font-semibold tabular-nums text-foreground">1,068</span>
                <div className="text-xs font-medium text-[#3370FF] mt-0.5">+372</div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="px-5 py-4">
          <span className="text-sm font-medium text-foreground">Competitor Analysis</span>
          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <span className="text-xs text-muted-foreground">Market share</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold tabular-nums text-foreground">23%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Market position</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold tabular-nums text-foreground">#1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="border-t border-border/40">
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-xs font-medium text-foreground">AI visibility score</span>
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
              <span className="text-base font-semibold tabular-nums text-foreground">75.48%</span>
              <span className="text-xs font-medium text-[#3370FF]">+33</span>
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">
          <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
        </div>
      </div>
    </div>
  )
}

// ─── NEW1: Before/After ───────────────────────────────────────────────────────

function BeforeAfterCard() {
  return (
    <Card className="border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader className="pb-3 pt-5 px-5">
        <p className="text-sm font-medium text-foreground">Before &amp; After</p>
        <p className="text-xs text-muted-foreground">AI agents ran over 30 days</p>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-center justify-center gap-6">
          {/* Before */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Before</span>
            <ScoreRing score={42} size="md" showLabel animate={false} />
            <span className="text-sm font-medium text-[#93B4FF]">Fair</span>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1.5 pb-5">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-border" aria-hidden="true" />
              <span className="rounded-full bg-foreground text-background text-xs font-medium px-2 py-0.5 tabular-nums">
                +33
              </span>
              <div className="h-px w-6 bg-border" aria-hidden="true" />
            </div>
            <span className="text-[10px] text-muted-foreground">points gained</span>
          </div>

          {/* After */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">After</span>
            <ScoreRing score={75} size="md" showLabel animate />
            <span className="text-sm font-medium text-[#3370FF]">Excellent</span>
          </div>
        </div>

        {/* Footer note — plain muted text, no blue box */}
        <p className="mt-5 text-xs text-muted-foreground text-center">
          +33 points after running 3 AI agents over 30 days
        </p>
      </CardContent>
    </Card>
  )
}

// ─── NEW2: Engine Coverage — Attio-style table ────────────────────────────────

function EngineCoverageCard() {
  const mentionedCount = ENGINES_COVERAGE.filter((e) => e.mentioned).length
  const total = ENGINES_COVERAGE.length
  const pct = Math.round((mentionedCount / total) * 100)

  return (
    <Card className="border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <p className="text-sm font-medium text-foreground">Engine Coverage</p>
        <p className="text-xs text-muted-foreground">Which AI engines mention your brand</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px] gap-1 pb-2 border-b border-border/40">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Engine</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Status</span>
        </div>

        {/* Engine rows */}
        <div className="divide-y divide-border/40">
          {ENGINES_COVERAGE.map(({ name, mentioned, color }) => (
            <div key={name} className="grid grid-cols-[1fr_80px] gap-1 items-center py-2.5">
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: mentioned ? color : '#D1D5DB' }}
                  aria-hidden="true"
                />
                <span className="text-xs text-foreground">{name}</span>
              </span>
              <span
                className={cn(
                  'text-xs text-right',
                  mentioned ? 'text-[#3370FF]' : 'text-muted-foreground'
                )}
              >
                {mentioned ? 'Covered' : 'Not covered'}
              </span>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{mentionedCount}/{total} engines</span>
            <span className="text-xs font-medium text-foreground">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3370FF] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── NEW3: Growth Timeline ────────────────────────────────────────────────────

function GrowthTimelineCard() {
  const [period, setPeriod] = useState<Period>('30d')

  return (
    <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Growth Timeline</p>
            <p className="text-xs text-muted-foreground">Score milestones from AI agent actions</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0" role="group" aria-label="Select time period">
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
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
        {/* Milestone pills — subtle border style matching chart legend */}
        <div className="mt-3 flex flex-wrap gap-2">
          {MILESTONES.map(({ label, score, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {label} · {score}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Group E export ───────────────────────────────────────────────────────────

export function GroupE() {
  return (
    <div className="flex flex-col gap-4">
      {/* E1: Performance overview */}
      <HeroOverview />

      {/* NEW1 + NEW2: Before/After and Engine Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BeforeAfterCard />
        <EngineCoverageCard />
      </div>

      {/* NEW3: Growth Timeline */}
      <GrowthTimelineCard />
    </div>
  )
}
