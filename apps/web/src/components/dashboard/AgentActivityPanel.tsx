'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * AgentActivityPanel — "your crew is on it", in violet.
 *
 * Craft moves applied:
 * M1 — TIER-2 card-console (recedes slightly behind the TIER-1 score hero)
 * M6 — Violet Structure: agent-tint (#EEEAFD) background + violet top-accent
 *       hairline. Reads different at arm's length from white/neutral surfaces.
 *       Violet NEVER on a button — the only CTA stays blue (#3370FF).
 * M8 — designed empty: titled context + specific next step + two-tier CTA
 *       + violet warm character glyph. Errors name a real recovery action.
 * M9 — craft-enter-2 entrance (staggered after hero)
 * M11 — approvalCount in Geist Mono tabular-nums
 */

type State = 'loading' | 'empty' | 'error' | 'populated'

interface AgentActivityPanelProps {
  approvalCount: number
  state?: State
  errorMessage?: string
}

function Heading() {
  return (
    <div className="flex items-center gap-2 px-5 py-4">
      {/* violet dot = the crew, breathing quietly */}
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-agent opacity-40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-agent" />
      </span>
      <h2 id="agent-activity-heading" className="text-sm font-semibold text-[#0A0A0A]">
        Your crew
      </h2>
    </div>
  )
}

export function AgentActivityPanel({
  approvalCount,
  state = 'populated',
  errorMessage,
}: AgentActivityPanelProps) {
  const resolved: State =
    state === 'populated' && approvalCount === 0 ? 'empty' : state

  return (
    <section
      aria-labelledby="agent-activity-heading"
      /* M1 TIER-2 card | M6 agent-tint ground | M9 craft-enter-2 */
      className="card-console flex h-full flex-col overflow-hidden craft-enter craft-enter-2"
      style={{ backgroundColor: 'var(--color-agent-tint)' }}
    >
      {/* M6 violet top-accent hairline */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full rounded-t-[16px]"
        style={{ backgroundColor: 'var(--color-agent)' }}
      />
      <Heading />
      <div className="border-t border-[rgba(110,86,240,0.12)]" />

      {resolved === 'loading' && (
        <div className="flex-1 space-y-3 p-5" aria-busy="true" aria-label="Loading crew activity">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#F3F4F6]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-[#F3F4F6]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved === 'error' && (
        /* M8 error state: titled + recovery action + two-tier CTA */
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <p className="text-sm font-semibold text-[#0A0A0A]">Couldn&apos;t reach the crew</p>
          <p className="mt-1.5 max-w-[220px] text-[13px] leading-relaxed text-[#6B7280]">
            {errorMessage ?? 'Connection dropped. Your agents are still running — reload to see their status.'}
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Reload dashboard
            </Link>
            <Link
              href="/approvals"
              className="text-[12px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none"
            >
              Check agent status
            </Link>
          </div>
        </div>
      )}

      {resolved === 'empty' && (
        /* M8 designed empty: character glyph + context + specific next step + two-tier CTA */
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          {/* violet character glyph — moments only, never persistent */}
          <div
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(110,86,240,0.15)' }}
            aria-hidden="true"
          >
            <Sparkles className="h-5 w-5 text-agent" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-[#0A0A0A]">The crew is watching</p>
          <p className="mt-1.5 max-w-[220px] text-[13px] leading-relaxed text-[#6B7280]">
            Nothing needs your sign-off right now. When a fix is ready, it lands here.
          </p>
          {/* M8 two-tier: primary blue pill + quiet secondary link */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <Link
              href="/scan"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Run a scan now
            </Link>
            <Link
              href="/approvals"
              className="text-[12px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none"
            >
              View agent activity
            </Link>
          </div>
        </div>
      )}

      {resolved === 'populated' && (
        <>
          <div className="px-5 py-4">
            <p className="text-[13px] leading-relaxed text-[#374151]">
              The crew has{' '}
              <span className="font-mono font-semibold text-agent tabular-nums">
                {approvalCount}
              </span>{' '}
              {approvalCount === 1 ? 'fix' : 'fixes'} ready for your review.
            </p>
          </div>

          {/* dense agent-run ledger — Linear-log density: divide-y rows */}
          <ul className="divide-y divide-[rgba(110,86,240,0.10)]" aria-label="Fixes ready for review">
            {Array.from({ length: Math.min(approvalCount, 3) }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgba(110,86,240,0.06)]"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-agent-tint"
                  aria-hidden="true"
                >
                  <Sparkles className="h-3.5 w-3.5 text-agent" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
                    {['New FAQ block drafted', 'Service page rewrite ready', 'Competitor gap closed'][i]}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF]">
                    awaiting review
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-status-agent px-2 py-0.5 text-[11px] font-medium text-status-agent">
                  ready
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-[#F3F4F6] px-5 py-3">
            <Link
              href="/approvals"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
            >
              Review all {approvalCount}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
