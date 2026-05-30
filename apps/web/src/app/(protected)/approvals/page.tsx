import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getPendingApprovals } from './_data'
import { ApprovalsList } from './_components/ApprovalsList'

// ---------------------------------------------------------------------------
// /approvals — Server Component
// Reads pending approval_queue rows for the authenticated user (via RLS),
// then renders the list or empty state.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic'

async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component — cookie writes may be no-ops
          }
        },
      },
    },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ---------------------------------------------------------------------------
// Error state — shown when the data fetch fails
// ---------------------------------------------------------------------------

function FetchErrorState() {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#0A0A0A] mb-1">
        Could not load approvals
      </p>
      <p className="text-sm text-[#6B7280] max-w-[280px] leading-relaxed">
        There was a problem fetching your pending items. Refresh the page to
        try again.
      </p>
    </div>
  )
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-[#0A0A0A] leading-tight">
            Approvals
          </h1>
        </header>
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <FetchErrorState />
        </div>
      </main>
    )
  }

  const result = await getPendingApprovals(userId)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-semibold text-[#0A0A0A] leading-tight">
          Approvals
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Review and approve items before they go live.
        </p>
      </header>

      {/* Content — list, empty state, or error */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        {result.ok ? (
          <ApprovalsList approvals={result.items} />
        ) : (
          <FetchErrorState />
        )}
      </div>
    </main>
  )
}
