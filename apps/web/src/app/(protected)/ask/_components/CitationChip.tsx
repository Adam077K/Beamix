'use client'

import Link from 'next/link'
import { ScanLine, FileText, Users, FileBox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AskCitation } from '@/lib/demo/surfaces/types'

const ICON_BY_TYPE: Record<AskCitation['type'], LucideIcon> = {
  scan: ScanLine,
  prompt: FileText,
  competitor: Users,
  page: FileBox,
}

/**
 * Splits a citation label into its prose part and an optional trailing figure
 * (a number / score / count) so the figure can render in Geist Mono — every
 * number on the surface is mono tabular-nums (M11).
 *
 * Matches the LAST numeric token in the label, e.g.:
 *   "Scan: …whitening results"            → no figure
 *   "Prompt: …cost dentist Israel (3,800/mo)" → figure "3,800/mo"
 *   "Your /emergency-dentist page — #1.2 on ChatGPT" → figure "#1.2"
 */
function splitFigure(label: string): { text: string; figure: string | null } {
  // Prefer a parenthetical figure at the end: (3,800/mo)
  const paren = label.match(/^(.*?)\s*\(([^()]*\d[^()]*)\)\s*$/)
  if (paren) {
    return { text: paren[1].trim(), figure: paren[2].trim() }
  }
  // Otherwise pull a leading-symbol numeric token: #1.2, 41, ₪400
  const token = label.match(/([#₪$]?\d[\d.,/–-]*\d|[#₪$]?\d)\s*$/)
  if (token) {
    const figure = token[1]
    const text = label.slice(0, token.index).replace(/[—·-]\s*$/, '').trim()
    if (text.length > 0) return { text, figure }
  }
  return { text: label, figure: null }
}

interface CitationChipProps {
  citation: AskCitation
}

/**
 * CitationChip — the move that makes Ask Beamix auditable instead of oracular.
 *
 * An inline, tappable mono-labelled pill that deep-links (in-product, router
 * push — never a new tab) to the exact source backing a claim:
 *   scan → /archive · prompt → /prompts · competitor → /competitors · page → /analytics
 *
 * Renders the source INLINE at the end of the sentence it grounds — never a
 * footnote or asterisk. Quiet recede ground (#F4F6FA) so it never competes with
 * the answer prose, with a Geist Mono figure when the source cites one.
 */
export function CitationChip({ citation }: CitationChipProps) {
  const Icon = ICON_BY_TYPE[citation.type]
  const { text, figure } = splitFigure(citation.label)

  return (
    <Link
      href={citation.href}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-[#F4F6FA] py-[3px] pl-2 pr-2.5 align-middle text-[12px] leading-none text-[#4B5563] transition-colors hover:border-[#3370FF]/40 hover:bg-[#EFF4FF] hover:text-[#1f5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
      title={citation.label}
    >
      <Icon
        className="h-3 w-3 shrink-0 text-[#9CA3AF] transition-colors group-hover:text-[#3370FF]"
        aria-hidden="true"
      />
      <span className="truncate font-medium">{text}</span>
      {figure && (
        <span className="shrink-0 font-[var(--font-mono)] tabular-nums tracking-[0.01em] text-[#6B7280] transition-colors group-hover:text-[#1f5ce8]">
          {figure}
        </span>
      )}
    </Link>
  )
}
