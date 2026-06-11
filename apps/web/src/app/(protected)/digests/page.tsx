import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { DigestArchivePage } from '@/components/digests/DigestArchivePage'
import type { WeeklyDigest } from '@/types/digest'
import { isDemoUser } from '@/lib/demo'
import { DEMO_DIGESTS } from '@/lib/demo/fixtures'
import { STUB_DIGESTS } from './_stub'

// ---------------------------------------------------------------------------
// Page — Server Component shell
// ---------------------------------------------------------------------------

export default async function DigestsPage() {
  // Lightweight auth re-read — middleware already verified auth.
  // Wave 2: use user.id to fetch weekly_digests for this customer.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Demo mode: return fixture data for demo@beamixai.com.
  // Real users fall through to the stub (Wave 2: real Supabase fetch).
  const digests: WeeklyDigest[] = isDemoUser(user?.email)
    ? DEMO_DIGESTS
    : user
      ? STUB_DIGESTS
      : []

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Weekly digests"
        subtitle="Every week, written up — what moved, what the crew shipped, and what we'd love your eyes on."
      />

      <Suspense fallback={<DigestArchiveSkeleton />}>
        <DigestArchivePage digests={digests} />
      </Suspense>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Suspense fallback — shown while DigestArchivePage hydrates
// ---------------------------------------------------------------------------

function DigestArchiveSkeleton() {
  return (
    <div className="card-console overflow-hidden" aria-busy="true" aria-label="Loading digests">
      {/* toolbar skeleton */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6]">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      {/* row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F3F4F6] last:border-0">
          <div className="shrink-0 space-y-1.5">
            <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="flex-1 h-4 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  )
}
