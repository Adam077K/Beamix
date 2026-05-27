/**
 * /discovery — Cal.com booking page
 *
 * Server Component. Embeds the Cal.com booking widget configured via
 * NEXT_PUBLIC_CALCOM_DISCOVERY_LINK env var (e.g. "beamix/discovery-call").
 *
 * Captures email + scan_id from query params so Cal.com pre-fills the email
 * field and the booking webhook can associate the session with a free scan.
 *
 * Query params:
 *   email    — pre-fill attendee email in the Cal.com embed
 *   scan_id  — passed through to the Cal.com "notes" field; forwarded by
 *              the webhook handler to the `discovery_sessions` table
 */

import { Metadata } from 'next'

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
    // Graceful degradation — show a static CTA if the env var is missing (shouldn't happen in prod)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Book a Discovery Call</h1>
        <p className="mt-4 max-w-md text-gray-600">
          Our calendar link is being set up. Please email{' '}
          <a href="mailto:hello@beamixai.com" className="text-[#3370FF] underline">
            hello@beamixai.com
          </a>{' '}
          to schedule your discovery call.
        </p>
      </main>
    )
  }

  // Build the Cal.com embed URL with pre-fill parameters
  // Cal.com supports pre-filling via query params: name, email, notes
  const calUrl = buildCalUrl(calcomLink, { email, scanId })

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      {/* Header */}
      <div className="w-full border-b border-gray-100 px-4 py-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[#3370FF]">
          Discovery call
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Let&apos;s talk about your AI search visibility
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-base text-gray-500">
          Book a free 20-minute call. We&apos;ll review your scan results and walk through
          a tailored plan for your business.
        </p>
      </div>

      {/* Cal.com embed */}
      <div className="w-full flex-1">
        <CalEmbed calUrl={calUrl} />
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCalUrl(
  link: string,
  opts: { email: string; scanId: string }
): string {
  // link can be either a full URL or a slug like "beamix/discovery-call"
  const base = link.startsWith('http')
    ? link
    : `https://cal.com/${link}`

  const url = new URL(base)
  if (opts.email) url.searchParams.set('email', opts.email)
  // Pass scan_id via Cal.com's `notes` field so it surfaces in the booking summary
  if (opts.scanId) url.searchParams.set('notes', `scan_id:${opts.scanId}`)
  // Embed mode — removes Cal.com chrome
  url.searchParams.set('embed', '1')
  return url.toString()
}

// ---------------------------------------------------------------------------
// Cal embed component (Client Component required for iframe interactions)
// ---------------------------------------------------------------------------

// Cal.com supports a plain <iframe> embed — no JS SDK required.
// We use an iframe with a fixed minimum height to avoid a collapsed widget.
function CalEmbed({ calUrl }: { calUrl: string }) {
  return (
    <iframe
      src={calUrl}
      className="h-[700px] w-full border-0 sm:h-[800px]"
      title="Book a discovery call with Beamix"
      loading="eager"
      allow="payment"
    />
  )
}
