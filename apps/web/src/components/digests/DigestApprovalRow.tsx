'use client'

import { cn } from '@/lib/utils'
import type { DigestApproval } from '@/types/digest'

interface DigestApprovalRowProps {
  approval: DigestApproval
}

const TYPE_LABELS: Record<string, string> = {
  content: 'Content',
  faq: 'FAQ',
  schema: 'Schema',
  outreach: 'Outreach',
  email: 'Email',
}

/**
 * DigestApprovalRow — historical resolved-approval row.
 *
 * Read-only (no approve/reject actions — this is the archive surface).
 * Status pills: approved → status-positive, rejected → status-neutral, expired → status-warning.
 * Engineering Principle #9: agentProposer is never rendered customer-facing.
 */
export function DigestApprovalRow({ approval }: DigestApprovalRowProps) {
  const statusConfig = {
    approved: {
      label: 'Approved',
      className: 'text-status-positive bg-status-positive',
    },
    rejected: {
      label: 'Rejected',
      className: 'text-status-neutral bg-status-neutral',
    },
    expired: {
      label: 'Expired',
      className: 'text-status-warning bg-status-warning',
    },
  }[approval.status]

  return (
    <li className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#F4F6FA]">
      <div className="min-w-0 flex-1">
        {/* Title + type tag */}
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-medium text-[#0A0A0A]">
            {approval.title}
          </p>
          <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
            {TYPE_LABELS[approval.type] ?? approval.type}
          </span>
        </div>

        {/* Preview snippet */}
        <p className="mt-0.5 truncate text-[12px] text-[#9CA3AF]">
          {approval.previewSnippet}
        </p>
        {/* agentProposer is intentionally NOT rendered (Principle #9) */}
      </div>

      {/* Status pill — text label, not color alone */}
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
          statusConfig.className,
        )}
        aria-label={`Status: ${statusConfig.label}`}
      >
        {statusConfig.label}
      </span>
    </li>
  )
}
