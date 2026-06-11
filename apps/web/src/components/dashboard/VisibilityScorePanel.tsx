'use client'

import type { VisibilityScore } from '@/types/outcomes'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { EngineMicroSparkline } from './EngineMicroSparkline'

/**
 * VisibilityScorePanel — per-engine breakdown (recedes beneath the hero).
 *
 * Craft moves applied:
 * M1 — TIER-2 for focus card (card-console hover-lift) · TIER-3 .card-inset for others
 * M3 — Asymmetric weighted 2-up: lowest-scoring engine = wider TIER-2 focus card,
 *       others = narrower TIER-3 .card-inset. Kills the N-equal-column grid.
 * M4 — EngineMicroSparkline on every engine surface (M4 signature detail)
 * M7 — number-over-label extreme hierarchy; left status-color hairline on focus card
 * M8 — designed empty with two-tier CTA on the null/waiting card
 * M9 — craft-enter stagger (enter-3 / enter-4 / enter-5)
 * M11 — all numbers Geist Mono tabular-nums
 */

const ENGINE_META: Record<string, { label: string }> = {
  chatgpt: { label: 'ChatGPT' },
  gemini: { label: 'Gemini' },
  perplexity: { label: 'Perplexity' },
}

interface VisibilityScorePanelProps {
  scores: VisibilityScore[]
  /** Optional historical points per engine for sparklines (last ~5) */
  scoreHistory?: Record<string, number[]>
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

/** TIER-3 inset card — non-focal engine (M1/M3) */
function InsetEngineCard({
  score,
  historyPoints,
  className,
}: {
  score: VisibilityScore
  historyPoints?: number[]
  className?: string
}) {
  const meta = ENGINE_META[score.engine] ?? { label: score.engine }

  if (score.score === null) {
    return (
      <div
        role="region"
        aria-label={`${meta.label} visibility — waiting on first scan`}
        className={cn('card-inset relative overflow-hidden p-4', className)}
      >
        <div className="flex items-center justify-between">
          {/* M2 STEP-3 eyebrow */}
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {meta.label}
          </span>
          {/* M4 sparkline baseline */}
          <EngineMicroSparkline points={null} currentScore={null} />
        </div>
        {/* M7 number-over-label hierarchy */}
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.03em] text-[#D1D5DB] tabular-nums">
            --
          </span>
          <span className="font-mono text-[12px] text-[#D1D5DB]">/100</span>
        </div>
        <p className="mt-2 text-[13px] text-[#9CA3AF]">Waiting on first scan</p>
      </div>
    )
  }

  const color = scoreColor(score.score)

  return (
    <div
      role="region"
      aria-label={`${meta.label} visibility score: ${score.score} out of 100`}
      className={cn('card-inset relative overflow-hidden p-4', className)}
    >
      {/* score-tinted top hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[16px]"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {meta.label}
        </span>
        {/* M4 micro-sparkline */}
        <EngineMicroSparkline points={historyPoints} currentScore={score.score} />
      </div>
      {/* M7 number-over-label */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className="font-mono text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[#0A0A0A]"
        >
          {score.score}
        </span>
        <span className="font-mono text-[12px] text-[#9CA3AF]">/100</span>
        <span className="ml-auto self-end pb-[1px]">
          <TrendIcon trend={score.trend} />
        </span>
      </div>
      {score.lastUpdatedAt && (
        <p className="mt-1.5 text-[12px] text-[#9CA3AF]">
          Updated{' '}
          {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            Math.round(
              (new Date(score.lastUpdatedAt).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            ),
            'day',
          )}
        </p>
      )}
    </div>
  )
}

/** TIER-2 focus card — the lowest-scoring engine (M1/M3) */
function FocusEngineCard({
  score,
  historyPoints,
  className,
}: {
  score: VisibilityScore
  historyPoints?: number[]
  className?: string
}) {
  const meta = ENGINE_META[score.engine] ?? { label: score.engine }

  if (score.score === null) {
    return (
      <div
        role="region"
        aria-label={`${meta.label} visibility — no scan yet`}
        className={cn(
          'card-console relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(10,10,10,0.07),0_2px_8px_rgba(10,10,10,0.07),0_6px_16px_rgba(10,10,10,0.05)]',
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {meta.label}
          </span>
          <EngineMicroSparkline points={null} currentScore={null} />
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-mono text-[36px] font-medium leading-none tracking-[-0.03em] text-[#D1D5DB] tabular-nums">
            --
          </span>
          <span className="font-mono text-[13px] text-[#D1D5DB]">/100</span>
        </div>
        {/* M8 two-tier empty */}
        <p className="mt-2 text-[13px] text-[#6B7280]">
          No data yet for this engine.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href="/scan"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            Run scan
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link
            href="/scans"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-[#9CA3AF] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            View history
          </Link>
        </div>
      </div>
    )
  }

  const color = scoreColor(score.score)

  return (
    <div
      role="region"
      aria-label={`${meta.label} visibility score: ${score.score} out of 100 — needs attention`}
      className={cn(
        'card-console relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(10,10,10,0.07),0_2px_8px_rgba(10,10,10,0.07),0_6px_16px_rgba(10,10,10,0.05)]',
        className,
      )}
    >
      {/* score-tinted top hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[16px]"
        style={{ backgroundColor: color }}
      />
      {/* M7 left status-color hairline on focus card */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-[16px]"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {meta.label}
        </span>
        {/* M4 micro-sparkline */}
        <EngineMicroSparkline points={historyPoints} currentScore={score.score} />
      </div>
      {/* M7 number-over-label extreme hierarchy */}
      <div className="mt-4 flex items-baseline gap-1.5">
        <span
          className="font-mono text-[36px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[#0A0A0A]"
        >
          {score.score}
        </span>
        <span className="font-mono text-[13px] text-[#9CA3AF]">/100</span>
        <span className="ml-auto self-end pb-[2px]">
          <TrendIcon trend={score.trend} />
        </span>
      </div>

      {/* thin progress rail */}
      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
        aria-hidden="true"
      >
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
              (new Date(score.lastUpdatedAt).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            ),
            'day',
          )}
        </p>
      )}
    </div>
  )
}

/**
 * Determine which engine is the focus card (lowest score, or first null).
 * Returns the index of the card that should be TIER-2 focus.
 */
function focusIndex(scores: VisibilityScore[]): number {
  // All null — first is focus
  const withScores = scores
    .map((s, i) => ({ i, score: s.score }))
    .filter((x): x is { i: number; score: number } => x.score !== null)
  if (withScores.length === 0) return 0
  // Lowest scoring engine is the focus card
  return withScores.reduce((min, x) => (x.score < min.score ? x : min), withScores[0]).i
}

export function VisibilityScorePanel({
  scores,
  scoreHistory,
}: VisibilityScorePanelProps) {
  if (scores.length === 0) return null

  const fIdx = focusIndex(scores)

  return (
    <section aria-labelledby="visibility-heading">
      {/* M2 STEP-3 eyebrow header */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          id="visibility-heading"
          className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
        >
          By engine
        </h2>
        <span className="text-[12px] text-[#9CA3AF]">Where each AI ranks you</span>
      </div>

      {scores.length === 1 ? (
        /* Single engine — just TIER-2 focus */
        <FocusEngineCard
          score={scores[0]}
          historyPoints={scoreHistory?.[scores[0].engine]}
          className={cn('craft-enter craft-enter-3')}
        />
      ) : (
        /*
         * M3 Asymmetric weighted 2-up:
         * - Focus card (lowest score) = wider TIER-2 (card-console)
         * - Others = narrower TIER-3 (.card-inset) stacked
         * Layout: [focus | others-stack] on large screens
         */
        <div className={cn('grid gap-4', 'grid-cols-1 lg:grid-cols-[1fr_300px]')}>
          {/* TIER-2 focus card — lowest scoring engine */}
          <FocusEngineCard
            score={scores[fIdx]}
            historyPoints={scoreHistory?.[scores[fIdx].engine]}
            className={cn('craft-enter craft-enter-3')}
          />
          {/* TIER-3 others stacked */}
          <div className="flex flex-col gap-3">
            {scores
              .filter((_, i) => i !== fIdx)
              .map((s, subIdx) => (
                <InsetEngineCard
                  key={s.engine}
                  score={s}
                  historyPoints={scoreHistory?.[s.engine]}
                  className={cn(
                    subIdx === 0 ? 'craft-enter craft-enter-4' : 'craft-enter craft-enter-5',
                  )}
                />
              ))}
          </div>
        </div>
      )}
    </section>
  )
}
