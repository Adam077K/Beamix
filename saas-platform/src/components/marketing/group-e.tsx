'use client'

import { ArrowRight, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { ScoreRing } from '@/components/ui/score-ring'
import { VisibilityTrendChart } from '@/components/dashboard/charts/visibility-trend-chart'

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

// ─── E1: Performance stats hero ───────────────────────────────────────────────

function HeroOverview() {
  const stats = [
    { label: 'Brand Presence', value: '75%', change: '+12%', color: '#3370FF' },
    { label: 'AI Citations', value: '28', change: '+20', color: '#10B981' },
    { label: 'Competitor Rank', value: '#2', change: '+3', color: '#06B6D4' },
    { label: 'Market Share', value: '23%', change: '+5%', color: '#8B5CF6' },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
      <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-6">
        Performance Overview — Acme Coffee
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, change, color }) => (
          <div key={label} className="flex flex-col gap-1.5 p-4 rounded-xl bg-gray-50/60">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <span className="text-3xl font-bold tabular-nums" style={{ color }}>{value}</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              {change}
            </span>
          </div>
        ))}
      </div>
      <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
    </div>
  )
}

// ─── NEW1: Before/After ───────────────────────────────────────────────────────

function BeforeAfterCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
      <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-6">
        Before &amp; After Running AI Agents
      </p>
      <div className="flex items-center justify-center gap-6">
        {/* Before */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Before</span>
          <ScoreRing score={42} size="md" showLabel animate={false} />
          <div className="text-center">
            <span className="text-sm font-semibold text-amber-600">Fair</span>
            <p className="text-xs text-gray-400 mt-0.5">Score: 42/100</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-2">
          <ArrowRight className="h-8 w-8 text-[#3370FF]" />
          <span className="text-xs font-semibold text-[#3370FF] text-center whitespace-nowrap">
            +33 points
          </span>
        </div>

        {/* After */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">After</span>
          <ScoreRing score={75} size="md" showLabel animate />
          <div className="text-center">
            <span className="text-sm font-semibold text-cyan-600">Excellent</span>
            <p className="text-xs text-gray-400 mt-0.5">Score: 75/100</p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-center">
        <p className="text-sm font-medium text-[#3370FF]">
          +33 points after running AI agents
        </p>
        <p className="text-xs text-blue-400 mt-0.5">3 agents run over 30 days</p>
      </div>
    </div>
  )
}

// ─── NEW2: Engine Coverage grid ───────────────────────────────────────────────

function EngineCoverageCard() {
  const mentioned = ENGINES_COVERAGE.filter((e) => e.mentioned).length
  const total = ENGINES_COVERAGE.length

  return (
    <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
      <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-6">
        Engine Coverage
      </p>
      {/* 4+3 grid */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {ENGINES_COVERAGE.slice(0, 4).map(({ name, mentioned: isMentioned, color }) => (
            <div
              key={name}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                isMentioned ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/30'
              }`}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <span className="text-[10px] font-bold" style={{ color }}>{name.slice(0, 2)}</span>
              </div>
              <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">{name}</span>
              {isMentioned ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ENGINES_COVERAGE.slice(4).map(({ name, mentioned: isMentioned, color }) => (
            <div
              key={name}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${
                isMentioned ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/30'
              }`}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <span className="text-[10px] font-bold" style={{ color }}>{name.slice(0, 2)}</span>
              </div>
              <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">{name}</span>
              {isMentioned ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Summary badge */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-[#3370FF]">{mentioned}/{total} engines mentioning you</span>
          <span className="text-xs text-blue-400">{Math.round((mentioned / total) * 100)}% coverage</span>
        </div>
        <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
          <div className="h-full rounded-full bg-[#3370FF]" style={{ width: `${(mentioned / total) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── NEW3: Growth timeline ────────────────────────────────────────────────────

function GrowthTimelineCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
      <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
        Growth Timeline
      </p>
      <p className="text-sm text-gray-500 mb-4">Score milestones from AI agent actions</p>
      <VisibilityTrendChart data={DEMO_SCAN_HISTORY} />
      {/* Milestone legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {MILESTONES.map(({ label, score, color }) => (
          <div key={label} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50">
            <div className="h-3 w-3 rounded-full border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: color }} />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-700">{label}</span>
              <span className="text-[10px] text-gray-400 tabular-nums">Score: {score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Group E export ───────────────────────────────────────────────────────────

export function GroupE() {
  return (
    <div className="flex flex-col gap-6">
      {/* E1: Hero overview */}
      <HeroOverview />

      {/* Composite cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BeforeAfterCard />
        <EngineCoverageCard />
      </div>
      <GrowthTimelineCard />
    </div>
  )
}
