'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import type { VisibilityScore } from '@/types/outcomes'

/**
 * ScoreHeroPanel — the focal point of the dashboard.
 *
 * The overall AI-search visibility score is the loudest element on the page:
 * an oversized Geist Mono number inside a score ring, with a single confident
 * blue CTA ("Run scan"). The number is derived from the existing
 * visibilityScores contract (mean of engines that have reported) — pure
 * presentation, no new data.
 *
 * Score colors (--color-data-3..6) tint the RING only — never the CTA.
 * The CTA is the one blue (#3370FF) action on the surface.
 *
 * States: loading (skeleton), empty (no scan yet — sells the next moment),
 * error (recovery CTA), populated.
 */

type State = 'loading' | 'empty' | 'error' | 'populated'

interface ScoreHeroPanelProps {
  scores: VisibilityScore[]
  state?: State
  /** Optional explicit error message for the error state. */
  errorMessage?: string
}

const RING_SIZE = 200
const STROKE = 14
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

function ringColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)' // green — good
  if (score >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' // red — critical
}

function band(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Needs work'
}

/** Aggregate the per-engine scores into one overall figure + dominant trend. */
function aggregate(scores: VisibilityScore[]) {
  const scored = scores.filter((s): s is VisibilityScore & { score: number } => s.score !== null)
  if (scored.length === 0) return null
  const overall = Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length)
  const up = scored.filter((s) => s.trend === 'up').length
  const down = scored.filter((s) => s.trend === 'down').length
  const trend: VisibilityScore['trend'] = up > down ? 'up' : down > up ? 'down' : 'flat'
  return { overall, trend, reporting: scored.length, total: scores.length }
}

function PanelFrame({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="score-hero-heading"
      className="card-console-hero relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="relative">{children}</div>
    </section>
  )
}

function TrendBadge({ trend }: { trend: VisibilityScore['trend'] }) {
  if (trend === 'up')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-positive px-2 py-0.5 text-[12px] font-medium text-status-positive">
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
        Trending up
      </span>
    )
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-critical px-2 py-0.5 text-[12px] font-medium text-status-critical">
        <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
        Trending down
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-status-neutral px-2 py-0.5 text-[12px] font-medium text-status-neutral">
      <Minus className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
      Holding steady
    </span>
  )
}

function Ring({ score }: { score: number }) {
  const offset = CIRC - (score / 100) * CIRC
  const color = ringColor(score)
  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      role="img"
      aria-label={`Overall AI search visibility score: ${score} out of 100`}
    >
      <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-data-grid)"
          strokeWidth={STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-[64px] font-medium leading-none tracking-[-0.03em] text-[#0A0A0A] tabular-nums"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {score}
        </span>
        <span className="mt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[#9CA3AF]">
          / 100
        </span>
      </div>
    </div>
  )
}

export function ScoreHeroPanel({ scores, state = 'populated', errorMessage }: ScoreHeroPanelProps) {
  const agg = state === 'populated' ? aggregate(scores) : null
  // Treat a populated panel with no reported scores as empty.
  const resolved: State = state === 'populated' && !agg ? 'empty' : state

  if (resolved === 'loading') {
    return (
      <PanelFrame>
        <div className="flex flex-col items-center gap-8 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
          <div
            className="h-[200px] w-[200px] shrink-0 animate-pulse rounded-full bg-[#F3F4F6]"
            aria-hidden="true"
          />
          <div className="w-full space-y-4" aria-busy="true" aria-label="Loading your visibility score">
            <div className="h-3 w-28 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-9 w-40 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        </div>
      </PanelFrame>
    )
  }

  if (resolved === 'error') {
    return (
      <PanelFrame>
        <div className="flex flex-col items-center gap-8 p-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:p-10 sm:text-left">
          <div
            className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-full border-[14px] border-[#F3F4F6]"
            aria-hidden="true"
          >
            <Minus className="h-12 w-12 text-[#D1D5DB]" strokeWidth={1.5} />
          </div>
          <div className="max-w-[420px]">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              AI search visibility
            </p>
            <h2 id="score-hero-heading" className="font-[var(--font-display)] text-[26px] font-semibold leading-tight tracking-[-0.01em] text-[#0A0A0A]">
              We couldn&apos;t load your score
            </h2>
            <p className="mt-2 text-[15px] leading-[1.5] text-[#6B7280]">
              {errorMessage ?? 'The connection dropped while reading your latest scan. Your data is safe.'}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Try again
            </Link>
          </div>
        </div>
      </PanelFrame>
    )
  }

  if (resolved === 'empty') {
    return (
      <PanelFrame>
        <div className="flex flex-col items-center gap-8 p-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:p-10 sm:text-left">
          {/* dashed placeholder ring — reads as "score is coming" not broken */}
          <div
            className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-full"
            style={{ border: `14px dashed var(--color-data-grid)` }}
            aria-hidden="true"
          >
            <span className="font-mono text-[32px] font-medium tracking-[-0.02em] text-[#D1D5DB]">
              ?
            </span>
          </div>
          <div className="max-w-[440px]">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              AI search visibility
            </p>
            <h2
              id="score-hero-heading"
              className="font-[var(--font-display)] text-[26px] font-semibold leading-tight tracking-[-0.01em] text-[#0A0A0A]"
            >
              Your first scan sets the baseline
            </h2>
            <p className="mt-2 text-[15px] leading-[1.5] text-[#6B7280]">
              See exactly where ChatGPT, Gemini, and Perplexity rank you today. One scan,
              one number, and the crew starts closing the gaps.
            </p>
            <Link
              href="/scan"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Run your first scan
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </PanelFrame>
    )
  }

  // populated
  const { overall, trend, reporting, total } = agg!
  return (
    <PanelFrame>
      <div className="flex flex-col items-center gap-8 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
        <Ring score={overall} />
        <div className="flex w-full min-w-0 flex-col items-center text-center sm:items-start sm:text-left">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            AI search visibility
          </p>
          <h2
            id="score-hero-heading"
            className="font-[var(--font-display)] text-[26px] font-semibold leading-tight tracking-[-0.01em] text-[#0A0A0A]"
          >
            {band(overall)} — you show up across AI search
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <TrendBadge trend={trend} />
            <span className="font-mono text-[12px] text-[#6B7280]">
              {reporting}/{total} engines reporting
            </span>
          </div>
          <p className="mt-3 max-w-[420px] text-[15px] leading-[1.5] text-[#6B7280]">
            This is the average of every engine below. Run a fresh scan to see what moved
            since last week.
          </p>
          <Link
            href="/scan"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Run scan
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </PanelFrame>
  )
}
