'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import type { ContentDiff } from '@/lib/demo/surfaces/types'

interface DiffEditorProps {
  diff: ContentDiff
  agentLabel: string
  /** Override-edited content; starts as diff.after */
  onSendToApprovals?: (content: string) => void
}

/**
 * DiffEditor — Zone 5 TIER-1 output for gated content agents.
 *
 * Shows a before/after diff view with line-level highlighting.
 * Primary action: "Send to approvals" blue button → Link href="/approvals".
 * M5: one SerifVerdict beat ("Ready") inline in the verdict sentence.
 * M11: word counts in Geist Mono tabular-nums.
 * Reduced-motion: all transitions respect prefers-reduced-motion.
 */
export function DiffEditor({ diff, agentLabel, onSendToApprovals }: DiffEditorProps) {
  const [editedContent, setEditedContent] = useState(diff.after)
  const [view, setView] = useState<'diff' | 'edit'>('diff')
  const [sent, setSent] = useState(false)

  const addedCount = diff.diffLines.filter((l) => l.type === 'added').length
  const removedCount = diff.diffLines.filter((l) => l.type === 'removed').length

  function handleSend() {
    onSendToApprovals?.(editedContent)
    setSent(true)
  }

  return (
    <div className="overflow-hidden">
      {/* Output header */}
      <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: agent label + verdict */}
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              {agentLabel} · Draft
            </p>
            <p className="mt-0.5 text-[15px] text-[#6B7280]">
              Your draft is{' '}
              <SerifVerdict>Ready</SerifVerdict>{' '}
              to review.
            </p>
          </div>

          {/* Right: diff stats in Geist Mono */}
          <div className="flex shrink-0 items-center gap-3 text-[12px]">
            <span className="flex items-center gap-1 font-[var(--font-mono)] tabular-nums text-[#0E9E6E]">
              <span aria-label={`${addedCount} lines added`}>+{addedCount}</span>
            </span>
            <span className="flex items-center gap-1 font-[var(--font-mono)] tabular-nums text-[#EF4444]">
              <span aria-label={`${removedCount} lines removed`}>−{removedCount}</span>
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="mt-3 flex items-center gap-1" role="tablist" aria-label="Diff view mode">
          {(['diff', 'edit'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                'rounded px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                view === v
                  ? 'bg-[#EEF2FF] text-[#3370FF]'
                  : 'text-[#6B7280] hover:text-[#0A0A0A]',
              )}
            >
              {v === 'diff' ? 'Diff view' : 'Edit draft'}
            </button>
          ))}
        </div>
      </div>

      {/* Diff / Edit body */}
      <div className="px-6 py-5">
        {view === 'diff' ? (
          <DiffView lines={diff.diffLines} />
        ) : (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 font-[var(--font-mono)] text-[13px] leading-relaxed text-[#0A0A0A] outline-none transition-colors focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF]/20"
            rows={Math.max(12, editedContent.split('\n').length + 2)}
            aria-label="Edit draft content"
            spellCheck
          />
        )}
      </div>

      {/* Gate bar — approval routing */}
      <div className="border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Gating explanation */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEEAFD]"
              aria-hidden="true"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M5 1.5v4M5 7.5h.01"
                  stroke="#6E56F0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[12px] text-[#6B7280]">
              Content changes require approval before publishing.
            </p>
          </div>

          {/* Primary CTA — blue only */}
          {sent ? (
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#0E9E6E]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7L5.5 10L11.5 4"
                  stroke="#0E9E6E"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sent to approvals
            </div>
          ) : (
            <Link
              href="/approvals"
              onClick={handleSend}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#3370FF] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#1f5ce8] active:bg-[#1a52d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              Send to approvals →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DiffView — renders colored diff lines
// ---------------------------------------------------------------------------

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed'
  content: string
}

function DiffView({ lines }: { lines: DiffLine[] }) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white"
      aria-label="Content diff"
    >
      <table className="w-full border-collapse text-[13px]" role="table">
        <tbody>
          {lines.map((line, i) => (
            <tr
              key={i}
              className={cn(
                'group',
                line.type === 'added' && 'bg-[#F0FDF4]',
                line.type === 'removed' && 'bg-[#FFF5F5]',
                line.type === 'unchanged' && 'bg-white',
              )}
            >
              {/* Gutter marker */}
              <td
                className={cn(
                  'w-6 select-none border-r border-[#E5E7EB] px-2 text-center font-[var(--font-mono)] text-[12px] tabular-nums',
                  line.type === 'added' && 'text-[#0E9E6E]',
                  line.type === 'removed' && 'text-[#EF4444]',
                  line.type === 'unchanged' && 'text-[#D1D5DB]',
                )}
                aria-hidden="true"
              >
                {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
              </td>
              {/* Line content */}
              <td
                className={cn(
                  'px-4 py-0.5 font-[var(--font-mono)] leading-relaxed',
                  line.type === 'added' && 'text-[#065F46]',
                  line.type === 'removed' && 'text-[#991B1B] line-through decoration-[#FCA5A5]',
                  line.type === 'unchanged' && 'text-[#6B7280]',
                  !line.content && 'h-4',
                )}
              >
                {line.content || <span aria-hidden="true" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
