'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BlueScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
  className?: string
}

const SIZE_MAP = {
  sm:  { outer: 80,  stroke: 6,  fontSize: 'text-xl' },
  md:  { outer: 120, stroke: 8,  fontSize: 'text-3xl' },
  lg:  { outer: 160, stroke: 10, fontSize: 'text-5xl' },
} as const

// Always blue — no score-based color changes for marketing use
const RING_COLOR = '#3370FF'
const TRACK_COLOR = '#E8EEFB'

export function BlueScoreRing({
  score,
  size = 'lg',
  showLabel = true,
  animate = true,
  className,
}: BlueScoreRingProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const config = SIZE_MAP[size]
  const radius = (config.outer / 2) - (config.stroke / 2) - 4
  const circumference = 2 * Math.PI * radius
  const normalized = Math.max(0, Math.min(100, score))
  const strokeDashoffset = circumference - (normalized / 100) * circumference

  useEffect(() => {
    if (!animate || !progressRef.current) return
    const el = progressRef.current
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    // Force reflow to ensure animation starts from zero
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.strokeDashoffset = String(strokeDashoffset)
  }, [score, circumference, strokeDashoffset, animate])

  const cx = config.outer / 2
  const cy = config.outer / 2

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{
        width: config.outer,
        height: config.outer,
        filter: 'drop-shadow(0 0 20px rgba(51,112,255,0.15))',
      }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`AI visibility score: ${score} out of 100`}
    >
      <svg
        width={config.outer}
        height={config.outer}
        viewBox={`0 0 ${config.outer} ${config.outer}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track ring — very light blue */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={TRACK_COLOR}
          strokeWidth={config.stroke}
        />
        {/* Progress ring — always primary blue */}
        <circle
          ref={progressRef}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={RING_COLOR}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          style={!animate ? { transition: 'none' } : undefined}
        />
      </svg>

      {/* Score number — black, not colored by score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUpNumber
          value={score}
          animate={animate}
          className={cn('font-mono font-bold tabular-nums text-foreground', config.fontSize)}
        />
        {showLabel && (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            /100
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Count-up animation helper ─────────────────────────────────────────────

interface CountUpNumberProps {
  value: number
  animate: boolean
  className?: string
}

function CountUpNumber({ value, animate, className }: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!animate || !ref.current) return
    const el = ref.current
    const end = value
    const duration = 1000
    const startTime = performance.now()

    function update(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = String(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [value, animate])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
