'use client'

import type { VisibilityScore } from '@/types/outcomes'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const ENGINE_META: Record<string, { label: string; color: string }> = {
  chatgpt:    { label: 'ChatGPT',    color: '#10A37F' },
  gemini:     { label: 'Gemini',     color: '#4285F4' },
  perplexity: { label: 'Perplexity', color: '#6B7AFF' },
}

interface VisibilityScorePanelProps {
  scores: VisibilityScore[]
}

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return null
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 75 ? '#06B6D4'
    : score >= 50 ? '#10B981'
    : score >= 25 ? '#F59E0B'
    : '#EF4444'

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#F3F4F6"
        strokeWidth="6"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#0A0A0A"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
    </svg>
  )
}

function TrendIcon({ trend }: { trend: VisibilityScore['trend'] }) {
  if (!trend || trend === 'flat')
    return <Minus className="w-3.5 h-3.5 text-[#9CA3AF]" aria-label="No change" />
  if (trend === 'up')
    return <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" aria-label="Trending up" />
  return <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" aria-label="Trending down" />
}

/**
 * EmptyScoreRing — proper empty score ring for the pre-scan state.
 *
 * Spec (DESIGN-DIRECTION §5 #2):
 *  - Even #E5E7EB track ring (no partial fill — score is unknown)
 *  - Geist Mono "—" in the center (not a spinner, not a dot)
 *  - Never reads as a broken/failed fetch
 */
function EmptyScoreRing() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Even track only — no progress arc */}
      <circle
        cx="36"
        cy="36"
        r="28"
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="6"
      />
      {/* Geist Mono em-dash — conveys "not yet measured", not "error" */}
      <text
        x="36"
        y="41"
        textAnchor="middle"
        fontSize="16"
        fontWeight="500"
        fill="#9CA3AF"
        fontFamily="'Geist Mono', 'Fira Code', monospace"
      >
        —
      </text>
    </svg>
  )
}

function SetupInProgressCard({ engine }: { engine: string }) {
  const meta = ENGINE_META[engine] ?? { label: engine, color: '#6B7280' }
  return (
    <div
      role="region"
      aria-label={`${meta.label} visibility score — runs after your first scan`}
      className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 relative overflow-hidden"
    >
      {/* engine color accent bar — muted until real data */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: meta.color, opacity: 0.3 }}
        aria-hidden="true"
      />

      <EmptyScoreRing />

      <div className="flex flex-col gap-1 min-w-0">
        <span
          className="text-xs font-medium tracking-wide uppercase text-[#9CA3AF]"
          style={{ letterSpacing: '0.06em' }}
        >
          {meta.label}
        </span>
        <p className="text-sm text-[#6B7280] leading-snug">
          Runs after your first scan.
        </p>
      </div>
    </div>
  )
}

function ScoreCard({ score }: { score: VisibilityScore }) {
  const meta = ENGINE_META[score.engine] ?? { label: score.engine, color: '#6B7280' }

  if (score.score === null) {
    return <SetupInProgressCard engine={score.engine} />
  }

  return (
    <div
      role="region"
      aria-label={`${meta.label} visibility score: ${score.score} out of 100`}
      className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 relative overflow-hidden"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      />
      <ScoreRing score={score.score} />
      <div className="flex flex-col gap-1 min-w-0">
        <span
          className="text-xs font-medium tracking-wide uppercase text-[#9CA3AF]"
          style={{ letterSpacing: '0.06em' }}
        >
          {meta.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-semibold text-[#0A0A0A] leading-none tabular-nums">
            {score.score}
          </span>
          <span className="text-sm text-[#9CA3AF]">/100</span>
          <TrendIcon trend={score.trend} />
        </div>
        {score.lastUpdatedAt && (
          <p className="text-xs text-[#9CA3AF] mt-0.5">
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
    </div>
  )
}

export function VisibilityScorePanel({ scores }: VisibilityScorePanelProps) {
  return (
    <section aria-labelledby="visibility-heading">
      <h2
        id="visibility-heading"
        className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3"
        style={{ letterSpacing: '0.08em' }}
      >
        AI Visibility
      </h2>
      <div
        className={cn(
          'grid gap-3',
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
