'use client'

import Link from 'next/link'

/**
 * TraceabilityEmpty — empty state for the traceability screen.
 *
 * Design laws:
 * - bg-surface-warm (warm off-white, not grey-on-grey)
 * - ONE Fraunces beat: empty headline uses the serif
 * - Illustrative mark: faint violet thread + single empty node, aria-hidden
 * - Blue CTA → /scans (blue = you)
 * - No green on this surface
 */
function EmptyIllustration() {
  return (
    <svg
      width="48"
      height="64"
      viewBox="0 0 48 64"
      fill="none"
      aria-hidden="true"
      className="mb-6"
    >
      {/* Vertical thread — violet at 30% opacity */}
      <line x1="24" y1="8" x2="24" y2="52" stroke="#6E56F0" strokeOpacity="0.30" strokeWidth="1.5" />
      {/* Terminal node — near-black line, bg-agent-tint fill */}
      <circle
        cx="24"
        cy="28"
        r="7"
        fill="var(--color-agent-tint)"
        stroke="#0A0A0A"
        strokeWidth="1.25"
        strokeOpacity="0.15"
      />
      {/* Inner dot */}
      <circle cx="24" cy="28" r="2.5" fill="#6E56F0" fillOpacity="0.40" />
    </svg>
  )
}

export function TraceabilityEmpty() {
  return (
    <div className="card-console bg-surface-warm">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <EmptyIllustration />

        {/* ONE Fraunces serif beat — empty headline only */}
        <h2 className="font-[var(--font-serif)] text-[20px] text-[#0A0A0A]">
          No results to trace yet.
        </h2>

        <p className="mt-3 max-w-[340px] text-[14px] leading-relaxed text-[#6B7280]">
          Once your first scan runs and the crew makes its first fixes, every result shows up
          here — and you&apos;ll see exactly what produced it: the article, the date, the link.
        </p>

        <Link
          href="/scans"
          className="mt-6 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          Run your first scan
        </Link>
      </div>
    </div>
  )
}
