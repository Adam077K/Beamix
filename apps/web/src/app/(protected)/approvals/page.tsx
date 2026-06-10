import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPendingApprovals } from './_data'
import { ApprovalsList } from './_components/ApprovalsList'
import { PageHeader } from '@/components/page-header'
import { RefreshErrorState } from '@/components/refresh-error-state'

// ---------------------------------------------------------------------------
// /approvals — Server Component
// Reads pending approval_queue rows for the authenticated user (via RLS),
// then renders the list or empty state.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic'

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ApprovalsPage() {
  const userId = await getCurrentUserId()

  // Middleware guards this route — userId should always be present.
  // Graceful fallback in case the session is stale.
  if (!userId) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Approvals" />
        <RefreshErrorState
          title="Could not load approvals"
          description="There was a problem fetching your pending items. Give it another go."
        />
      </main>
    )
  }

  const result = await getPendingApprovals(userId)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header — console heading system (§4.1) */}
      <PageHeader
        title="Approvals"
        subtitle="Review and approve items before they go live."
      />

      {/* Content — list, empty state, or error */}
      {result.ok ? (
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-card overflow-hidden">
          <ApprovalsList approvals={result.items} />
        </div>
      ) : (
        <RefreshErrorState
          title="Could not load approvals"
          description="There was a problem fetching your pending items. Give it another go."
        />
      )}
    </main>
  )
}
