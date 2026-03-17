'use client'

import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

function getScoreLevel(score: number) {
  if (score >= 75) return { level: 'excellent' as const, label: 'Excellent', color: 'text-[#06B6D4]', bg: 'bg-cyan-50 dark:bg-cyan-950' }
  if (score >= 50) return { level: 'good' as const, label: 'Good', color: 'text-[#10B981]', bg: 'bg-green-50 dark:bg-green-950' }
  if (score >= 25) return { level: 'fair' as const, label: 'Fair', color: 'text-[#F59E0B]', bg: 'bg-amber-50 dark:bg-amber-950' }
  return { level: 'critical' as const, label: 'Critical', color: 'text-[#EF4444]', bg: 'bg-red-50 dark:bg-red-950' }
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
