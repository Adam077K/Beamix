import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApprovalActions } from './ApprovalActions'
import type { ApprovalItem } from '@/types/outcomes'

// ---------------------------------------------------------------------------
// Stub data — Wave 2 replaces with real Supabase fetch
// ---------------------------------------------------------------------------

const STUB_ITEMS: ApprovalItem[] = []

function resourceLabel(resource: ApprovalItem['resource']): string {
  switch (resource) {
    case 'content':  return 'Content update'
    case 'email':    return 'Email draft'
    case 'outreach': return 'Outreach message'
    default:         return resource
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyApprovals() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        {/* Inbox tray icon — no agent name exposed */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#0A0A0A] mb-1">Nothing to review</p>
      <p className="text-sm text-[#6B7280] max-w-[260px] leading-relaxed">
        Items ready for your review will appear here.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page — Server Component
// ---------------------------------------------------------------------------

export default async function ApprovalsPage() {
  // Wave 2: replace with `await fetchPendingApprovals(userId)`
  const items: ApprovalItem[] = STUB_ITEMS

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

      {/* Content — table or empty state */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        {items.length === 0 ? (
          <EmptyApprovals />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-[160px]">Created</TableHead>
                <TableHead className="w-[160px]">Expires</TableHead>
                <TableHead className="w-[176px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-[#E5E7EB] text-[#374151] bg-[#F7F7F7]">
                      {resourceLabel(item.resource)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[#374151] line-clamp-2 max-w-sm leading-snug">
                      {item.preview}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#6B7280] tabular-nums">
                      {formatDate(item.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#6B7280] tabular-nums">
                      {formatDate(item.expiresAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <ApprovalActions itemId={item.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  )
}
