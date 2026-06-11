'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'

/**
 * DigestEmptyState — ghost preview card + Sunday promise.
 *
 * NOT a dead placeholder — the card is shaped like a real open digest but
 * with em-dash placeholders at the correct type/weight. Over it: one warm
 * Inter line and a quiet text-accent link.
 *
 * No hard CTA button — the only optional action is a quiet text link.
 */
export function DigestEmptyState() {
  return (
    <div className="card-console overflow-hidden" aria-label="No digests yet">
      {/* Ghost list toolbar */}
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-3">
        <div className="h-8 w-48 rounded-lg bg-[#F9FAFB]" />
        <span className="font-mono text-[12px] text-[#D1D5DB] tabular-nums">— digests</span>
      </div>

      {/* Ghost row */}
      <div className="flex items-center gap-4 border-b border-[#F3F4F6] px-5 py-4 opacity-40">
        <div className="w-24 shrink-0">
          <p className="text-sm font-medium text-[#0A0A0A]">—</p>
          <p className="mt-0.5 font-mono text-[12px] text-[#9CA3AF]">—</p>
        </div>
        <p className="flex-1 truncate text-sm text-[#9CA3AF]">
          — — — — — — — — — — — — — — — — —
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 font-mono text-[12px] text-[#D1D5DB]">
            —
          </span>
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 font-mono text-[12px] text-[#D1D5DB]">
            —
          </span>
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 font-mono text-[12px] text-[#D1D5DB]">
            —
          </span>
        </div>
      </div>

      {/* Ghost open digest body */}
      <div className="grid gap-0 divide-y divide-[#F3F4F6] opacity-30">
        {/* Ghost score snapshot */}
        <div className="px-5 py-5">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Where you stand
          </p>
          <div className="grid grid-cols-3 gap-3">
            {['ChatGPT', 'Gemini', 'Perplexity'].map((e) => (
              <div key={e} className="rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  {e}
                </p>
                <p className="font-mono text-[40px] font-semibold leading-none tabular-nums text-[#D1D5DB]">
                  —
                </p>
                <p className="mt-1 font-mono text-[12px] text-[#D1D5DB]">from —</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ghost wins */}
        <div className="divide-y divide-[#F3F4F6]">
          <div className="px-5 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              What the crew shipped
            </p>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--color-status-positive)' }}
                aria-hidden="true"
              >
                <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
              </span>
              <span className="h-4 flex-1 rounded bg-[#F3F4F6]" />
            </div>
          ))}
        </div>

        {/* Ghost customer note */}
        <div className="px-5 py-5">
          <div className="rounded-[var(--radius-card)] bg-surface-warm p-6">
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-[#EFEDEA]" />
              <div className="h-4 w-5/6 rounded bg-[#EFEDEA]" />
              <div className="h-4 w-3/4 rounded bg-[#EFEDEA]" />
            </div>
          </div>
        </div>
      </div>

      {/* Sunday promise */}
      <div className="border-t border-[#F3F4F6] bg-white px-6 py-8 text-center">
        <p className="text-sm font-medium text-[#0A0A0A]">
          Your first weekly digest lands this Sunday.
        </p>
        <p className="mx-auto mt-2 max-w-[440px] text-[13px] leading-relaxed text-[#6B7280]">
          Every Sunday we write up what moved and what the crew shipped — your record starts
          with your first full week.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded text-[13px] font-medium text-accent transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          See your live dashboard →
        </Link>
      </div>
    </div>
  )
}
