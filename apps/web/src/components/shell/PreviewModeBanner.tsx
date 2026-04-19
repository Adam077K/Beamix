'use client'

import * as React from 'react'

export interface PreviewModeBannerProps {
  onUpgrade: () => void
}

export function PreviewModeBanner({ onUpgrade }: PreviewModeBannerProps) {
  return (
    <div
      role="banner"
      aria-label="Preview mode — upgrade required"
      className="flex h-10 w-full items-center justify-center bg-[#0A0A0A] px-4 text-white"
    >
      <span className="text-sm text-white/80">
        Preview mode &mdash; upgrade to unlock agents
      </span>
      <button
        onClick={onUpgrade}
        className={[
          'ms-4 rounded bg-[#3370FF] px-4 py-1 text-xs font-medium text-white',
          'transition-all duration-150 hover:bg-[#2558e8] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
        ].join(' ')}
      >
        Upgrade
      </button>
    </div>
  )
}
