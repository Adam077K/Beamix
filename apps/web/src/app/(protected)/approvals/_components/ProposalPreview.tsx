'use client'

import * as React from 'react'
import type { ApprovalQueueItem } from '../_data'

// ---------------------------------------------------------------------------
// Kind sets — drives which preview to render
// ---------------------------------------------------------------------------

const PROSE_KINDS: ApprovalQueueItem['kind'][] = [
  'content_publish',
  'email_as_them',
  'outreach',
  'citation_submit',
]
const DIFF_KINDS: ApprovalQueueItem['kind'][] = ['schema_push', 'listing_update']

// ---------------------------------------------------------------------------
// Helpers — safe defensive reads from resource JSONB
// ---------------------------------------------------------------------------

function extractProseBody(resource: Record<string, unknown>): string | null {
  const val =
    resource['body'] ??
    resource['content'] ??
    resource['draft'] ??
    resource['text'] ??
    null
  return typeof val === 'string' && val.trim() ? val.trim() : null
}

/** A single diff line. sign: '+' added, '-' removed, ' ' context */
interface DiffLine {
  sign: '+' | '-' | ' '
  text: string
}

function extractDiffLines(resource: Record<string, unknown>): DiffLine[] {
  // Full unified diff blob
  const raw = resource['diff']
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split('\n').map((line) => {
      if (line.startsWith('+') && !line.startsWith('+++')) return { sign: '+', text: line.slice(1) }
      if (line.startsWith('-') && !line.startsWith('---')) return { sign: '-', text: line.slice(1) }
      return { sign: ' ', text: line.startsWith(' ') ? line.slice(1) : line }
    })
  }
  // before / after pair — synthesise a simple diff
  const before = resource['before']
  const after = resource['after']
  if (typeof before === 'string' || typeof after === 'string') {
    const lines: DiffLine[] = []
    if (typeof before === 'string') {
      before.split('\n').forEach((l) => lines.push({ sign: '-', text: l }))
    }
    if (typeof after === 'string') {
      after.split('\n').forEach((l) => lines.push({ sign: '+', text: l }))
    }
    return lines
  }
  return []
}

// ---------------------------------------------------------------------------
// ProsePreview — clamped body with "Show full" toggle
// ---------------------------------------------------------------------------

const CLAMP_LINES = 12
// item #5: also clamp long single-paragraph bodies (no newlines to count)
const CLAMP_CHARS = 800

function ProsePreview({ body }: { body: string }) {
  const [expanded, setExpanded] = React.useState(false)
  const lines = body.split('\n')
  // Clamp when line count exceeds limit OR body is a long single paragraph
  const needsClamp = lines.length > CLAMP_LINES || body.length > CLAMP_CHARS
  const shouldClamp = needsClamp && !expanded

  let displayBody = body
  if (shouldClamp) {
    if (lines.length > CLAMP_LINES) {
      displayBody = lines.slice(0, CLAMP_LINES).join('\n') + '…'
    } else {
      // Single paragraph, long — clamp by character count
      displayBody = body.slice(0, CLAMP_CHARS) + '…'
    }
  }

  return (
    <div
      className="border-l-[3px] rounded-r-md pl-3 pr-3 py-2"
      style={{
        borderColor: 'var(--color-agent)',
        backgroundColor: 'var(--color-agent-tint)',
      }}
    >
      <p
        className="text-[13px] leading-relaxed text-[#374151] whitespace-pre-wrap sm:text-[14px]"
        aria-label="Proposed content"
      >
        {displayBody}
      </p>
      {/* item #1: COLOR LAW — this is a user action (toggle), so blue (accent), not violet (agent) */}
      {needsClamp && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-[12px] font-medium text-accent hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Show full'}
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DiffPreview — unified diff lines
// ---------------------------------------------------------------------------

function DiffPreview({ lines }: { lines: DiffLine[] }) {
  if (lines.length === 0) return null

  return (
    <div
      className="border-l-[3px] rounded-r-md overflow-x-auto"
      style={{
        borderColor: 'var(--color-agent)',
        backgroundColor: 'var(--color-agent-tint)',
      }}
    >
      <pre className="px-3 py-2 text-[12px] leading-relaxed" aria-label="Proposed changes diff">
        {lines.map((line, i) => {
          let cls = 'text-[#6B7280]'
          if (line.sign === '+') cls = 'text-status-positive'
          if (line.sign === '-') cls = 'text-status-critical'
          return (
            <div key={i} className={cls}>
              <span aria-hidden="true" className="select-none mr-1 opacity-70">
                {line.sign === ' ' ? ' ' : line.sign}
              </span>
              <span>{line.text}</span>
            </div>
          )
        })}
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProposalPreview — outer wrapper with eyebrow
// ---------------------------------------------------------------------------

interface ProposalPreviewProps {
  kind: ApprovalQueueItem['kind']
  resource: Record<string, unknown>
}

export function ProposalPreview({ kind, resource }: ProposalPreviewProps) {
  const isProse = PROSE_KINDS.includes(kind)
  const isDiff = DIFF_KINDS.includes(kind)

  if (isProse) {
    const body = extractProseBody(resource)
    if (!body) return null
    return (
      <div className="rounded-lg p-4 bg-surface-warm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-agent mb-2">
          What the crew prepared
        </p>
        <ProsePreview body={body} />
      </div>
    )
  }

  if (isDiff) {
    const lines = extractDiffLines(resource)
    if (lines.length === 0) return null
    return (
      <div className="rounded-lg p-4 bg-surface-warm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-agent mb-2">
          What the crew prepared
        </p>
        <DiffPreview lines={lines} />
      </div>
    )
  }

  return null
}
