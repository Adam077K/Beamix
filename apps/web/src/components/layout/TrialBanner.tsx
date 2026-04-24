'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface TrialBannerProps {
  planTier: string | null
  trialEndsAt: string | null
  trialStartsAt: string | null
}

export function TrialBanner({ planTier, trialEndsAt, trialStartsAt }: TrialBannerProps) {
  if (!planTier || !trialEndsAt) return null

  const now = Date.now()
  const endsMs = new Date(trialEndsAt).getTime()
  const daysRemaining = Math.max(0, Math.ceil((endsMs - now) / (24 * 3600 * 1000)))

  const startsMs = trialStartsAt ? new Date(trialStartsAt).getTime() : endsMs - 14 * 24 * 3600 * 1000
  const totalDays = Math.round((endsMs - startsMs) / (24 * 3600 * 1000))
  const currentDay = Math.min(totalDays, totalDays - daysRemaining + 1)

  const formattedDate = new Date(trialEndsAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const isUrgent = daysRemaining <= 3
  const tierLabel = planTier.charAt(0).toUpperCase() + planTier.slice(1)

  if (isUrgent) {
    return (
      <div className="sticky top-0 z-50 h-10 flex items-center justify-between px-4 bg-amber-50 border-b border-amber-200 text-amber-900">
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <AlertTriangle size={13} className="shrink-0 text-amber-500" />
          {tierLabel} trial &middot; Day {currentDay} of {totalDays} &middot; Ends {formattedDate}
        </span>
        <Link
          href="/settings?tab=billing"
          className="text-xs font-medium text-amber-700 hover:underline underline-offset-2 shrink-0"
        >
          Manage billing &rarr;
        </Link>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-50 h-10 flex items-center justify-between px-4 bg-[#3370FF]/[0.08] border-b border-[#3370FF]/[0.15] text-[#0a0a0a]">
      <span className="text-xs font-medium">
        {tierLabel} trial &middot; Day {currentDay} of {totalDays} &middot; Ends {formattedDate}
      </span>
      <Link
        href="/settings?tab=billing"
        className="text-xs font-medium text-[#3370FF] hover:underline underline-offset-2 shrink-0"
      >
        Manage billing &rarr;
      </Link>
    </div>
  )
}
