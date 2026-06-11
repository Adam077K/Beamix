import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPendingApprovals } from './_data'
import { ApprovalsList } from './_components/ApprovalsList'
import { PageHeader } from '@/components/page-header'
import { RefreshErrorState } from '@/components/refresh-error-state'
import Link from 'next/link'
import { isDemoUser } from '@/lib/demo'
import { DEMO_APPROVALS } from '@/lib/demo/fixtures'

// ---------------------------------------------------------------------------
// /approvals — Server Component
// Reads pending approval_queue rows for the authenticated user (via RLS),
// then renders the list, empty state, or error.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic'

async function getCurrentUser(): Promise<{ id: string; email: string | undefined } | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return null
  return { id: user.id, email: user.email }
}

// ---------------------------------------------------------------------------
// CountMono — violet mono count in subtitle
// ---------------------------------------------------------------------------

function CountMono({ count }: { count: number }) {
  return (
    <span className="font-mono font-semibold text-agent tabular-nums">
      {count}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ApprovalsPage() {
  const currentUser = await getCurrentUser()

  // Middleware guards this route — user should always be present.
  if (!currentUser) {
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

  // Demo mode: return fixture data for demo@beamixai.com.
  // Real users are completely unaffected.
  const result = isDemoUser(currentUser.email)
    ? ({ ok: true as const, items: DEMO_APPROVALS })
    : await getPendingApprovals(currentUser.id)

  const count = result.ok ? result.items.length : 0

  // Build the subtitle JSX — only when count > 0
  const subtitleNode =
    result.ok && count > 0 ? (
      <span>
        The crew has <CountMono count={count} /> {count === 1 ? 'item' : 'items'} waiting for your
        review.
      </span>
    ) : undefined

  // Build the action slot — "Resolved" link (currently hidden until resolved page ships)
  const actionNode = (
    <Link
      href="/approvals/resolved"
      className="hidden text-[13px] font-medium text-[#6B7280] hover:text-[#0A0A0A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
      aria-label="View resolved approvals"
    >
      Resolved →
    </Link>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header — count-bearing subtitle when items exist */}
      <PageHeader
        title="Approvals"
        subtitle={subtitleNode}
        action={actionNode}
      />

      {/* Content — one wrapping card-console */}
      {result.ok ? (
        <div className="card-console overflow-hidden">
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
