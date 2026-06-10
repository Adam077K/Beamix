'use client'

import { FileText, Code2, Quote, ExternalLink } from 'lucide-react'
import type { Deliverable, DeliverableKind } from '@/types/traceability'

interface EvidenceRowProps {
  deliverable: Deliverable
  /** Date formatted for display, e.g. "May 24" */
  displayDate: string
}

/**
 * EvidenceRow — one deliverable in the evidence ledger.
 *
 * Editorial two-column layout: date column (64px fixed) + deliverable column.
 * Thread node: absolute violet circle with ring-white.
 * Kind icon in violet (text-agent), link in blue (text-accent).
 * Rows are separated by the thread + whitespace, NOT divide-y.
 *
 * Color law:
 *  - Violet (#6E56F0) on thread node + kind icon — never on a button/link
 *  - Blue (#3370FF) on the verifiable link only
 */

const KIND_ICON: Record<DeliverableKind, typeof FileText> = {
  article: FileText,
  schema: Code2,
  citation: Quote,
}

function urlHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function EvidenceRow({ deliverable, displayDate }: EvidenceRowProps) {
  const KindIcon = KIND_ICON[deliverable.kind]

  return (
    <div className="relative flex items-start gap-4 py-3.5 pl-8">
      {/* Thread node — violet circle with ring-white, positioned on the thread line */}
      <span
        className="absolute left-[7px] top-[18px] h-2.5 w-2.5 rounded-full bg-agent ring-4 ring-white"
        aria-hidden="true"
      />

      {/* Date column — fixed 64px, mono, muted */}
      <span className="w-[64px] shrink-0 font-mono text-[12px] tabular-nums text-[#6B7280]">
        {displayDate}
      </span>

      {/* Deliverable column */}
      <div className="min-w-0 flex-1">
        {/* Line 1: kind icon + label */}
        <div className="flex items-center gap-1.5 leading-snug">
          <KindIcon
            className="h-3.5 w-3.5 shrink-0 text-agent"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="text-[14px] text-[#0A0A0A]">{deliverable.label}</span>
        </div>

        {/* Line 2: live link with host as text */}
        <a
          href={deliverable.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${deliverable.label} at ${urlHost(deliverable.url)} (opens in new tab)`}
          className="mt-0.5 inline-flex items-center gap-1 font-mono text-[12px] text-accent transition-colors hover:text-[var(--color-accent-hover)] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          {urlHost(deliverable.url)}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
