'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DigestPanelBody } from './DigestPanelBody'
import type { WeeklyDigest } from '@/types/digest'

interface DigestPanelProps {
  digest: WeeklyDigest | null
  onClose: () => void
}

/**
 * DigestPanel — slide-over panel for ≥1024px.
 *
 * Anchored right, 480px wide. List stays fully visible (no backdrop scrim).
 * role="dialog" aria-modal="false" — not a true modal; list remains interactive.
 *
 * Motion: transform translateX only, 200ms cubic-bezier(0.4,0,0.2,1).
 * prefers-reduced-motion: global CSS override snaps to instant.
 *
 * A11y:
 *  - Focus moves to close button on open
 *  - Esc closes
 *  - Focus returns to the list row that triggered open
 */
export function DigestPanel({ digest, onClose }: DigestPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const isOpen = digest !== null

  // Move focus to close button when panel opens
  useEffect(() => {
    if (isOpen && closeBtnRef.current) {
      closeBtnRef.current.focus()
    }
  }, [isOpen, digest?.id])

  // Esc key handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={digest ? `Digest: ${digest.weekLabel}` : 'Digest details'}
      aria-hidden={!isOpen}
      className={cn(
        'flex h-full w-[480px] shrink-0 flex-col border-l border-[#E5E7EB] bg-white',
        'transition-smooth',
        isOpen
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none',
      )}
    >
      {digest && (
        <>
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#F3F4F6] bg-white px-5 py-4">
            <div className="min-w-0 flex-1 pr-3">
              <p className="font-[var(--font-display)] text-[20px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A]">
                {digest.weekLabel}
              </p>
              <p className="mt-1 truncate text-[15px] text-[#6B7280]">
                {digest.digest.headline}
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
              aria-label="Close digest"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <DigestPanelBody digest={digest} />
          </div>
        </>
      )}
    </div>
  )
}
