'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface ScoreHeroProps {
  score: number
  delta: number
  sparkline: number[]
  businessName?: string
}

function verdictWord(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 25) return 'Fair'
  return 'Critical'
}

function verdictSubtitle(score: number): string {
  if (score >= 75) return 'AI search engines cite you consistently. Keep the momentum.'
  if (score >= 50) return 'You show up, but gaps exist. Agents are ready to close them.'
  if (score >= 25) return 'Visibility is limited. Priority fixes will move the needle fast.'
  return 'Competitors are capturing your traffic. Start with high-impact fixes.'
}

function scoreColor(score: number): string {
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function scoreBg(score: number): string {
  if (score >= 75) return 'bg-cyan-50'
  if (score >= 50) return 'bg-emerald-50'
  if (score >= 25) return 'bg-amber-50'
  return 'bg-red-50'
}

function buildSparklinePath(data: number[], w: number, h: number): { line: string; area: string } {
  if (data.length < 2) return { line: '', area: '' }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${h} L${points[0].x.toFixed(1)},${h} Z`
  return { line, area }
}

export function ScoreHero({ score, delta, sparkline, businessName }: ScoreHeroProps) {
  const motionScore = useMotionValue(0)
  const displayRef = useRef<HTMLSpanElement>(null)
  const color = scoreColor(score)
  const isPositive = delta >= 0
  const verdict = verdictWord(score)
  const subtitle = verdictSubtitle(score)

  useEffect(() => {
    const controls = animate(motionScore, score, {
      ...spring.subtle,
      duration: 1.4,
      onUpdate(latest) {
        if (displayRef.current) {
          displayRef.current.textContent = String(Math.round(latest))
        }
      },
    })
    return controls.stop
  }, [score, motionScore])

  const { line, area } = buildSparklinePath(sparkline, 128, 44)

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-sm',
      'sm:px-8 sm:py-7',
    )}>
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: score + verdict */}
        <div className="flex items-start gap-5">
          {/* Score number */}
          <div className="flex items-baseline gap-1.5 leading-none">
            <span
              ref={displayRef}
              className="text-[72px] font-semibold leading-none tabular-nums tracking-tight sm:text-[88px]"
              style={{
                color,
                fontFamily: "'Fraunces', 'Georgia', serif",
                fontWeight: 300,
              }}
              aria-label={`AI visibility score: ${score} out of 100`}
            >
              0
            </span>
            <span className="mb-1 self-end text-xl font-normal text-gray-300">/100</span>
          </div>

          {/* Verdict + delta + subtitle */}
          <div className="flex flex-col gap-1.5 pt-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-sm font-semibold',
                  scoreBg(score),
                )}
                style={{ color }}
              >
                {verdict}
              </span>
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring.subtle, delay: 0.5 }}
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
                )}
              >
                <span aria-hidden="true">{isPositive ? '↑' : '↓'}</span>
                {Math.abs(delta)} pts
              </motion.span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              {subtitle}
            </p>
            {businessName && (
              <p className="text-xs font-medium text-gray-400">{businessName}</p>
            )}
          </div>
        </div>

        {/* Right: sparkline */}
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            6-scan trend
          </span>
          <div className={cn(
            'rounded-xl border border-gray-100 p-3',
            scoreBg(score).replace('bg-', 'bg-').replace('50', '50/40'),
          )}>
            <svg
              width="128"
              height="44"
              viewBox="0 0 128 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Visibility score trend over last 6 scans"
              role="img"
            >
              <defs>
                <linearGradient id={`sparkFill-hero`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {area && (
                <path d={area} fill={`url(#sparkFill-hero)`} />
              )}
              {line && (
                <path
                  d={line}
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </svg>
          </div>
          <span className="text-[10px] text-gray-400">vs last scan: <span className={isPositive ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{isPositive ? '+' : ''}{delta}</span></span>
        </div>
      </div>
    </div>
  )
}
