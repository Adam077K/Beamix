'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  { engine: 'ChatGPT', mentioned: true, position: 2, sentiment: 'positive' as const, color: '#10B981' },
  { engine: 'Gemini', mentioned: false, position: null, sentiment: null, color: '#3370FF' },
  { engine: 'Perplexity', mentioned: true, position: 4, sentiment: 'neutral' as const, color: '#8B5CF6' },
]

// ─── Score gradient bar ───────────────────────────────────────────────────────

function ScoreGradientBar({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(to right, #EF4444 0%, #F59E0B 33%, #10B981 66%, #06B6D4 100%)' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-slate-800 shadow-md z-10"
          style={{ left: `calc(${score}% - 8px)` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between mt-1.5">
        {['Critical', 'Fair', 'Good', 'Excellent'].map((label) => (
          <span key={label} className="text-[9px] text-muted-foreground">{label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Group A component ────────────────────────────────────────────────────────

export function GroupA() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* A1: Score Ring */}
      <Card className="flex flex-col items-center gap-5 py-8 px-6">
        <ScoreRing score={DEMO_SCORE} size="lg" showLabel animate />
        <div className="text-center space-y-1">
          <Badge
            className="text-xs font-semibold"
            style={{ backgroundColor: '#06B6D420', color: '#06B6D4', border: '1px solid #06B6D440' }}
          >
            Excellent
          </Badge>
          <p className="text-xs text-muted-foreground mt-1.5">Above 67% of businesses in your category</p>
        </div>
      </Card>

      {/* A2: Score Breakdown — mini AI readiness audit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">AI Readiness Audit</CardTitle>
          <p className="text-xs text-muted-foreground">How well your site is optimized for AI search</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreGradientBar score={DEMO_SCORE} />
          <div className="space-y-3">
            {SCORE_BREAKDOWN.map(({ label, score, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color }}
                  >
                    {score}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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

      {/* A3: Engine Scan Results — horizontal layout matching dashboard rankings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Engine Scan Results</CardTitle>
          <p className="text-xs text-muted-foreground">Where your brand appears in AI responses</p>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_60px_60px] gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Engine</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Pos</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Sentiment</span>
          </div>
          {ENGINE_RESULTS.map(({ engine, mentioned, position, sentiment, color }) => (
            <div
              key={engine}
              className="grid grid-cols-[1fr_80px_60px_60px] gap-1 items-center py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
            >
              {/* Engine name with colored dot */}
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-[12px] font-medium text-slate-800 dark:text-white">{engine}</span>
              </span>

              {/* Mention status pill */}
              <div className="flex justify-center">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    mentioned
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  )}
                >
                  {mentioned ? 'Mentioned' : 'Not Found'}
                </span>
              </div>

              {/* Position */}
              <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 text-right font-medium">
                {position != null ? `#${position}` : '—'}
              </span>

              {/* Sentiment */}
              <span
                className={cn(
                  'text-[10px] tabular-nums text-right font-medium capitalize',
                  sentiment === 'positive'
                    ? 'text-emerald-600'
                    : sentiment === 'neutral'
                      ? 'text-slate-500'
                      : 'text-muted-foreground'
                )}
              >
                {sentiment ?? '—'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}
