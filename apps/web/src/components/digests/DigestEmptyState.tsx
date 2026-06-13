'use client'

import Link from 'next/link'
import { EmptyState } from '@/components/empty-state'

/**
 * DigestEmptyState — the warm "first digest lands Sunday" promise (M8).
 *
 * Audit #4 fix: the old layout led with a 30–40% opacity ghost skeleton that
 * filled the whole viewport and read as a stuck/failed load. We invert the
 * priority — the warm verdict ("Your first weekly digest lands this Sunday")
 * and the two-tier recovery lead ABOVE the fold via the shared EmptyState
 * template; the ghost preview, if shown at all, is demoted to a small scrimmed
 * "shape of what's coming" behind the glyph, never the dominant element.
 *
 * Two-tier recovery (M8): primary intent = the Sunday promise + a quiet link to
 * the live dashboard (no hard CTA button — there is nothing to "do" yet, the
 * digest is written for you each week). The on-brand glyph replaces the bare
 * centered-icon-in-void.
 */
export function DigestEmptyState() {
  return (
    <EmptyState
      align="top"
      illustration="archive"
      title="Your first weekly digest lands this Sunday"
      description="Every Sunday we write up what moved across ChatGPT, Gemini, and Perplexity — and exactly what the crew shipped to get you there. Your record starts with your first full week."
      preview={<GhostDigestPreview />}
      action={
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded text-[13px] font-medium text-[#3370FF] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          See your live dashboard in the meantime →
        </Link>
      }
    />
  )
}

/**
 * GhostDigestPreview — a small, scrimmed shape of a real digest row, shown
 * behind the EmptyState glyph at ~40% opacity (EmptyState applies the scrim).
 * It hints at the shape of what's coming without pretending to be loading data.
 */
function GhostDigestPreview() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[#E5E7EB] bg-white p-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-2.5"
          aria-hidden="true"
        >
          <div className="w-16 shrink-0 space-y-1">
            <div className="h-3 w-14 rounded bg-[#EEF1F5]" />
            <div className="h-2.5 w-10 rounded bg-[#F3F4F6]" />
          </div>
          <div className="h-3 flex-1 rounded bg-[#EEF1F5]" />
          <div className="flex shrink-0 gap-1">
            <div className="h-4 w-9 rounded-full bg-[#E8F3EC]" />
            <div className="h-4 w-9 rounded-full bg-[#E8F3EC]" />
          </div>
        </div>
      ))}
    </div>
  )
}
