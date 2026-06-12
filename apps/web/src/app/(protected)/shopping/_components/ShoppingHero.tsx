'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { bandWord } from './score-band'

/**
 * ShoppingHero — TIER-1 focal (card-console-hero, ONE per screen).
 *
 * STEP-1 = a single 64px Geist Mono #3370FF figure (the one blue structural
 * focal). A quiet toggle swaps the headline between AI shopping visibility (%)
 * and AI-attributed revenue (₪). One Fraunces beat lives in the verdict line.
 *
 * Asymmetry (M3): dominant left figure column, narrow right sparkline rail.
 */

type HeroMode = 'visibility' | 'revenue'

interface ShoppingHeroProps {
  /** AI shopping visibility % (0–100) */
  visibility: number
  /** AI-attributed revenue in ILS */
  revenue: number
  /** Period-over-period delta in percentage points (visibility) */
  visibilityDelta: number
  /** Period-over-period delta in % (revenue) */
  revenueDelta: number
  /** Last-5-weeks visibility points for the sparkline */
  trend: number[]
}

function ils(n: number): string {
  return `₪${n.toLocaleString('en-US')}`
}

function DeltaChip({ value, unit }: { value: number; unit: 'pp' | '%' }) {
  const positive = value >= 0
  const cls = positive
    ? 'bg-status-positive text-status-positive'
    : 'bg-status-critical text-status-critical'
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium',
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
      <span className="font-mono tabular-nums">
        {positive ? '+' : ''}
        {value}
        {unit}
      </span>
      <span className="font-sans text-[#6B7280]">vs. previous period</span>
    </span>
  )
}

export function ShoppingHero({
  visibility,
  revenue,
  visibilityDelta,
  revenueDelta,
  trend,
}: ShoppingHeroProps) {
  const [mode, setMode] = useState<HeroMode>('visibility')
  const isVis = mode === 'visibility'

  return (
    <section
      aria-labelledby="shopping-hero-heading"
      className="card-console-hero relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)',
      }}
    >
      <div className="grid gap-8 p-8 lg:grid-cols-[1fr_220px] lg:items-center lg:p-10">
        {/* LEFT — figure + verdict (dominant) */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            {/* STEP-3 eyebrow */}
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              {isVis ? 'AI shopping visibility' : 'AI-attributed revenue'}
            </p>

            {/* Quiet metric toggle — not the focal */}
            <div
              role="group"
              aria-label="Switch hero metric"
              className="flex shrink-0 rounded-lg bg-[#F3F4F6] p-1"
            >
              {(['visibility', 'revenue'] as HeroMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                    mode === m
                      ? 'bg-white text-[#0A0A0A] shadow-sm ring-1 ring-inset ring-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#0A0A0A]',
                  )}
                >
                  {m === 'visibility' ? 'Visibility' : 'Revenue'}
                </button>
              ))}
            </div>
          </div>

          {/* STEP-1 — the one blue 64px mono figure */}
          <div className="mt-3 flex items-end gap-3">
            <span className="font-mono text-[64px] font-medium leading-[0.9] tracking-[-0.03em] tabular-nums text-[#3370FF]">
              {isVis ? `${visibility}%` : ils(revenue)}
            </span>
          </div>

          {/* STEP-2 verdict + the ONE Fraunces beat */}
          <h2
            id="shopping-hero-heading"
            className="mt-4 max-w-[520px] font-[var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]"
          >
            Your shop shows up <SerifVerdict>{bandWord(visibility)}</SerifVerdict> when shoppers ask
            AI
          </h2>

          {/* Delta chip */}
          <div className="mt-4">
            {isVis ? (
              <DeltaChip value={visibilityDelta} unit="pp" />
            ) : (
              <DeltaChip value={revenueDelta} unit="%" />
            )}
          </div>

          {/* STEP-4 body */}
          <p className="mt-4 max-w-[460px] text-[15px] leading-[1.6] text-[#6B7280]">
            This is how often answer engines recommend your products when shoppers ask what to buy —
            and the revenue that traces back to those recommendations.
          </p>
        </div>

        {/* RIGHT — sparkline rail */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Last 5 weeks
          </p>
          <EngineMicroSparkline
            points={trend}
            currentScore={visibility}
            className="h-[48px] w-[160px]"
          />
          <p className="font-mono text-[12px] tabular-nums text-[#6B7280]">
            {trend[0]}% &rarr; {trend[trend.length - 1]}%
          </p>
        </div>
      </div>
    </section>
  )
}
