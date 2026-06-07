'use client'

import type { VisibilityScore } from '@/types/outcomes'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * VisibilityScorePanel — per-engine breakdown that recedes beneath the hero.
 *
 * Contract preserved: { scores: VisibilityScore[] }. The presentation is
 * reworked into dense-but-calm cards (the dense-kpi-ribbon move: number over
 * label, mono figures) with the layered Stripe card finish. The engine score
 * tints a thin top bar + the figure only — score colors are data-viz, never
 * UI accents. #3370FF appears nowhere here; this surface is quiet by design.
 *
 * States within a card: score === null renders the "setup in progress" card.
 */

const ENGINE_META: Record<string, { label: string }> = {
  chatgpt: { label: 'ChatGPT' },
  gemini: { label: 'Gemini' },
  perplexity: { label: 'Perplexity' },
}

interface VisibilityScorePanelProps {
  scores: VisibilityScore[]
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)'
  if (score >= 50) return 'var(--color-data-4)'
  if (score >= 25) return 'var(--color-data-5)'
  return 'var(--color-data-6)'
}

function TrendIcon({ trend }: { trend: VisibilityScore['trend'] }) {
  if (!trend || trend === 'flat')
    return <Minus className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={2} aria-label="No change" />
  if (trend === 'up')
    return (
      <TrendingUp
        className="h-3.5 w-3.5 text-status-positive"
        strokeWidth={2}
        aria-label="Trending up"
      />
    )
  return (
    <TrendingDown
      className="h-3.5 w-3.5 text-status-critical"
      strokeWidth={2}
      aria-label="Trending down"
    />
  )
}

function SetupInProgressCard({ engine }: { engine: string }) {
  const meta = ENGINE_META[engine] ?? { label: engine }
  return (
    <div
      role="region"
      aria-label={`${meta.label} visibility — setup in progress`}
      className="card-console relative overflow-hidden p-5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[16px] bg-[#E5E7EB]"
      />
      <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
        {meta.label}
      </span>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono text-[36px] font-medium leading-none tracking-[-0.03em] text-[#D1D5DB] tabular-nums">
          --
        </span>
        <span className="font-mono text-[13px] text-[#D1D5DB]">/100</span>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-[#9CA3AF]">
        Waiting on your first scan.
      </p>
    </div>
  )
}

function ScoreCard({ score }: { score: VisibilityScore }) {
  const meta = ENGINE_META[score.engine] ?? { label: score.engine }

  if (score.score === null) {
    return <SetupInProgressCard engine={score.engine} />
  }

  const color = scoreColor(score.score)

  return (
    <div
      role="region"
      aria-label={`${meta.label} visibility score: ${score.score} out of 100`}
      className="card-console relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(10,10,10,0.07),0_2px_8px_rgba(10,10,10,0.07),0_6px_16px_rgba(10,10,10,0.05)]"
    >
      {/* score-tinted top hairline — data-viz tint only */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[16px]"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
          {meta.label}
        </span>
      </div>

      {/* number-over-label hierarchy — trend icon inline-right on the baseline */}
      <div className="mt-4 flex items-baseline gap-1.5">
        <span
          className="font-mono text-[36px] font-medium leading-none tracking-[-0.03em] tabular-nums"
          style={{ color: '#0A0A0A' }}
        >
          {score.score}
        </span>
        <span className="font-mono text-[13px] text-[#9CA3AF]">/100</span>
        <span className="ml-auto self-end pb-[2px]">
          <TrendIcon trend={score.trend} />
        </span>
      </div>

      {/* thin progress rail tinted by the score band */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]" aria-hidden="true">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score.score}%`,
            backgroundColor: color,
            transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {score.lastUpdatedAt && (
        <p className="mt-2.5 text-[12px] text-[#9CA3AF]">
          Updated{' '}
          {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            Math.round(
              (new Date(score.lastUpdatedAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            ),
            'day',
          )}
        </p>
      )}
    </div>
  )
}

export function VisibilityScorePanel({ scores }: VisibilityScorePanelProps) {
  return (
    <section aria-labelledby="visibility-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          id="visibility-heading"
          className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          By engine
        </h2>
        <span className="text-[12px] text-[#9CA3AF]">Where each AI ranks you</span>
      </div>
      <div
        className={cn(
          'grid gap-4',
          scores.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
        )}
      >
        {scores.map((s) => (
          <ScoreCard key={s.engine} score={s} />
        ))}
      </div>
    </section>
  )
}
