'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, animate } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface ScoreHeroProps {
  score: number
  delta: number
  sparkline: number[]
}

function getVerdict(score: number): {
  label: string
  color: string
  bgClass: string
  ringClass: string
} {
  if (score >= 75)
    return { label: 'Excellent', color: '#06B6D4', bgClass: 'bg-cyan-50', ringClass: 'ring-cyan-200' }
  if (score >= 50)
    return { label: 'Good', color: '#10B981', bgClass: 'bg-green-50', ringClass: 'ring-green-200' }
  if (score >= 25)
    return { label: 'Fair', color: '#F59E0B', bgClass: 'bg-amber-50', ringClass: 'ring-amber-200' }
  return { label: 'Critical', color: '#EF4444', bgClass: 'bg-red-50', ringClass: 'ring-red-200' }
}

function buildSparklinePath(
  data: number[],
  w: number,
  h: number,
): { line: string; area: string; endX: number; endY: number } {
  if (data.length < 2) return { line: '', area: '', endX: 0, endY: 0 }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = h * 0.1
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - pad - ((v - min) / range) * (h - 2 * pad),
  }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${h} L${points[0].x.toFixed(1)},${h} Z`
  const last = points[points.length - 1]
  return { line, area, endX: last.x, endY: last.y }
}

export function ScoreHero({ score, delta, sparkline }: ScoreHeroProps) {
  const motionScore = useMotionValue(0)
  const displayRef = useRef<HTMLSpanElement>(null)
  const verdict = getVerdict(score)
  const isPositive = delta > 0
  const isNeutral = delta === 0

  useEffect(() => {
    const controls = animate(motionScore, score, {
      ...spring.subtle,
      duration: 1.2,
      onUpdate(latest) {
        if (displayRef.current) {
          displayRef.current.textContent = String(Math.round(latest))
        }
      },
    })
    return controls.stop
  }, [score, motionScore])

  const { line, area, endX, endY } = buildSparklinePath(sparkline, 100, 36)

  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm">
      {/* Label row */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          AI Visibility Score
        </h1>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
            verdict.bgClass,
            verdict.ringClass,
          )}
          style={{ color: verdict.color }}
        >
          {verdict.label}
        </span>
      </div>

      {/* Score + trend — stacks on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {/* Score number block */}
        <div className="flex items-baseline gap-3">
          <span
            ref={displayRef}
            className="font-sans text-[72px] font-semibold leading-none tabular-nums sm:text-[88px]"
            style={{ color: verdict.color }}
            aria-live="polite"
            aria-label={`${score} out of 100`}
          >
            0
          </span>
          <span className="mb-1 text-2xl font-medium text-muted-foreground/40 sm:mb-2">/100</span>

          {/* Delta badge */}
          <span
            className={cn(
              'mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:mb-2',
              isNeutral
                ? 'bg-muted text-muted-foreground'
                : isPositive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600',
            )}
            aria-label={`${isNeutral ? 'No change' : isPositive ? `Up ${delta}` : `Down ${Math.abs(delta)}`} since last scan`}
          >
            <DeltaIcon size={11} strokeWidth={2} aria-hidden="true" />
            {!isNeutral && <span>{Math.abs(delta)}</span>}
            <span className="font-normal opacity-70">vs last scan</span>
          </span>
        </div>

        {/* Right side: verdict copy + sparkline */}
        <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
          <p className="text-sm text-muted-foreground">
            Visibility is{' '}
            <span className="font-medium" style={{ color: verdict.color }}>
              {verdict.label.toLowerCase()}
            </span>
            .
          </p>

          {/* Sparkline */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Trend
            </span>
            <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
              <svg
                width="100"
                height="36"
                viewBox="0 0 100 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={verdict.color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={verdict.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {area && <path d={area} fill="url(#sparkFill)" />}
                {line && (
                  <path
                    d={line}
                    stroke={verdict.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
                {endX !== undefined && endY !== undefined && line !== '' && (
                  <circle cx={endX.toFixed(1)} cy={endY.toFixed(1)} r="2.5" fill={verdict.color} />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Skeleton — mirrors real layout to prevent CLS */
export function ScoreHeroSkeleton() {
  return (
    <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-baseline gap-3">
          <div className="h-[72px] w-28 animate-pulse rounded-lg bg-muted sm:h-[88px]" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="h-12 w-28 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
