'use client'

import Link from 'next/link'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import type { BlogDraft } from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// BlogContextRail — the "earn the width" right rail (M3/M10, blog-studio P1-2).
//
// The audit's #1 page-level gap: the working column floats with a ~430px+ dead
// zone to its right. The foundation ToolPage exposes a `rail` prop so the freed
// width becomes a real inspector instead of empty canvas. This rail carries the
// live context a writer actually wants beside the input:
//   1. The climb story — the score's trajectory the page otherwise hides
//      (M4 signature sparkline + M7 trend delta; the "+27 over 5 runs" beat).
//   2. Engine coverage — which AI engines currently cite this business, so the
//      writer knows what they're writing toward.
//   3. Recent drafts — the running ledger of prior work (mono dates + word
//      counts + status), so the rail grounds the page in real activity.
//
// All numbers are Geist Mono tabular (M11). The rail recedes (TIER-3 inset
// surfaces) so it supports the working column without competing with it.
// ---------------------------------------------------------------------------

// Engine coverage for the demo business — which engines cite Bright Smile today.
const ENGINE_COVERAGE: { engine: string; cited: boolean }[] = [
  { engine: 'ChatGPT', cited: true },
  { engine: 'Perplexity', cited: true },
  { engine: 'Gemini', cited: true },
  { engine: 'Claude', cited: false },
  { engine: 'AI Overviews', cited: false },
]

// Score trajectory of blog content over the last 5 runs (mirrors the hero stat).
const SCORE_TRAJECTORY: number[] = [44, 51, 58, 63, 71]

interface BlogContextRailProps {
  drafts: BlogDraft[]
}

function relativeDate(iso: string | null): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  const days = Math.round((Date.now() - then) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (days < 14) return '1w ago'
  return `${Math.floor(days / 7)}w ago`
}

function statusMeta(status: BlogDraft['status']): {
  label: string
  text: string
  bg: string
} {
  switch (status) {
    case 'approved':
      return { label: 'Approved', text: '#0E9E6E', bg: '#E6F5EE' }
    case 'pending_approval':
      // Pending review sits in agent territory — violet (M6).
      return { label: 'In review', text: '#6E56F0', bg: '#EEEAFD' }
    default:
      return { label: 'Draft', text: '#6B7280', bg: '#F3F4F6' }
  }
}

export function BlogContextRail({ drafts }: BlogContextRailProps) {
  const citedCount = ENGINE_COVERAGE.filter((e) => e.cited).length
  const climb =
    SCORE_TRAJECTORY[SCORE_TRAJECTORY.length - 1] - SCORE_TRAJECTORY[0]

  return (
    <div className="flex flex-col gap-4">
      {/* ── The climb story — what the hero score is doing over time ───────── */}
      <section className="card-inset px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Content trajectory
        </p>
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <p className="max-w-[150px] text-[13px] leading-snug text-[#6B7280]">
            Your blog visibility is{' '}
            <SerifVerdict size="inline">climbing</SerifVerdict>.
          </p>
          <EngineMicroSparkline
            points={SCORE_TRAJECTORY}
            currentScore={71}
            showDelta
            width={72}
          />
        </div>
        <p className="mt-2.5 font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
          +{climb} over {SCORE_TRAJECTORY.length} runs
        </p>
      </section>

      {/* ── Engine coverage — what currently cites this business ──────────── */}
      <section className="card-inset px-5 py-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Engine coverage
          </p>
          <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
            {citedCount}/{ENGINE_COVERAGE.length}
          </span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {ENGINE_COVERAGE.map(({ engine, cited }) => (
            <li
              key={engine}
              className="flex items-center justify-between text-[13px]"
            >
              <span className={cited ? 'text-[#0A0A0A]' : 'text-[#9CA3AF]'}>
                {engine}
              </span>
              {cited ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0E9E6E]">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#0E9E6E]"
                    aria-hidden="true"
                  />
                  Cited
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
                  <span
                    className="h-1.5 w-1.5 rounded-full border border-[#D1D5DB]"
                    aria-hidden="true"
                  />
                  Gap
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-snug text-[#9CA3AF]">
          Authority articles are how you close the{' '}
          {ENGINE_COVERAGE.length - citedCount} remaining gaps.
        </p>
      </section>

      {/* ── Recent drafts — the running ledger of prior work ─────────────── */}
      <section className="card-inset px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Recent drafts
        </p>
        <ul className="mt-3 flex flex-col">
          {drafts.map((draft, i) => {
            const wordCount = draft.content.split(/\s+/).filter(Boolean).length
            const meta = statusMeta(draft.status)
            return (
              <li
                key={draft.id}
                className={
                  i > 0 ? 'border-t border-[#EDEDED] pt-3 mt-3' : ''
                }
              >
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[#0A0A0A]">
                  {draft.topic}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]"
                    style={{ color: meta.text, backgroundColor: meta.bg }}
                  >
                    {meta.label}
                  </span>
                  <span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[#9CA3AF]">
                    {wordCount.toLocaleString()}w · {relativeDate(draft.lastSavedAt)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
        <Link
          href="/archive"
          className="mt-4 inline-flex text-[12px] font-medium text-[#3370FF] underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        >
          All runs →
        </Link>
      </section>
    </div>
  )
}
