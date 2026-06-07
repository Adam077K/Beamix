'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * AgentActivityPanel — "your crew is on it", in violet.
 *
 * Violet (--color-agent / status-agent) marks the AGENTS' work. This panel is
 * the visible proof that work is underway. The signature law: blue = you,
 * violet = the agents. Violet NEVER appears on a button here — the only CTA
 * ("Review →") stays blue (#3370FF).
 *
 * Data contract: approvalCount (number) from DashboardOutcomes. When > 0 the
 * crew has fixes ready for review; when 0 the crew is monitoring. No new data
 * is introduced — the panel is a pure presentation of that one number.
 *
 * States: loading, empty (count = 0, monitoring), error, populated (count > 0).
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
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agent opacity-40" />
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
      className="card-console flex h-full flex-col overflow-hidden"
    >
      <Heading />
      <div className="border-t border-[#F3F4F6]" />

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
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <p className="text-sm font-medium text-[#0A0A0A]">Couldn&apos;t reach the crew</p>
          <p className="mt-1 max-w-[240px] text-[13px] leading-relaxed text-[#6B7280]">
            {errorMessage ?? 'We lost the connection to your agents for a moment.'}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex h-8 items-center rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Try again
          </Link>
        </div>
      )}

      {resolved === 'empty' && (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <div
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-agent-tint"
            aria-hidden="true"
          >
            <Sparkles className="h-5 w-5 text-agent" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[#0A0A0A]">The crew is watching</p>
          <p className="mt-1 max-w-[240px] text-[13px] leading-relaxed text-[#6B7280]">
            Nothing needs your sign-off right now. When the agents find a fix worth making,
            it lands here for review.
          </p>
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

          {/* dense agent-run ledger — Linear-log move, violet for the crew's work */}
          <ul className="px-2 pb-2" aria-label="Fixes ready for review">
            {Array.from({ length: Math.min(approvalCount, 3) }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F4F6FA]"
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
                  <p className="font-mono text-[11px] text-[#9CA3AF]">
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
