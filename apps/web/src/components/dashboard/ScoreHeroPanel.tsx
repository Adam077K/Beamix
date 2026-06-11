'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import type { VisibilityScore } from '@/types/outcomes'

/**
 * ScoreHeroPanel — M1 TIER-1 focal card (card-console-hero, one per screen).
 *
 * Craft moves applied:
 * M1 — TIER-1 hero elevation (card-console-hero + shadow-card-hero)
 * M2 — 4-step type contract: 64px mono score (STEP-1) · 30px verdict (STEP-2)
 *       · 12px eyebrow (STEP-3) · 15px body (STEP-4)
 * M5 — Fraunces italic on the band word only, inline in a sans sentence
 * M8 — two-tier recovery CTAs on empty + error states
 * M9 — craft-enter fade-up; no looping motion
 * M10 — primary focal above the fold, nothing competes for TIER-1
 * M11 — all numbers (score, engines reporting) in Geist Mono tabular-nums
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
      /* M1 TIER-1: card-console-hero | M9: craft-enter entrance */
      className="card-console-hero relative overflow-hidden craft-enter craft-enter-1"
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

/**
 * M5 — Verdict sentence with band word in Fraunces italic, inline in a sans sentence.
 * "You're showing up — <em Fraunces>Excellent</em> — across AI search"
 */
function VerdictLine({ score }: { score: number }) {
  const bandWord = band(score)
  return (
    /* M2 STEP-2 — 30px InterDisplay-Medium -0.02em (raised from 26px) */
    <h2
      id="score-hero-heading"
      className="font-[var(--font-display)] text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[#0A0A0A]"
    >
      You&apos;re showing up —{' '}
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontWeight: 400,
        }}
      >
        {bandWord}
      </span>{' '}
      — across AI search
    </h2>
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
          {/* SVG ring skeleton — reads as "score ring loading" not solid blob */}
          <svg
            width={200}
            height={200}
            viewBox="0 0 200 200"
            className="shrink-0 animate-pulse"
            aria-hidden="true"
          >
            <circle
              cx={100}
              cy={100}
              r={93}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth={14}
            />
          </svg>
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
            {/* M2 STEP-3 eyebrow */}
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              AI search visibility
            </p>
            {/* M2 STEP-2 */}
            <h2
              id="score-hero-heading"
              className="font-[var(--font-display)] text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[#0A0A0A]"
            >
              Couldn&apos;t load your score
            </h2>
            {/* M2 STEP-4 */}
            <p className="mt-3 text-[15px] leading-[1.6] text-[#6B7280]">
              {errorMessage ??
                'The connection dropped while reading your latest scan. Your data is safe — reload to retry.'}
            </p>
            {/* M8 two-tier recovery: primary blue pill + quiet secondary link */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                Reload dashboard
              </Link>
              <Link
                href="/scan"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                Run a new scan
              </Link>
            </div>
          </div>
        </div>
      </PanelFrame>
    )
  }

  if (resolved === 'empty') {
    return (
      <PanelFrame>
        <div className="flex flex-col items-center gap-8 p-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:p-10 sm:text-left">
          {/* dashed ring — reads "score is coming" */}
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
            {/* M2 STEP-3 */}
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              AI search visibility
            </p>
            {/* M2 STEP-2 */}
            <h2
              id="score-hero-heading"
              className="font-[var(--font-display)] text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[#0A0A0A]"
            >
              Your first scan sets the baseline
            </h2>
            {/* M2 STEP-4 */}
            <p className="mt-3 text-[15px] leading-[1.6] text-[#6B7280]">
              See exactly where ChatGPT, Gemini, and Perplexity rank you today. One scan,
              one number, and the crew starts closing the gaps.
            </p>
            {/* M8 two-tier CTA: primary blue pill + quiet secondary link */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/scan"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                Run your first scan
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <Link
                href="/scans"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              >
                View past scans
              </Link>
            </div>
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
          {/* M2 STEP-3 eyebrow */}
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            AI search visibility
          </p>
          {/* M2 STEP-2 + M5 Fraunces serif beat on the band word */}
          <VerdictLine score={overall} />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <TrendBadge trend={trend} />
            {/* M11 mono for truth */}
            <span className="font-mono text-[12px] text-[#6B7280] tabular-nums">
              {reporting}/{total} engines reporting
            </span>
          </div>
          {/* M2 STEP-4 body */}
          <p className="mt-3 max-w-[420px] text-[15px] leading-[1.6] text-[#6B7280]">
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
