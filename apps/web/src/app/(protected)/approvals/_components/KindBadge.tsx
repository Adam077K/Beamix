import { Sparkles } from 'lucide-react'
import type { ApprovalQueueItem } from '../_data'

// ---------------------------------------------------------------------------
// Kind labels — customer-readable, no agent names (Principle #9)
// ---------------------------------------------------------------------------

type ApprovalKind = ApprovalQueueItem['kind']

export const KIND_LABELS: Record<ApprovalKind, string> = {
  content_publish: 'Content',
  email_as_them: 'Email',
  outreach: 'Outreach',
  schema_push: 'Schema',
  listing_update: 'Listing',
  citation_submit: 'Citation',
}

interface KindBadgeProps {
  kind: ApprovalKind
  /** When true, renders in muted/resolved styling */
  muted?: boolean
}

/**
 * KindBadge — violet authorship pill.
 *
 * Violet = the agents' work. Leading Sparkles icon reinforces the brand law:
 * violet marks agent output, never user actions.
 * Never use violet on a button — this is a label only.
 */
export function KindBadge({ kind, muted = false }: KindBadgeProps) {
  if (muted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-[#F7F7F7] text-[#9CA3AF] whitespace-nowrap">
        <Sparkles className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        {KIND_LABELS[kind] ?? kind}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-agent-tint text-agent whitespace-nowrap">
      <Sparkles className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      {KIND_LABELS[kind] ?? kind}
    </span>
  )
}
