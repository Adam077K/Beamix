/**
 * /discovery — Cal.com booking page
 *
 * Warm-minimal shell. Server Component.
 *
 * Scope: the WRAPPER + states only. Booking widget internals untouched.
 * - Branded header: Beamix wordmark + headline/subtitle
 * - Token-only colors (zero inline hex)
 * - Branded loading state for the iframe (client component)
 * - Designed env-missing fallback (recovery copy + link, never a raw error)
 * - email + scan_id query-param prefill behavior preserved
 *
 * Query params:
 *   email    — pre-fill attendee email in the Cal.com embed
 *   scan_id  — passed through to Cal.com "notes" field; forwarded by
 *              the webhook handler to the discovery_sessions table
 */

import { Metadata } from 'next'
import { CalEmbed } from './_components/CalEmbed'

export const metadata: Metadata = {
  title: 'Book Your Discovery Call | Beamix',
  description:
    'Schedule a free 20-minute discovery call to learn how Beamix can improve your AI search visibility.',
}

interface DiscoveryPageProps {
  searchParams: Promise<{ email?: string; scan_id?: string }>
}

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
      {/* Branded header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-5 text-center">
          {/* Wordmark */}
          <p className="font-[var(--font-display)] text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Beamix
          </p>
          {/* Eyebrow */}
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
            Discovery call
          </p>
          {/* Headline */}
          <h1 className="mt-2 font-[var(--font-display)] text-[28px] font-medium leading-tight tracking-[-0.02em] text-[var(--color-text-primary)] sm:text-[32px]">
            Let&apos;s talk about your AI search visibility
          </h1>
          {/* Subtitle */}
          <p className="mx-auto mt-2 max-w-[480px] text-[15px] leading-[1.5] text-[var(--color-text-muted)]">
            A free 20-minute call. We&apos;ll walk through your scan results and
            show you exactly what we&apos;ll fix — and what to expect.
          </p>
        </div>
      </div>

      {/* Cal.com embed — client component handles loading state */}
      <div className="w-full">
        <CalEmbed calUrl={calUrl} />
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Env-missing fallback — recovery copy + link, never a raw error
// ---------------------------------------------------------------------------

function EnvMissingFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-warm)] px-6 py-16 text-center">
      {/* Wordmark */}
      <p className="font-[var(--font-display)] text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">
        Beamix
      </p>
      <div className="mt-8 w-full max-w-[480px] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="font-[var(--font-display)] text-[22px] font-semibold text-[var(--color-text-primary)]">
          Book a Discovery Call
        </h1>
        <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-[1.5] text-[var(--color-text-muted)]">
          Our booking calendar isn&apos;t loading right now. Email us and
          we&apos;ll set up a time within one business day.
        </p>
        <a
          href="mailto:hello@beamixai.com"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Email hello@beamixai.com
        </a>
        <p className="mt-4 text-[13px] text-[var(--color-text-disabled)]">
          No credit card. No commitment.
        </p>
      </div>
    </main>
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
