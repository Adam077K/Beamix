'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DigestErrorProps {
  onRetry?: () => void
}

/**
 * DigestError — inset error state on bg-surface-warm inside .card-console.
 *
 * Neutral-toned (no red panel). status-critical reserved for the inline icon only.
 * "Try again" is a quiet outline button — blue is not used here (no CTA register).
 */
export function DigestError({ onRetry }: DigestErrorProps) {
  return (
    <div className="card-console overflow-hidden">
      <div className="bg-surface-warm rounded-[inherit] px-6 py-10 text-center">
        <div
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3F4F6] bg-white"
          aria-hidden="true"
        >
          <AlertCircle
            className="h-5 w-5 text-status-critical"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-sm font-medium text-[#374151]">
          We couldn&apos;t load your digests just now.
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
          Give it a moment and refresh — your digests are safe.
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
