import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { getOutcomeById } from '@/lib/demo/fixtures'
import { OutcomeDetailView } from '@/components/traceability/OutcomeDetailView'
import type { Outcome } from '@/types/traceability'

// ---------------------------------------------------------------------------
// Page — Server Component
// Mirror the auth-re-read + isDemoUser gate from the traceability list page.
// Demo users → resolve fixture; non-demo → notFound (real data is Wave 2).
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ outcomeId: string }>
}

export default async function OutcomeDetailPage({ params }: PageProps) {
  const { outcomeId } = await params

  // Lightweight auth re-read — middleware already verified auth.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let outcome: Outcome | undefined

  if (isDemoUser(user?.email)) {
    outcome = getOutcomeById(outcomeId)
    // Demo user but unknown ID → designed not-found (no raw 404)
    if (!outcome) {
      return <OutcomeNotFound outcomeId={outcomeId} />
    }
  } else {
    // Non-demo: real data is Wave 2. Show designed not-found for now.
    notFound()
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back affordance — blue, keyboard-focusable */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/traceability"
          className="inline-flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-[#3370FF] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          All results
        </Link>
      </nav>

      <OutcomeDetailView outcome={outcome} />
    </main>
  )
}

// ---------------------------------------------------------------------------
// OutcomeNotFound — designed not-found card (M8 two-tier recovery)
// Never a bare Next.js 404; the user deserves an intentional path out.
// ---------------------------------------------------------------------------

function OutcomeNotFound({ outcomeId }: { outcomeId: string }) {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/traceability"
          className="inline-flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-[#3370FF] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          All results
        </Link>
      </nav>

      <div className="card-console craft-enter bg-surface-warm">
        <div className="flex flex-col items-center px-6 py-14 text-center">
          {/* Illustrative faint thread + empty node, aria-hidden */}
          <svg
            width="40"
            height="56"
            viewBox="0 0 40 56"
            fill="none"
            aria-hidden="true"
            className="mb-6"
          >
            <line
              x1="20"
              y1="6"
              x2="20"
              y2="46"
              stroke="#6E56F0"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            <circle
              cx="20"
              cy="26"
              r="6"
              fill="var(--color-agent-tint)"
              stroke="#0A0A0A"
              strokeWidth="1"
              strokeOpacity="0.12"
            />
            <circle cx="20" cy="26" r="2" fill="#6E56F0" fillOpacity="0.35" />
          </svg>

          {/* Eyebrow */}
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]">
            Result not found
          </p>

          {/* Headline — one Fraunces beat */}
          <h1 className="text-[20px] leading-snug text-[#0A0A0A]">
            We couldn&apos;t find that{' '}
            <em className="font-[var(--font-serif)] not-italic">result.</em>
          </h1>

          <p className="mt-3 max-w-[320px] text-[14px] leading-relaxed text-[#6B7280]">
            The result ID{' '}
            <code className="rounded bg-[#F3F4F6] px-1 py-0.5 font-mono text-[12px]">
              {outcomeId}
            </code>{' '}
            does not match any tracked outcome. It may have been removed or the link is stale.
          </p>

          {/* M8 two-tier CTA */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/traceability"
              className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Back to all results
            </Link>
            <Link
              href="/dashboard"
              className="text-[13px] text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 focus-visible:rounded"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
