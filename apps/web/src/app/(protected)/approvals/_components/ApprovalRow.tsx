'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApprovalQueueItem } from '../_data'
import { KindBadge } from './KindBadge'
import { ProposalPreview } from './ProposalPreview'
import { ApprovalActions, type ActionResolved } from './ApprovalActions'

// ---------------------------------------------------------------------------
// Helpers — reused from ApprovalsList, co-located here for the client render
// ---------------------------------------------------------------------------

function extractSummary(resource: Record<string, unknown>, kind: ApprovalQueueItem['kind']): string {
  if (typeof resource['summary'] === 'string' && (resource['summary'] as string).trim()) {
    return (resource['summary'] as string).trim()
  }
  if (typeof resource['title'] === 'string' && (resource['title'] as string).trim()) {
    return (resource['title'] as string).trim()
  }
  if (typeof resource['description'] === 'string' && (resource['description'] as string).trim()) {
    return (resource['description'] as string).trim()
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
// Risk detection — defensive optional reads
// ---------------------------------------------------------------------------

function isHighRisk(resource: Record<string, unknown>): boolean {
  const risk = resource['risk']
  const mandatory = resource['mandatory_human']
  return risk === 'ymyl' || mandatory === true
}

// ---------------------------------------------------------------------------
// RiskFlag pill
// ---------------------------------------------------------------------------

function RiskFlag() {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-status-critical text-status-critical whitespace-nowrap">
      Needs your sign-off
    </span>
  )
}

// ---------------------------------------------------------------------------
// ResolvedTag — in-session after action
// ---------------------------------------------------------------------------

function ResolvedTag({ state }: { state: 'approved' | 'rejected' }) {
  if (state === 'approved') {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-status-positive text-status-positive whitespace-nowrap">
        Approved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-status-neutral text-status-neutral whitespace-nowrap">
      Rejected
    </span>
  )
}

// ---------------------------------------------------------------------------
// ApprovalRow — accordion shell
// ---------------------------------------------------------------------------

interface ApprovalRowProps {
  item: ApprovalQueueItem
}

export function ApprovalRow({ item }: ApprovalRowProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [resolved, setResolved] = React.useState<ActionResolved | null>(null)

  const panelId = `approval-panel-${item.id}`
  const triggerId = `approval-trigger-${item.id}`

  const summary = extractSummary(item.resource, item.kind)
  const isRisky = isHighRisk(item.resource)
  const isExpiringSoon =
    new Date(item.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setExpanded((prev) => !prev)
      }
    },
    [],
  )

  const handleResolved = React.useCallback((r: ActionResolved) => {
    setResolved(r)
    setExpanded(false)
  }, [])

  const isResolved = resolved !== null

  return (
    <li
      className={cn(
        'transition-colors duration-200',
        isResolved && 'opacity-60',
      )}
    >
      {/* Collapsed row — button-as-row */}
      <button
        id={triggerId}
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => !isResolved && setExpanded((prev) => !prev)}
        onKeyDown={handleKeyDown}
        disabled={isResolved}
        className={cn(
          'flex w-full items-center gap-4 px-5 py-4 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
          !isResolved && 'hover:bg-[#F4F6FA] cursor-pointer',
          isResolved && 'cursor-default',
        )}
        aria-label={`${summary} — ${item.kind.replace('_', ' ')}`}
      >
        {/* KindBadge */}
        <span className="shrink-0">
          <KindBadge kind={item.kind} muted={isResolved} />
        </span>

        {/* Summary + secondary line */}
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium text-[#0A0A0A] truncate">
            {summary}
          </span>
          {!isResolved && isRisky && (
            <span className="mt-1 block">
              <RiskFlag />
            </span>
          )}
        </span>

        {/* Expiry */}
        <time
          dateTime={item.expiresAt}
          title={absoluteDate(item.expiresAt)}
          className={cn(
            'shrink-0 font-mono text-[12px] tabular-nums',
            isExpiringSoon && !isResolved
              ? 'text-status-warning'
              : 'text-[#6B7280]',
          )}
          aria-label={`Expires ${absoluteDate(item.expiresAt)}`}
        >
          {relativeTime(item.expiresAt)}
        </time>

        {/* Resolved tag OR chevron */}
        {isResolved ? (
          <span className="shrink-0">
            <ResolvedTag state={resolved!.state} />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 motion-reduce:transition-none',
              expanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Expanded panel — in-place accordion */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          'overflow-hidden transition-all duration-200 motion-reduce:transition-none',
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
        aria-hidden={!expanded}
      >
        <div className="px-5 pb-5 pt-1 space-y-4">
          {/* 1. Mandatory-human banner — only when risky */}
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

          {/* 2. Preview micro-environment */}
          <ProposalPreview kind={item.kind} resource={item.resource} />

          {/* 3. Rationale */}
          {(() => {
            const rationale =
              (typeof item.resource['rationale'] === 'string' ? item.resource['rationale'] : null) ??
              (typeof item.resource['reason'] === 'string' ? item.resource['reason'] : null) ??
              'The crew flagged this as worth doing now.'
            return (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">
                  Why
                </p>
                <p className="text-[13px] leading-relaxed text-[#374151]">{rationale}</p>
              </div>
            )
          })()}

          {/* 4. Evidence */}
          {item.evidenceUrl && (
            <div>
              <a
                href={item.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-accent hover:text-[var(--color-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
              >
                View evidence →
              </a>
            </div>
          )}

          {/* 5. Expiry line */}
          <p className="text-[12px] text-[#6B7280]">
            Expires {absoluteDate(item.expiresAt)}
          </p>

          {/* 6. Actions */}
          <ApprovalActions itemId={item.id} kind={item.kind} onResolved={handleResolved} />
        </div>
      </div>
    </li>
  )
}
