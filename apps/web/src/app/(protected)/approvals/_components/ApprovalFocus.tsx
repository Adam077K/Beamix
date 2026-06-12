'use client'

import * as React from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApprovalQueueItem } from '../_data'
import { isHighRisk } from '../_logic'
import { KindBadge } from './KindBadge'
import { ProposalPreview } from './ProposalPreview'
import { ApprovalActions, type ActionResolved } from './ApprovalActions'

// ---------------------------------------------------------------------------
// ApprovalFocus — the TIER-1 "what needs you most" card (M1 / M3 / M10).
//
// One per surface. The highest-priority item (risk-first, expiry-soonest) is
// lifted out of the ledger and presented as a hero card so the eye lands on
// "the one thing to do now" instead of an N-equal stack (kills tells #1/#2/#5).
//
// M6 Violet Structure: the card sits in the agent zone (violet-tint ground +
// solid violet top-accent + violet hairline) — at arm's length you read "the
// crew drafted this", while the Approve button stays blue (your sign-off).
// Violet NEVER touches a button here.
//
// M5 Fraunces beat: one italic-serif verdict word ("most") inline in the
// eyebrow sentence — the warm-minimal soul, never in chrome/labels/buttons.
//
// M11 Mono for truth: the expiry countdown renders through the mono register.
// M9 Entrance: craft-enter-1 (first paint, leads the stagger).
// ---------------------------------------------------------------------------

interface ApprovalFocusProps {
  item: ApprovalQueueItem
}

function extractSummary(
  resource: Record<string, unknown>,
  kind: ApprovalQueueItem['kind'],
): string {
  for (const key of ['summary', 'title', 'description'] as const) {
    const v = resource[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  const fallbacks: Record<ApprovalQueueItem['kind'], string> = {
    content_publish: 'Content ready to publish',
    email_as_them: 'Email ready to send',
    outreach: 'Outreach message ready',
    schema_push: 'Schema update ready',
    listing_update: 'Listing update ready',
    citation_submit: 'Citation submission ready',
  }
  return fallbacks[kind]
}

function relativeExpiry(iso: string): { label: string; soon: boolean; expired: boolean } {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return { label: 'Expired', soon: false, expired: true }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor(diff / 60_000)
  const soon = diff < 24 * 60 * 60 * 1000
  if (days >= 1) return { label: `${days}d`, soon, expired: false }
  if (hours >= 1) return { label: `${hours}h`, soon, expired: false }
  if (minutes >= 1) return { label: `${minutes}m`, soon, expired: false }
  return { label: 'now', soon: true, expired: false }
}

function absoluteDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function ApprovalFocus({ item }: ApprovalFocusProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [resolved, setResolved] = React.useState<ActionResolved | null>(null)

  const panelId = `approval-focus-panel-${item.id}`
  const summary = extractSummary(item.resource, item.kind)
  const isRisky = isHighRisk(item.resource)
  const expiry = relativeExpiry(item.expiresAt)
  const isResolved = resolved !== null

  const handleResolved = React.useCallback((r: ActionResolved) => {
    setResolved(r)
    setExpanded(false)
  }, [])

  const rationale =
    (typeof item.resource['rationale'] === 'string' ? item.resource['rationale'] : null) ??
    (typeof item.resource['reason'] === 'string' ? item.resource['reason'] : null) ??
    'The crew flagged this as the most time-sensitive fix in your queue.'

  return (
    <section
      aria-labelledby={`approval-focus-title-${item.id}`}
      className={cn(
        'card-console-hero overflow-hidden craft-enter craft-enter-1',
        isResolved && 'opacity-60',
      )}
      style={{ backgroundColor: 'var(--color-agent-tint)' }}
    >
      {/* M6 violet top-accent rule — reads as "the crew" from across the room */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full"
        style={{ backgroundColor: 'var(--color-agent)' }}
      />

      <div className="p-6 sm:p-7">
        {/* Eyebrow row — M2 STEP-3 + M5 Fraunces beat + M11 mono countdown */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] font-semibold uppercase leading-none tracking-[0.08em] text-agent">
            What needs you{' '}
            <span className="font-[var(--font-serif)] text-[15px] font-normal normal-case italic tracking-normal">
              most
            </span>
          </p>

          {/* Mono expiry truth (M11) — the only number on the focal */}
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 font-mono text-[12px] tabular-nums',
              expiry.soon ? 'text-status-warning' : 'text-[#6B7280]',
            )}
            title={absoluteDate(item.expiresAt)}
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span aria-label={`Expires ${absoluteDate(item.expiresAt)}`}>
              {expiry.expired ? 'expired' : `expires ${expiry.label}`}
            </span>
          </span>
        </div>

        {/* Badge + risk flag */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <KindBadge kind={item.kind} muted={isResolved} />
          {!isResolved && isRisky && (
            <span className="inline-flex items-center rounded-full bg-status-critical px-2 py-0.5 text-[11px] font-medium text-status-critical">
              Needs your sign-off
            </span>
          )}
        </div>

        {/* M2 STEP-2 verdict register — the proposal headline */}
        <h2
          id={`approval-focus-title-${item.id}`}
          className="mt-3 font-[var(--font-display)] text-[20px] font-medium leading-[1.3] tracking-[-0.01em] text-[#0A0A0A]"
        >
          {summary}
        </h2>

        {/* Why — recedes under the headline (M12 tight cluster) */}
        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-[#374151]">
          {rationale}
        </p>

        {/* Expand control + actions row */}
        {!isResolved ? (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Quiet secondary — reveal the full proposal */}
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((p) => !p)}
              className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 rounded"
            >
              {expanded ? 'Hide details' : 'Review the full proposal'}
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
                  expanded && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>

            {/* Primary blue affordance — your sign-off (M6: blue, never violet) */}
            <ApprovalActions itemId={item.id} kind={item.kind} onResolved={handleResolved} />
          </div>
        ) : (
          <p className="mt-6 text-[13px] font-medium text-[#6B7280]">
            {resolved!.state === 'approved'
              ? 'Approved — the crew is on it.'
              : 'Rejected — the crew won’t publish this.'}
          </p>
        )}

        {/* Expanded proposal — fades in, fully unmounted when collapsed */}
        {expanded && !isResolved && (
          <div
            id={panelId}
            role="region"
            aria-labelledby={`approval-focus-title-${item.id}`}
            className="mt-5 animate-in fade-in duration-150 motion-reduce:animate-none"
          >
            <div className="space-y-4 rounded-[14px] border border-[rgba(110,86,240,0.18)] bg-white/70 p-5">
              {isRisky && (
                <div
                  className="rounded-lg bg-status-critical px-3 py-2"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-[13px] text-status-critical">
                    This is a high-stakes change. Beamix won&apos;t publish it until you approve.
                  </p>
                </div>
              )}
              <ProposalPreview kind={item.kind} resource={item.resource} />
              {item.evidenceUrl && (
                <a
                  href={item.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[13px] text-accent hover:text-[var(--color-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
                >
                  View evidence →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
