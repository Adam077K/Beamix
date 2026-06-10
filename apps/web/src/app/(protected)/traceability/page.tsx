import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { TraceabilityList } from '@/components/traceability/TraceabilityList'
import type { TraceabilityData } from '@/types/traceability'

// ---------------------------------------------------------------------------
// Stub data — Wave 2: replace with fetchTraceability(userId)
// ---------------------------------------------------------------------------

const EMPTY_DATA: TraceabilityData = {
  state: 'empty',
  outcomes: [],
}

// ---------------------------------------------------------------------------
// Page — Server Component
// Mirrors dashboard/page.tsx: auth re-read pattern, same shell layout.
// ---------------------------------------------------------------------------

export default async function TraceabilityPage() {
  // Wave 2: replace with real Supabase fetch
  // const supabase = await createServerSupabaseClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // const traceabilityData = await fetchTraceability(user?.id)
  const traceabilityData: TraceabilityData = EMPTY_DATA

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header — console heading system (§4) */}
      <PageHeader
        eyebrow="EVIDENCE"
        title="How we got this"
        subtitle="Every result, and the exact work that produced it — dated, linked, and verifiable."
        action={
          <Button asChild variant="outline">
            <Link href="/scans">View scans</Link>
          </Button>
        }
      />

      <div className="space-y-8">
        <TraceabilityList data={traceabilityData} />
      </div>
    </main>
  )
}
