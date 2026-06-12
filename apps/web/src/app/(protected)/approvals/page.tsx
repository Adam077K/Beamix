import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPendingApprovals } from './_data'
import { ApprovalsList } from './_components/ApprovalsList'
import { ApprovalFocus } from './_components/ApprovalFocus'
import { sortApprovals } from './_logic'
import { PageHeader } from '@/components/page-header'
import { RefreshErrorState } from '@/components/refresh-error-state'
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
// LedgerHeading — eyebrow for the recede ledger under the focal (M2 STEP-3 / M12)
// ---------------------------------------------------------------------------

function LedgerHeading({ count }: { count: number }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h2 className="text-[12px] font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
        Also waiting
      </h2>
      <span className="font-mono text-[12px] tabular-nums text-[#9CA3AF]">{count}</span>
    </div>
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

  // Risk-first, expiry-soonest order — the head is the TIER-1 focal (M10).
  const sorted = result.ok ? sortApprovals(result.items) : []
  const focusItem = sorted[0] ?? null
  const ledgerItems = sorted.slice(1)

  // Subtitle — M5 Fraunces beat on the verdict word ("review"); M11 mono count.
  const subtitleNode =
    result.ok && count > 0 ? (
      <span>
        The crew has <CountMono count={count} /> {count === 1 ? 'fix' : 'fixes'} ready for your{' '}
        <span className="font-[var(--font-serif)] italic text-[#374151]">review</span>.
      </span>
    ) : undefined

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header — count-bearing subtitle when items exist */}
      <PageHeader title="Approvals" subtitle={subtitleNode} />

      {!result.ok ? (
        <RefreshErrorState
          title="Could not load approvals"
          description="There was a problem fetching your pending items. Give it another go."
        />
      ) : count === 0 ? (
        // Designed empty (M8) — framed surface, never a bare centered icon.
        <div className="card-console overflow-hidden craft-enter craft-enter-1">
          <ApprovalsList approvals={[]} />
        </div>
      ) : (
        <div className="space-y-10">
          {/* TIER-1 focal — the one thing to do now (M1 / M3 / M10). */}
          {focusItem && <ApprovalFocus item={focusItem} />}

          {/* Recede ledger — everything else, dense and lower-weight (M3 asymmetry). */}
          {ledgerItems.length > 0 && (
            <section aria-label="Other items waiting for review" className="craft-enter craft-enter-2">
              <LedgerHeading count={ledgerItems.length} />
              <div className="card-inset overflow-hidden">
                <ApprovalsList approvals={ledgerItems} />
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
