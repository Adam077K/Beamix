/**
 * /discovery — Cal.com booking page (DESIGN-DIRECTION §5 #7)
 *
 * Layout: left column — value framing + 3 bullets. Right column — Cal.com embed.
 * Fallback (env var absent): in-product lead form. NEVER a mailto link.
 *
 * Query params:
 *   email    — pre-fill attendee email in the Cal.com embed / lead form
 *   scan_id  — forwarded via Cal.com notes field; used by webhook handler
 */

import type { Metadata } from 'next'
import { DiscoveryLeadForm } from './_components/DiscoveryLeadForm'

export const metadata: Metadata = {
  title: 'Book Your Discovery Call | Beamix',
  description:
    'Book a free 20-minute call. We review your scan results and build a plan for your business.',
}

interface DiscoveryPageProps {
  searchParams: Promise<{ email?: string; scan_id?: string }>
}

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const calcomLink = process.env.NEXT_PUBLIC_CALCOM_DISCOVERY_LINK

  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email.trim() : ''
  const scanId = typeof params.scan_id === 'string' ? params.scan_id.trim() : ''

  const calUrl = calcomLink ? buildCalUrl(calcomLink, { email, scanId }) : null

  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-[#E5E7EB] px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Discovery call
        </p>
      </div>

      {/* Two-column layout: value left, calendar right */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[400px_1fr]">
          {/* Left — value framing */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#0A0A0A] sm:text-[30px]">
                See exactly where AI search loses you
              </h1>
              <p className="mt-3 text-[15px] leading-[1.6] text-[#6B7280]">
                Book a free 20-minute call. We look at your scan results together and
                map out the gaps — no slides, no pitch, just your numbers.
              </p>
            </div>

            {/* 3 concrete bullets */}
            <ul className="space-y-4" role="list">
              {[
                {
                  heading: 'Your scan, line by line',
                  body: 'We walk through every gap ChatGPT, Gemini, and Perplexity found for your business.',
                },
                {
                  heading: 'A fix order that makes sense',
                  body: 'Not everything needs fixing at once. We show you which two or three moves change your score the most.',
                },
                {
                  heading: 'A plan you can act on today',
                  body: "You leave knowing the next step — whether that's running agents or doing it yourself.",
                },
              ].map(({ heading, body }) => (
                <li key={heading} className="flex gap-3">
                  <span
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF]"
                    aria-hidden="true"
                  >
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="#3370FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{heading}</p>
                    <p className="mt-0.5 text-sm leading-[1.5] text-[#6B7280]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Social proof token */}
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F7] p-4">
              <p className="text-sm leading-[1.5] text-[#374151]">
                "We had no idea ChatGPT wasn't mentioning us. The call made the gap
                obvious in 10 minutes."
              </p>
              <p className="mt-2 text-xs font-medium text-[#9CA3AF]">
                SMB owner, Tel Aviv
              </p>
            </div>
          </div>

          {/* Right — Cal.com embed or lead form */}
          <div className="min-h-[600px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {calUrl ? (
              <CalEmbed calUrl={calUrl} />
            ) : (
              <DiscoveryLeadForm prefillEmail={email} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCalUrl(link: string, opts: { email: string; scanId: string }): string {
  const base = link.startsWith('http') ? link : `https://cal.com/${link}`
  const url = new URL(base)
  if (opts.email) url.searchParams.set('email', opts.email)
  if (opts.scanId) url.searchParams.set('notes', `scan_id:${opts.scanId}`)
  url.searchParams.set('embed', '1')
  return url.toString()
}

// ---------------------------------------------------------------------------
// Cal.com iframe embed — plain iframe, no JS SDK required
// ---------------------------------------------------------------------------

function CalEmbed({ calUrl }: { calUrl: string }) {
  return (
    <iframe
      src={calUrl}
      className="h-full min-h-[600px] w-full border-0"
      title="Book a discovery call with Beamix"
      loading="eager"
      allow="payment"
    />
  )
}
