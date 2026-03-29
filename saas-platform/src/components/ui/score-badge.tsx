'use client'

import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function getScoreLevel(score: number) {
  if (score >= 75) return { level: 'excellent' as const, label: 'Excellent', color: 'text-[var(--color-score-excellent)]', bg: 'bg-[var(--color-score-excellent)]/10' }
  if (score >= 50) return { level: 'good' as const, label: 'Good', color: 'text-[var(--color-score-good)]', bg: 'bg-[var(--color-score-good)]/10' }
  if (score >= 25) return { level: 'fair' as const, label: 'Fair', color: 'text-[var(--color-score-fair)]', bg: 'bg-[var(--color-score-fair)]/10' }
  return { level: 'critical' as const, label: 'Critical', color: 'text-[var(--color-score-critical)]', bg: 'bg-[var(--color-score-critical)]/10' }
}

const sizeClasses = {
  sm: 'text-sm px-2 py-0.5',
  md: 'text-base px-3 py-1',
  lg: 'text-lg px-4 py-1.5 font-medium',
}

export function ScoreBadge({ score, size = 'md', showLabel = true, className }: ScoreBadgeProps) {
  const { label, color, bg } = getScoreLevel(score)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full', bg, color, sizeClasses[size], className)}>
      <span className="font-semibold">{score}</span>
      {showLabel && <span className="font-normal opacity-80">/ 100 · {label}</span>}
    </span>
  )
}

export { getScoreLevel }
