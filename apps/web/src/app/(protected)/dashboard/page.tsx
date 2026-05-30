import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { VisibilityScorePanel } from '@/components/dashboard/VisibilityScorePanel'
import { WeeklyNarrative } from '@/components/dashboard/WeeklyNarrative'
import { FoundingCohortPanel } from './_components/FoundingCohortPanel'
import type { DashboardOutcomes, VisibilityScore } from '@/types/outcomes'

// ---------------------------------------------------------------------------
// Stub data — Wave 2 will replace with real Supabase fetch
// ---------------------------------------------------------------------------

const EMPTY_SCORES: VisibilityScore[] = [
  { engine: 'chatgpt', score: null, trend: null, lastUpdatedAt: null },
  { engine: 'gemini', score: null, trend: null, lastUpdatedAt: null },
  { engine: 'perplexity', score: null, trend: null, lastUpdatedAt: null },
]

const EMPTY_OUTCOMES: DashboardOutcomes = {
  visibilityScores: EMPTY_SCORES,
  weeklyNarrative: { type: 'empty' },
  approvalCount: 0,
}

// ---------------------------------------------------------------------------
// FoundingCohortPanelSkeleton — loading fallback for Suspense boundary
// ---------------------------------------------------------------------------

function FoundingCohortPanelSkeleton() {
  return (
    <section aria-labelledby="founding-cohort-heading-skeleton" aria-busy="true">
      <div className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3 h-3 w-32 bg-[#F3F4F6] rounded animate-pulse" />
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-48 bg-[#F3F4F6] rounded animate-pulse" />
          </div>
          <div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse shrink-0" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full animate-pulse" />
          <div className="h-3 w-20 bg-[#F3F4F6] rounded animate-pulse" />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Inline ApprovalCounter — count=0 stub, Wave 2 wires the data
// ---------------------------------------------------------------------------

function ApprovalCounter({ count }: { count: number }) {
  return (
    <section aria-labelledby="approvals-heading">
      <h2
        id="approvals-heading"
        className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3"
        style={{ letterSpacing: '0.08em' }}
      >
        Pending approvals
      </h2>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 flex items-center justify-between gap-4">
        {count === 0 ? (
          <p className="text-sm text-[#6B7280]">
            Nothing waiting for your review right now.
          </p>
        ) : (
          <>
            <p className="text-sm text-[#374151]">
              <span className="font-semibold text-[#0A0A0A] tabular-nums">{count}</span>{' '}
              item{count !== 1 ? 's' : ''} ready for your review
            </p>
            <a
              href="/approvals"
              className="text-sm font-medium text-[#3370FF] hover:text-[#2558D4] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
            >
              Review →
            </a>
          </>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page — Server Component
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  // Fetch the authenticated user's ID for founding cohort check.
  // Middleware already verified auth; this is a lightweight re-read for userId only.
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only context — no cookie writes needed here
        },
      },
    },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Wave 2: replace with `await fetchDashboardOutcomes(userId)`
  const outcomes: DashboardOutcomes = EMPTY_OUTCOMES

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-semibold text-[#0A0A0A] leading-tight">
          Overview
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Your AI search visibility, results, and items pending review.
        </p>
      </header>

      {/* Founding-100 cohort counter — above main content */}
      <Suspense fallback={<FoundingCohortPanelSkeleton />}>
        <FoundingCohortPanel userId={user?.id} />
      </Suspense>

      {/* 2-col grid: Narrative (left, wider) + Approvals (right, narrower) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column — weekly wins card */}
        <WeeklyNarrative weeklyNarrative={outcomes.weeklyNarrative} />

        {/* Right column — approval counter */}
        <div className="self-start">
          <ApprovalCounter count={outcomes.approvalCount} />
        </div>
      </div>

      {/* Visibility score panel — full width below the grid */}
      <VisibilityScorePanel scores={outcomes.visibilityScores} />
    </main>
  )
}
