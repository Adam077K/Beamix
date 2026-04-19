'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface ScoreHeroProps {
  score: number
  delta: number
  sparkline: number[]
}

function scoreColor(score: number): string {
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function buildSparklinePath(data: number[], w: number, h: number): { line: string; area: string } {
  if (data.length < 2) return { line: '', area: '' }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`
  return { line, area }
}

export function ScoreHero({ score, delta, sparkline }: ScoreHeroProps) {
  const motionScore = useMotionValue(0)
  const displayRef = useRef<HTMLSpanElement>(null)
  const color = scoreColor(score)
  const isPositive = delta >= 0

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

  const { line, area } = buildSparklinePath(sparkline, 120, 40)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
      {/* Score block */}
      <div className="flex items-end gap-4">
        <div className="flex items-baseline gap-1">
          <span
            ref={displayRef}
            className="text-[80px] font-semibold leading-none tabular-nums"
            style={{ color }}
          >
            0
          </span>
          <span className="mb-2 text-2xl font-medium text-gray-300">/100</span>
        </div>

        {/* Delta pill */}
        <span
          className={cn(
            'mb-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
            isPositive
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700',
          )}
        >
          {isPositive ? '↑' : '↓'}
          {Math.abs(delta)}
          <span className="font-normal text-opacity-75"> vs last scan</span>
        </span>
      </div>

      {/* Sparkline */}
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Trend</span>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <svg
            width="120"
            height="40"
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {area && (
              <path d={area} fill="url(#sparkFill)" />
            )}
            {line && (
              <path
                d={line}
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
