import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * TraceabilityEmpty — designed empty state (tell #5, M8).
 *
 * Not the textbook centered icon-in-circle. The content is left-anchored
 * against an editorial thread illustration (blue=you node → violet=agent nodes),
 * which doubles as a preview of what a real trail looks like. Two-tier recovery:
 * a primary blue CTA + a quiet secondary link (M8).
 *
 * Design laws:
 *  - bg-surface-warm (warm off-white, not grey-on-grey)
 *  - ONE Fraunces beat: the headline noun
 *  - Violet (#6E56F0) thread nodes = agent work; blue node = the result (you)
 *  - No green on this surface
 */

/** Editorial preview thread — a blue result node fed by violet agent nodes. */
function PreviewThread() {
  return (
    <svg
      width="120"
      height="180"
      viewBox="0 0 120 180"
      fill="none"
      aria-hidden="true"
      className="h-[160px] w-auto shrink-0"
    >
      {/* Vertical thread */}
      <line x1="20" y1="20" x2="20" y2="160" stroke="#6E56F0" strokeOpacity="0.3" strokeWidth="1.5" />

      {/* Three violet agent nodes (the work) */}
      {[28, 78, 128].map((cy) => (
        <g key={cy}>
          <circle cx="20" cy={cy} r="6" fill="var(--color-agent-tint)" stroke="#6E56F0" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="20" cy={cy} r="2" fill="#6E56F0" fillOpacity="0.5" />
          {/* Ghost deliverable ticket */}
          <rect x="36" y={cy - 9} width="68" height="18" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
          <rect x="42" y={cy - 3} width="40" height="5" rx="2.5" fill="#EEEAFD" />
        </g>
      ))}

      {/* Terminal blue result node (the outcome — you) */}
      <circle cx="20" cy="160" r="7" fill="#EEF2FF" stroke="#3370FF" strokeWidth="1.5" />
      <circle cx="20" cy="160" r="2.5" fill="#3370FF" />
    </svg>
  )
}

export function TraceabilityEmpty() {
  return (
    <div className="card-console craft-enter bg-surface-warm">
      <div className="flex flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:gap-12 sm:px-10 sm:py-12">
        {/* Editorial thread preview — left-anchored, breaks dead-center symmetry */}
        <div className="hidden sm:block">
          <PreviewThread />
        </div>

        {/* Copy block — left-aligned */}
        <div className="max-w-[420px]">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]">
            No results traced yet
          </p>

          {/* ONE Fraunces beat — the noun */}
          <h2 className="text-[22px] leading-snug text-[#0A0A0A] sm:text-[24px]">
            Every result will arrive with its{' '}
            <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>receipt.</em>
          </h2>

          <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280]">
            Once your first scan runs and the crew ships its first fixes, every ranking change
            shows up here — with the exact article, schema, and citation that produced it, each
            one dated and linked.
          </p>

          {/* M8 two-tier recovery — primary blue CTA + quiet secondary link */}
          <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/scans"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Run your first scan
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/scans"
              className="text-[13px] text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              or view past scans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
