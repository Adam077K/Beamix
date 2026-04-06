'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartCard } from '@/components/ui/chart-card'
import { TrendBadge } from '@/components/ui/trend-badge'
import { ScoreRing } from '@/components/ui/score-ring'
import { VisibilityTrendChart } from '@/components/dashboard/charts/visibility-trend-chart'
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

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
  { name: 'ChatGPT', mentioned: true, color: '#10B981' },
  { name: 'Gemini', mentioned: true, color: '#3370FF' },
  { name: 'Perplexity', mentioned: true, color: '#8B5CF6' },
  { name: 'Google AI', mentioned: false, color: '#EF4444' },
  { name: 'Claude', mentioned: true, color: '#F59E0B' },
  { name: 'Grok', mentioned: false, color: '#0A0A0A' },
  { name: 'You.com', mentioned: true, color: '#06B6D4' },
]

const MILESTONES = [
  { label: 'First scan', score: 42, color: '#EF4444' },
  { label: 'Content Agent', score: 55, color: '#F59E0B' },
  { label: 'Schema Fixed', score: 67, color: '#3370FF' },
  { label: 'FAQ Added', score: 75, color: '#10B981' },
]

const DISPLAY_SCORE = 75
const SCORE_DELTA = 33

// ─── E1: Performance Overview — exact dashboard pattern ───────────────────────

function HeroOverview() {
  const marketPosition = 1

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[12px] font-semibold text-slate-900 dark:text-white">Performance</span>
        <span className="text-[11px] text-slate-400">Acme Coffee — AI visibility snapshot</span>
      </div>

      {/* 3-column metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Brand Presence */}
        <div className="px-5 py-4">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Brand presence</span>
          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <span className="text-[11px] text-slate-400">Visibility</span>
              <div className="flex items-center gap-2 mt-1">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
                  <circle
                    cx="10" cy="10" r="8" fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    strokeDasharray={`${(DISPLAY_SCORE / 100) * 50.3} 50.3`}
                    strokeLinecap="round"
                    transform="rotate(-90 10 10)"
                  />
                </svg>
                <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{DISPLAY_SCORE}%</span>
                <span className="text-xs font-semibold tabular-nums flex items-center gap-0.5 text-emerald-500">
                  ↑ {SCORE_DELTA}%
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Answers mentioning me</span>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">28</span>
                <span className="text-xs font-semibold tabular-nums flex items-center gap-0.5 text-emerald-500">
                  ↑ 20
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Citations */}
        <div className="px-5 py-4">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Citations</span>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <span className="text-[11px] text-slate-400">Total pages cited</span>
              <div className="mt-1">
                <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">14,808</span>
                <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 2,479</div>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">My pages cited</span>
              <div className="mt-1">
                <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">156</span>
                <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 18</div>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Pages mentioned</span>
              <div className="mt-1">
                <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">1,068</span>
                <div className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 372</div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="px-5 py-4">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Competitor Analysis</span>
          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <span className="text-[11px] text-slate-400">Market share</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">23%</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Market position</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">#{marketPosition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">AI visibility score</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-1">
              <button type="button" className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">Weekly</button>
              <button type="button" className="px-2 py-0.5 text-[10px] font-medium rounded-md text-slate-400 hover:text-slate-600 transition-colors">Monthly</button>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">75.48%</span>
              <span className="text-[11px] font-semibold tabular-nums text-emerald-600">↑ 33</span>
            </div>
          </div>
        </div>
        <div className="px-2 pb-3">
          <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
        </div>
      </div>
    </div>
  )
}

// ─── NEW1: Before/After ───────────────────────────────────────────────────────

function BeforeAfterCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Before &amp; After Running AI Agents</CardTitle>
        <p className="text-xs text-muted-foreground">3 agents run over 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4">
          {/* Before */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground">Before</span>
            <ScoreRing score={42} size="md" showLabel animate={false} />
            <span className="text-sm font-semibold text-amber-500">Fair</span>
          </div>

          {/* Arrow section */}
          <div className="flex flex-col items-center gap-1.5 pb-4">
            <div className="flex items-center gap-1">
              <div className="h-px w-8 bg-gradient-to-r from-amber-400 to-[#3370FF]" />
              <div
                className="flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #3370FF, #06B6D4)' }}
              >
                +33
              </div>
              <div className="h-px w-8 bg-gradient-to-r from-[#3370FF] to-[#06B6D4]" />
            </div>
            <span className="text-[10px] text-muted-foreground text-center">points gained</span>
          </div>

          {/* After */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground">After</span>
            <ScoreRing score={75} size="md" showLabel animate />
            <span className="text-sm font-semibold text-cyan-500">Excellent</span>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-[#3370FF]">
            +33 points after running 3 AI agents over 30 days
          </p>
          <p className="text-xs text-blue-400 mt-0.5">Content Writer · Schema Optimizer · FAQ Agent</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── NEW2: Engine Coverage grid ───────────────────────────────────────────────

function EngineCoverageCard() {
  const mentionedCount = ENGINES_COVERAGE.filter((e) => e.mentioned).length
  const total = ENGINES_COVERAGE.length
  const pct = Math.round((mentionedCount / total) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Engine Coverage</CardTitle>
        <p className="text-xs text-muted-foreground">Which AI engines mention your brand</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Engine grid — styled letter avatars like dashboard ranking */}
        <div className="grid grid-cols-4 gap-2">
          {ENGINES_COVERAGE.map(({ name, mentioned, color }) => (
            <div
              key={name}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border',
                mentioned
                  ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20'
                  : 'border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/20'
              )}
            >
              {/* Letter avatar — matches dashboard ranking style */}
              <span
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0)}
              </span>
              <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">{name}</span>
              {mentioned ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-label="Mentioned" />
              ) : (
                <XCircle className="h-3 w-3 text-slate-300 dark:text-slate-600" aria-label="Not found" />
              )}
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="space-y-2 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#3370FF]">{mentionedCount}/{total} engines cover you</span>
            <span className="text-xs text-blue-400 font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden">
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
  return (
    <ChartCard
      title="Growth Timeline"
      subtitle="Score milestones from AI agent actions"
      periods={['7d', '30d', '90d']}
      period="30d"
      contentClassName="px-4 pb-2"
    >
      <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
      {/* Milestone pills */}
      <div className="mt-3 flex flex-wrap gap-2 pb-2">
        {MILESTONES.map(({ label, score, color }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border"
            style={{
              backgroundColor: `${color}15`,
              borderColor: `${color}30`,
              color,
            }}
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
    </ChartCard>
  )
}

// ─── Group E export ───────────────────────────────────────────────────────────

export function GroupE() {
  return (
    <div className="flex flex-col gap-4">
      {/* E1: Performance overview — exact dashboard structure */}
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
