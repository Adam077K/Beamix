'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
  className?: string
}

/*
  SVG-based circular progress ring.
  - Size sm: 80px  (sidebar compact display)
  - Size md: 120px (rankings cards)
  - Size lg: 160px (hero score on overview)
*/

const SIZE_MAP = {
  sm:  { outer: 80,  stroke: 6,  fontSize: 'text-xl' },
  md:  { outer: 120, stroke: 8,  fontSize: 'text-3xl' },
  lg:  { outer: 160, stroke: 10, fontSize: 'text-5xl' },
} as const

function getScoreColor(score: number | null): string {
  if (score === null) return '#E5E7EB'
  if (score >= 75) return '#06B6D4' // score-excellent
  if (score >= 50) return '#10B981' // score-good
  if (score >= 25) return '#F59E0B' // score-fair
  return '#EF4444'                   // score-critical
}

function getScoreGlowClass(score: number | null): string {
  if (score === null) return ''
  if (score >= 75) return 'drop-shadow-[0_0_12px_rgba(6,182,212,0.40)]'
  if (score >= 50) return 'drop-shadow-[0_0_12px_rgba(16,185,129,0.40)]'
  if (score >= 25) return 'drop-shadow-[0_0_12px_rgba(245,158,11,0.40)]'
  return 'drop-shadow-[0_0_12px_rgba(239,68,68,0.40)]'
}

function getScoreLabel(score: number | null): string {
  if (score === null) return ''
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

export function ScoreRing({
  score,
  size = 'lg',
  showLabel = true,
  animate = true,
  className,
}: ScoreRingProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const config = SIZE_MAP[size]
  const radius = (config.outer / 2) - (config.stroke / 2) - 4
  const circumference = 2 * Math.PI * radius
  const normalized = score !== null ? Math.max(0, Math.min(100, score)) : 0
  const strokeDashoffset = circumference - (normalized / 100) * circumference

  useEffect(() => {
    if (!animate || !progressRef.current) return
    // Start from full offset (empty ring), animate to target
    const el = progressRef.current
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    // Force reflow
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.strokeDashoffset = String(strokeDashoffset)
  }, [score, circumference, strokeDashoffset, animate])

  const cx = config.outer / 2
  const cy = config.outer / 2
  const color = getScoreColor(score)

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: config.outer, height: config.outer }}
      role="meter"
      aria-valuenow={score ?? undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={
        score !== null
          ? `AI visibility score: ${score} out of 100, ${getScoreLabel(score)}`
          : 'AI visibility score: no data'
      }
    >
      <svg
        width={config.outer}
        height={config.outer}
        viewBox={`0 0 ${config.outer} ${config.outer}`}
        className={cn(
          '-rotate-90', // Start ring at top
          animate && score !== null ? getScoreGlowClass(score) : '',
        )}
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-border opacity-40"
        />
        {/* Progress ring */}
        <circle
          ref={progressRef}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          style={!animate ? { transition: 'none' } : undefined}
        />
      </svg>

      {/* Score number — centered inside ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score !== null ? (
          <>
            <CountUpNumber
              value={score}
              className={cn('font-mono font-bold tabular-nums', config.fontSize)}
              style={{ color }}
            />
            {showLabel && (
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                /100
              </span>
            )}
          </>
        ) : (
          <span className={cn('font-mono font-bold tabular-nums text-muted-foreground/40', config.fontSize)}>
            --
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Count-up animation helper ─────────────────────────────────────────────

interface CountUpNumberProps {
  value: number
  className?: string
  style?: React.CSSProperties
}

function CountUpNumber({ value, className, style }: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const end = value
    const duration = 1000 // ms — matches ring animation
    const startTime = performance.now()

    function update(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = String(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [value])

  return (
    <span ref={ref} className={className} style={style}>
      {value}
    </span>
  )
}
