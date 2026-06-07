'use client'

/**
 * ScanPendingState — the scanning / loading state for /scan/[scan_id].
 *
 * Shows an animated ledger fill (NOT bouncing dots). Three engine rows with
 * a sequential shimmer indicating live scanning activity. Progress bar
 * animates with a smooth fill. Reduced motion: static rows, no shimmer.
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

interface ScanPendingStateProps {
  businessName: string
}

const ENGINES = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'perplexity', label: 'Perplexity' },
]

export function ScanPendingState({ businessName }: ScanPendingStateProps) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0.08)

  useEffect(() => {
    // Reduced motion: hold a calm static state — no interval-driven updates.
    if (reduced) {
      setProgress(0.5)
      return
    }
    // Slowly advance the progress bar — it never reaches 1 until real completion.
    const interval = window.setInterval(() => {
      setProgress((p) => Math.min(p + (1 - p) * 0.04, 0.85))
    }, 1200)
    return () => window.clearInterval(interval)
  }, [reduced])

  // Active engine derived from progress so completed rows never regress to "Queued".
  const activeIndex = Math.min(
    Math.floor(progress * ENGINES.length),
    ENGINES.length - 1,
  )

  return (
    <div className="card-console p-8">
      {/* Status line */}
      <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        Scanning {businessName}
      </p>

      {/* Progress needle */}
      <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] origin-left transition-transform duration-[400ms] ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Engine rows — shimmer on the active row */}
      <div className="mt-8 divide-y divide-[var(--color-border)]">
        {ENGINES.map((engine, i) => {
          const isActive = i === activeIndex
          return (
            <div
              key={engine.id}
              className="flex items-center justify-between py-4"
            >
              <span className="text-[15px] font-medium text-[var(--color-text-primary)]">
                {engine.label}
              </span>
              <span
                className={cn(
                  'font-mono text-[13px] text-[var(--color-text-disabled)] transition-opacity duration-300',
                  isActive && 'motion-safe:opacity-50',
                )}
                aria-hidden="true"
              >
                {isActive ? 'Querying…' : i < activeIndex ? 'Done' : 'Queued'}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-[13px] text-[var(--color-text-disabled)]">
        Checking how AI answers questions about your business. About 60 seconds.
      </p>
    </div>
  )
}
