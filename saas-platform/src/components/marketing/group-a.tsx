'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScoreRing } from '@/components/ui/score-ring'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_SCORE = 75

const SCORE_BREAKDOWN = [
  { label: 'Schema Markup', score: 90, color: '#06B6D4' },
  { label: 'Content Quality', score: 61, color: '#F59E0B' },
  { label: 'FAQ Coverage', score: 35, color: '#EF4444' },
  { label: 'Crawlability', score: 88, color: '#06B6D4' },
]

const ENGINE_RESULTS = [
  { engine: 'ChatGPT', mentioned: true, position: 2, sentiment: 'Positive' as const, color: '#10B981' },
  { engine: 'Gemini', mentioned: false, position: null, sentiment: null, color: '#3370FF' },
  { engine: 'Perplexity', mentioned: true, position: 4, sentiment: 'Neutral' as const, color: '#8B5CF6' },
  { engine: 'Google AI', mentioned: true, position: 3, sentiment: 'Positive' as const, color: '#3B82F6' },
  { engine: 'Claude', mentioned: false, position: null, sentiment: null, color: '#F59E0B' },
]

// ─── Score gradient bar ───────────────────────────────────────────────────────

function ScoreGradientBar({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(to right, #EF4444 0%, #F59E0B 33%, #10B981 66%, #06B6D4 100%)' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-slate-700 shadow-sm z-10"
          style={{ left: `calc(${score}% - 7px)` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between mt-1">
        {['Critical', 'Fair', 'Good', 'Excellent'].map((label) => (
          <span key={label} className="text-[9px] text-muted-foreground/70">{label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Group A component ────────────────────────────────────────────────────────

export function GroupA() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* A1: Score Ring — clean centered layout, no badge noise */}
      <Card className="flex flex-col items-center justify-center gap-4 py-8 px-6 border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <ScoreRing score={DEMO_SCORE} size="lg" showLabel animate />
        <div className="text-center space-y-0.5">
          <p className="text-sm font-medium text-foreground">Excellent</p>
          <p className="text-xs text-muted-foreground">Above 67% of businesses in your category</p>
        </div>
      </Card>

      {/* A2: AI Readiness Audit — subtle gradient bar + minimal item rows */}
      <Card className="border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-3 pt-5 px-5">
          <p className="text-sm font-medium text-foreground">AI Readiness</p>
          <p className="text-xs text-muted-foreground">How well your site is optimized for AI search</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <ScoreGradientBar score={DEMO_SCORE} />
          <div className="space-y-3">
            {SCORE_BREAKDOWN.map(({ label, score, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{label}</span>
                  <span
                    className="text-xs font-medium tabular-nums"
                    style={{ color }}
                  >
                    {score}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* A3: Engine Scan Results — Attio-style table, no pill badges */}
      <Card className="border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <p className="text-sm font-medium text-foreground">Engine Results</p>
          <p className="text-xs text-muted-foreground">Where your brand appears in AI responses</p>
        </CardHeader>
        <CardContent className="px-5 pb-4 pt-3">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_72px_44px_64px] gap-1 pb-2 border-b border-border/40">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Engine</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Pos</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Sentiment</span>
          </div>
          <div className="divide-y divide-border/40">
            {ENGINE_RESULTS.map(({ engine, mentioned, position, sentiment, color }) => (
              <div
                key={engine}
                className="grid grid-cols-[1fr_72px_44px_64px] gap-1 items-center py-2.5"
              >
                {/* Engine name with colored dot */}
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-foreground">{engine}</span>
                </span>

                {/* Mention status — plain colored text, no badges */}
                <span
                  className={cn(
                    'text-xs font-medium',
                    mentioned ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  {mentioned ? 'Mentioned' : 'Not found'}
                </span>

                {/* Position */}
                <span className="text-xs tabular-nums text-muted-foreground text-right">
                  {position != null ? `#${position}` : '—'}
                </span>

                {/* Sentiment */}
                <span
                  className={cn(
                    'text-xs tabular-nums text-right',
                    sentiment === 'Positive'
                      ? 'text-emerald-600'
                      : sentiment === 'Neutral'
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                  )}
                >
                  {sentiment ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
