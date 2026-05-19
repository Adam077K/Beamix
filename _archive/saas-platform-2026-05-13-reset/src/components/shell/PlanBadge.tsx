'use client'

interface PlanBadgeProps {
  tier: 'discover' | 'build' | 'scale' | null
}

export function PlanBadge({ tier }: PlanBadgeProps) {
  if (!tier) return null

  const styles: Record<'discover' | 'build' | 'scale', string> = {
    discover: 'bg-gray-100 text-gray-700',
    build: 'bg-[#3370FF] text-white',
    scale: 'bg-gradient-to-r from-[#3370FF] to-purple-500 text-white',
  }

  return (
    <span
      className={`inline-flex items-center px-[10px] py-[2px] rounded-full text-xs font-medium capitalize ${styles[tier]}`}
    >
      {tier}
    </span>
  )
}
