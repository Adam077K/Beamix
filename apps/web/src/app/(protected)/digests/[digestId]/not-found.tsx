import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Not-found state for /digests/[digestId].
 *
 * M8 two-tier recovery: primary blue CTA + quiet secondary link.
 * Warm surface. No red panels. Specific to what's missing.
 */
export default function DigestNotFound() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        {/* Warm inset container */}
        <div className="card-inset max-w-[440px] px-8 py-10 text-center">
          {/* M2 STEP-3 eyebrow */}
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Weekly digest
          </p>

          {/* M2 STEP-2 — InterDisplay */}
          <h1
            className="font-[var(--font-display)] text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#0A0A0A]"
          >
            That digest isn&apos;t available
          </h1>

          {/* M2 STEP-4 body */}
          <p className="mx-auto mt-3 max-w-[340px] text-[14px] leading-[1.6] text-[#6B7280]">
            It may have been removed or the link might be outdated. All your digests are on the
            archive page.
          </p>

          {/* M8 two-tier recovery */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/digests"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Back to all digests
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
