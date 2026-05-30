import type { ApprovalQueueItem } from '../_data'
import { ApprovalActions } from './ApprovalActions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ---------------------------------------------------------------------------
// Kind labels — customer-readable, no agent names per Principle #9
// ---------------------------------------------------------------------------

type ApprovalKind = ApprovalQueueItem['kind']

const KIND_LABELS: Record<ApprovalKind, string> = {
  content_publish: 'Content',
  email_as_them: 'Email',
  outreach: 'Outreach',
  schema_push: 'Schema',
  listing_update: 'Listing',
  citation_submit: 'Citation',
}

// ---------------------------------------------------------------------------
// Summary extraction — reads resource JSONB safely (no agent identity exposed)
// ---------------------------------------------------------------------------

function extractSummary(resource: Record<string, unknown>, kind: ApprovalKind): string {
  if (typeof resource.summary === 'string' && resource.summary.trim()) {
    return resource.summary.trim()
  }
  if (typeof resource.title === 'string' && resource.title.trim()) {
    return resource.title.trim()
  }
  if (typeof resource.description === 'string' && resource.description.trim()) {
    return resource.description.trim()
  }
  // Fallback label by kind
  const fallbacks: Record<ApprovalKind, string> = {
    content_publish: 'Content ready to publish',
    email_as_them: 'Email ready to send',
    outreach: 'Outreach message ready',
    schema_push: 'Schema update ready',
    listing_update: 'Listing update ready',
    citation_submit: 'Citation submission ready',
  }
  return fallbacks[kind]
}

// ---------------------------------------------------------------------------
// Relative time — "3d", "2h", "45m"
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return 'Expired'
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor(diff / 60_000)
  if (days >= 1) return `${days}d`
  if (hours >= 1) return `${hours}h`
  if (minutes >= 1) return `${minutes}m`
  return 'Now'
}

function absoluteDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ---------------------------------------------------------------------------
// KindBadge — pill label for the type column
// ---------------------------------------------------------------------------

function KindBadge({ kind }: { kind: ApprovalKind }) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-[#E5E7EB] text-[#374151] bg-[#F7F7F7] whitespace-nowrap">
      {KIND_LABELS[kind] ?? kind}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Empty state — intentional, direct, one clear CTA
// ---------------------------------------------------------------------------

function EmptyApprovals() {
  return (
    <div
      role="status"
      aria-label="No items waiting for review"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
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
      <p className="text-sm font-medium text-[#0A0A0A] mb-1">
        No items waiting for your review.
      </p>
      <p className="text-sm text-[#6B7280] max-w-[280px] leading-relaxed">
        Items ready for your review will show up here. Check back after your
        next digest.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ApprovalsList — Server Component
// ---------------------------------------------------------------------------

interface ApprovalsListProps {
  approvals: ApprovalQueueItem[]
}

export function ApprovalsList({ approvals }: ApprovalsListProps) {
  if (approvals.length === 0) {
    return <EmptyApprovals />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Type</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead className="w-[120px] hidden sm:table-cell">Evidence</TableHead>
          <TableHead className="w-[100px] hidden md:table-cell">Expires</TableHead>
          <TableHead className="w-[184px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {approvals.map((item) => {
          const summary = extractSummary(item.resource, item.kind)
          return (
            <TableRow key={item.id}>
              {/* Kind */}
              <TableCell>
                <KindBadge kind={item.kind} />
              </TableCell>

              {/* Summary */}
              <TableCell>
                <p className="text-sm text-[#374151] line-clamp-2 max-w-sm leading-snug">
                  {summary}
                </p>
                {/* Evidence link shown inline on mobile (hidden on sm+) */}
                {item.evidenceUrl && (
                  <a
                    href={item.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-[#3370FF] hover:text-[#2558D4] underline-offset-2 hover:underline transition-colors sm:hidden block truncate max-w-[200px]"
                    aria-label="View supporting evidence (opens in new tab)"
                  >
                    View evidence
                  </a>
                )}
              </TableCell>

              {/* Evidence — desktop only */}
              <TableCell className="hidden sm:table-cell">
                {item.evidenceUrl ? (
                  <a
                    href={item.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#3370FF] hover:text-[#2558D4] underline-offset-2 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
                    aria-label="View supporting evidence (opens in new tab)"
                  >
                    View →
                  </a>
                ) : (
                  <span className="text-xs text-[#9CA3AF]">—</span>
                )}
              </TableCell>

              {/* Expires — desktop only */}
              <TableCell className="hidden md:table-cell">
                <time
                  dateTime={item.expiresAt}
                  title={absoluteDate(item.expiresAt)}
                  className="text-xs text-[#6B7280] tabular-nums"
                >
                  {relativeTime(item.expiresAt)}
                </time>
              </TableCell>

              {/* Approve / Reject */}
              <TableCell className="text-right">
                <ApprovalActions itemId={item.id} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
