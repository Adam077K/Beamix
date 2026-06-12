/**
 * /discovery — Cal.com booking page
 *
 * Warm-minimal shell. Server Component. This is the bottom-of-funnel
 * conversion surface (book the discovery call after a free scan), so it
 * carries the full craft contract: one TIER-1 focal, one Fraunces beat,
 * stepped type, felt depth, choreographed entrance, two-tier recovery.
 *
 * Scope: the WRAPPER + states only. The Cal.com booking widget internals
 * are untouched (third-party iframe).
 * - Asymmetric layout: a "what you'll get" context rail + the framed embed
 * - Token-only colors (zero inline hex)
 * - Branded loading state for the iframe (client component)
 * - Designed env-missing fallback (M8 two-tier recovery, never a raw error)
 * - email + scan_id query-param prefill behavior preserved
 *
 * Query params:
 *   email    — pre-fill attendee email in the Cal.com embed
 *   scan_id  — passed through to Cal.com "notes" field; forwarded by
 *              the webhook handler to the discovery_sessions table
 */

import { Metadata } from 'next'
import { Stat } from '@/components/ui/stat'
import { CalEmbed } from './_components/CalEmbed'

export const metadata: Metadata = {
  title: 'Book Your Discovery Call | Beamix',
  description:
    'Schedule a free 20-minute discovery call to learn how Beamix can improve your AI search visibility.',
}

interface DiscoveryPageProps {
  searchParams: Promise<{ email?: string; scan_id?: string }>
}

/** What the call delivers — the conversion-rail context. */
interface CallPoint {
  title: string
  body: string
  /** Marks an agent-work item — gets the violet dot (blue=you / violet=agents). */
  agent?: boolean
}

const CALL_POINTS: CallPoint[] = [
  {
    title: 'Your scan, read aloud',
    body: 'We walk the engines you’re missing from and why — line by line.',
  },
  {
    title: 'The fix, named',
    body: 'The exact pages, prompts and entities our agents would rewrite first.',
    agent: true,
  },
  {
    title: 'What to expect',
    body: 'A plain timeline for visibility to move — no jargon, no upsell.',
  },
]

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const calcomLink = process.env.NEXT_PUBLIC_CALCOM_DISCOVERY_LINK

  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email.trim() : ''
  const scanId = typeof params.scan_id === 'string' ? params.scan_id.trim() : ''

  if (!calcomLink) {
    return <EnvMissingFallback />
  }

  const calUrl = buildCalUrl(calcomLink, { email, scanId })

  return (
    <main className="min-h-screen bg-[var(--color-surface-warm)]">
      {/* Thin branded marquee — wordmark only, lets the split below carry weight */}
      <header className="craft-enter craft-enter-1 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-6 py-4">
          <BeamixMark />
          <span className="font-[var(--font-display)] text-[16px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Beamix
          </span>
        </div>
      </header>

      {/* Asymmetric body: context rail (dominant copy) + framed booking embed */}
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12 lg:py-16">
        {/* ── Context rail ───────────────────────────────────── */}
        <section className="craft-enter craft-enter-2 flex flex-col lg:pt-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
            Discovery call
          </p>
          <h1 className="mt-3 max-w-[15ch] font-[var(--font-display)] text-[32px] font-medium leading-[1.08] tracking-[-0.02em] text-[var(--color-text-primary)] sm:text-[40px]">
            Let’s{' '}
            <em className="font-[var(--font-serif)] font-normal italic">talk</em>{' '}
            about your AI search visibility
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.55] text-[var(--color-text-muted)]">
            Twenty focused minutes. We read your scan with you and show exactly
            what our agents would fix — and what moving looks like.
          </p>

          {/* Trust signal — mono truth (M11) */}
          <div className="mt-8 flex items-end gap-8 border-t border-[var(--color-border-subtle)] pt-6">
            <Stat
              value="20"
              unit="min"
              label="On the call"
              size="md"
              align="start"
            />
            <Stat
              value="1"
              unit=":1"
              label="With a strategist"
              size="md"
              align="start"
            />
          </div>

          {/* What you'll get — tight-within-cluster list (M12) */}
          <ul className="mt-8 flex flex-col gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-warm)]">
            {CALL_POINTS.map((point) => (
              <li
                key={point.title}
                className="flex gap-3.5 bg-[var(--color-surface)] px-5 py-4"
              >
                <span
                  aria-hidden="true"
                  className={
                    'mt-[7px] h-2 w-2 shrink-0 rounded-full ' +
                    (point.agent
                      ? 'bg-[var(--color-agent)]'
                      : 'bg-[var(--color-accent)]')
                  }
                />
                <div>
                  <p className="text-[14px] font-semibold leading-snug text-[var(--color-text-primary)]">
                    {point.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.5] text-[var(--color-text-muted)]">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[13px] text-[var(--color-text-muted)]">
            No credit card. No commitment. Cancel anytime before.
          </p>
        </section>

        {/* ── Framed booking embed (TIER-1 focal) ────────────── */}
        <section className="craft-enter craft-enter-3">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-hero)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-3">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
                Pick a time
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-status-positive)]"
                />
                Live availability
              </span>
            </div>
            <CalEmbed calUrl={calUrl} />
          </div>
        </section>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Env-missing fallback — M8 two-tier recovery, never a raw error
// ---------------------------------------------------------------------------

function EnvMissingFallback() {
  return (
    <main className="min-h-screen bg-[var(--color-surface-warm)]">
      {/* Same thin branded marquee as the happy path — shared chrome */}
      <header className="craft-enter craft-enter-1 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-6 py-4">
          <BeamixMark />
          <span className="font-[var(--font-display)] text-[16px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Beamix
          </span>
        </div>
      </header>

      {/*
        Same asymmetric split as the happy path: a dominant context rail +
        a framed action panel. The recovery state earns its composition —
        it fills the frame instead of floating a card in a centered void.
      */}
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-12 lg:py-16">
        {/* ── Context rail (dominant copy — the call is still real) ──── */}
        <section className="craft-enter craft-enter-2 flex flex-col lg:pt-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
            Discovery call
          </p>
          <h1 className="mt-3 max-w-[15ch] font-[var(--font-display)] text-[32px] font-medium leading-[1.08] tracking-[-0.02em] text-[var(--color-text-primary)] sm:text-[40px]">
            Let’s find your{' '}
            <em className="font-[var(--font-serif)] font-normal italic">time</em>{' '}
            the human way
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.55] text-[var(--color-text-muted)]">
            Our live calendar isn’t reachable this moment — so a strategist
            books you by hand. Same twenty minutes, same reading of your scan,
            locked within one business day.
          </p>

          {/* Trust signal — mono truth, shared with the happy path */}
          <div className="mt-8 flex items-end gap-8 border-t border-[var(--color-border-subtle)] pt-6">
            <Stat
              value="20"
              unit="min"
              label="On the call"
              size="md"
              align="start"
            />
            <Stat
              value="1"
              unit="biz day"
              label="To get booked"
              size="md"
              align="start"
            />
          </div>

          {/* What you'll still get — tight-within-cluster list, mirrors the embed path */}
          <ul className="mt-8 flex flex-col gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-warm)]">
            {CALL_POINTS.map((point) => (
              <li
                key={point.title}
                className="flex gap-3.5 bg-[var(--color-surface)] px-5 py-4"
              >
                <span
                  aria-hidden="true"
                  className={
                    'mt-[7px] h-2 w-2 shrink-0 rounded-full ' +
                    (point.agent
                      ? 'bg-[var(--color-agent)]'
                      : 'bg-[var(--color-accent)]')
                  }
                />
                <div>
                  <p className="text-[14px] font-semibold leading-snug text-[var(--color-text-primary)]">
                    {point.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.5] text-[var(--color-text-muted)]">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Framed action panel (TIER-1 focal — the recovery) ──────── */}
        <section className="craft-enter craft-enter-3">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-hero)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-3">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
                Book by email
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-status-warning)]"
                />
                Calendar offline
              </span>
            </div>

            {/* Warm illustrative band (moments-only character) */}
            <div className="flex items-center justify-center bg-[var(--color-wash-sky)] py-10">
              <CalendarGlyph />
            </div>

            <div className="px-7 py-7">
              <h2 className="text-[18px] font-semibold leading-snug tracking-[-0.01em] text-[var(--color-text-primary)]">
                Email us and we’ll lock your slot
              </h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--color-text-muted)]">
                One reply and a strategist holds a time for you — no form, no
                wait beyond one business day.
              </p>

              {/* Two-tier recovery: primary pill + quiet secondary link */}
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="mailto:hello@beamixai.com?subject=Discovery%20call"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  Email us to book
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center text-[13px] font-medium text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--color-text-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  Back to your dashboard
                </a>
              </div>

              <p className="mt-5 border-t border-[var(--color-border-subtle)] pt-4 text-[13px] text-[var(--color-text-muted)]">
                Reach us at{' '}
                <span className="font-[var(--font-mono)] text-[var(--color-text-primary)]">
                  hello@beamixai.com
                </span>
                . No credit card, no commitment.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Inline marks (on-brand, token-only — no stock icons)
// ---------------------------------------------------------------------------

/** Small Beamix mark — rounded accent tile. */
function BeamixMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="22" height="22" rx="6" fill="var(--color-accent)" />
      <path
        d="M7 6h5a2.6 2.6 0 0 1 0 5.2H7V6Zm0 5.2h5.4a2.6 2.6 0 0 1 0 5.2H7v-5.2Z"
        fill="#fff"
      />
    </svg>
  )
}

/** Warm calendar glyph for the recovery header — blue frame, violet booked slot. */
function CalendarGlyph() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect
        x="8"
        y="13"
        width="48"
        height="43"
        rx="8"
        fill="var(--color-surface)"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
      <path d="M8 24h48" stroke="var(--color-accent)" strokeWidth="2" />
      <path
        d="M20 9v8M44 9v8"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="22" cy="35" r="2.5" fill="var(--color-border-strong)" />
      <circle cx="32" cy="35" r="2.5" fill="var(--color-border-strong)" />
      <circle cx="42" cy="44" r="2.5" fill="var(--color-border-strong)" />
      {/* the booked slot — agent violet */}
      <circle cx="42" cy="35" r="3.5" fill="var(--color-agent)" />
      <circle cx="22" cy="44" r="2.5" fill="var(--color-border-strong)" />
      <circle cx="32" cy="44" r="2.5" fill="var(--color-border-strong)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

function buildCalUrl(link: string, opts: { email: string; scanId: string }): string {
  const base = link.startsWith('http') ? link : `https://cal.com/${link}`
  const url = new URL(base)
  if (opts.email) url.searchParams.set('email', opts.email)
  if (opts.scanId) url.searchParams.set('notes', `scan_id:${opts.scanId}`)
  url.searchParams.set('embed', '1')
  return url.toString()
}
