'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import type { InboxItem } from '@/lib/types/shared';

interface PreviewPaneProps {
  item: InboxItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onArchive?: (id: string) => void;
  onBackToList?: () => void;
}

type ActionState = 'approved' | 'rejected' | 'changes_requested' | 'archived' | null;

const STATUS_LABELS: Record<string, string> = {
  awaiting_review: 'Awaiting review',
  draft: 'Draft',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

const STATUS_PILL: Record<string, string> = {
  awaiting_review: 'bg-amber-50 text-amber-700 border border-amber-200',
  draft: 'bg-gray-100 text-gray-600 border border-gray-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  archived: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const AGENT_LABEL: Record<string, string> = {
  content_optimizer: 'Content Optimizer',
  faq_builder: 'FAQ Builder',
  competitor_intelligence: 'Competitor Intel',
  offsite_presence_builder: 'Listings Builder',
  citation_builder: 'Citation Builder',
  schema_markup: 'Schema Markup',
  local_seo: 'Local SEO',
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PreviewPane({
  item,
  onApprove,
  onReject,
  onRequestChanges,
  onArchive,
  onBackToList,
}: PreviewPaneProps) {
  const router = useRouter();
  const [actionState, setActionState] = useState<ActionState>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const triggerAction = useCallback((type: NonNullable<ActionState>) => {
    setActionState(type);
    const t = setTimeout(() => setActionState(null), 2200);
    return () => clearTimeout(t);
  }, []);

  const handleApprove = () => {
    onApprove?.(item.id);
    triggerAction('approved');
  };

  const handleReject = () => {
    onReject?.(item.id);
    triggerAction('rejected');
  };

  const handleRequestChanges = () => {
    onRequestChanges?.(item.id);
    triggerAction('changes_requested');
  };

  const handleArchive = () => {
    onArchive?.(item.id);
    triggerAction('archived');
  };

  const agentLabel = AGENT_LABEL[item.agentType] ?? item.agentType;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      {/* Action feedback banner */}
      {actionState && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'shrink-0 border-b px-6 py-2 text-[13px] font-medium transition-all duration-200',
            actionState === 'approved' && 'border-emerald-100 bg-emerald-50 text-emerald-700',
            actionState === 'rejected' && 'border-red-100 bg-red-50 text-red-600',
            actionState === 'changes_requested' && 'border-amber-100 bg-amber-50 text-amber-700',
            actionState === 'archived' && 'border-gray-100 bg-gray-50 text-gray-600',
          )}
        >
          {actionState === 'approved' && 'Approved — published to your site queue'}
          {actionState === 'rejected' && 'Rejected — item moved to archive'}
          {actionState === 'changes_requested' && 'Changes requested — agent notified'}
          {actionState === 'archived' && 'Archived'}
        </div>
      )}

      {/* Metadata row */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 px-6 py-3.5">
        {/* Mobile: back to list */}
        {onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            className="me-2 flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] sm:hidden"
            aria-label="Back to inbox list"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}

        <span className="text-[12px] font-medium text-gray-500">{agentLabel}</span>
        <span aria-hidden="true" className="h-3 w-px bg-gray-200" />
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
            STATUS_PILL[item.status] ?? 'bg-gray-100 text-gray-500',
          )}
        >
          {STATUS_LABELS[item.status] ?? item.status}
        </span>
        <span aria-hidden="true" className="h-3 w-px bg-gray-200" />
        <time
          dateTime={item.createdAt}
          className="text-[12px] text-gray-400"
        >
          {formatDate(item.createdAt)}
        </time>

        {item.ymylFlagged && (
          <>
            <span aria-hidden="true" className="h-3 w-px bg-gray-200" />
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M5.5 1L1 9.5h9L5.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M5.5 4.5V6.5M5.5 7.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              YMYL
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <div className="shrink-0 px-6 pb-0 pt-5">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-gray-900">
          {item.title}
        </h1>
        {item.targetUrl && (
          <a
            href={item.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#3370FF] transition-colors hover:text-[#2860e8]"
          >
            {item.targetUrl}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 8L8 2M8 2H4.5M8 2v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <article className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:tracking-tight prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#3370FF] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {item.fullMarkdown}
          </ReactMarkdown>
        </article>

        {/* Evidence section — collapsible */}
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setEvidenceOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
            aria-expanded={evidenceOpen}
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Evidence
            </span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
              className={cn(
                'text-gray-400 transition-transform duration-150',
                evidenceOpen ? 'rotate-180' : 'rotate-0',
              )}
            >
              <path d="M2.5 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {evidenceOpen && (
            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 px-4 pb-4 pt-3 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Trigger
                </dt>
                <dd className="text-[13px] text-gray-700">{item.evidence.triggerSource}</dd>
              </div>
              <div>
                <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Impact estimate
                </dt>
                <dd className="text-[13px] font-medium text-gray-800">{item.evidence.impactEstimate}</dd>
              </div>
              {item.evidence.targetQueries.length > 0 && (
                <div className="col-span-full">
                  <dt className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Target queries
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {item.evidence.targetQueries.map((q) => (
                      <span
                        key={q}
                        className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[12px] text-[#3370FF]"
                      >
                        {q}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pinned bottom action bar */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3.5">
        <div className="flex items-center gap-2">
          {/* Primary: Accept */}
          <button
            type="button"
            onClick={handleApprove}
            disabled={!!actionState}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#3370FF] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Accept
            <kbd className="hidden rounded border border-blue-400/50 bg-blue-600/30 px-1 font-mono text-[10px] text-blue-100 sm:inline">
              e
            </kbd>
          </button>

          {/* Secondary: Reject */}
          <button
            type="button"
            onClick={handleReject}
            disabled={!!actionState}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Reject
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px] text-gray-400">
              x
            </kbd>
          </button>

          {/* Ghost: Request changes */}
          <button
            type="button"
            onClick={handleRequestChanges}
            disabled={!!actionState}
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Request changes
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px] text-gray-400">
              r
            </kbd>
          </button>

          {/* Open in Workspace */}
          {item.jobId && (
            <button
              type="button"
              onClick={() => router.push(`/workspace/${item.jobId}`)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#3370FF]/30 hover:bg-blue-50 hover:text-[#3370FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Open in Workspace →
            </button>
          )}

          {/* Ghost: Archive */}
          <button
            type="button"
            onClick={handleArchive}
            disabled={!!actionState}
            className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Archive item (a)"
            title="Archive (a)"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <rect x="1.5" y="3.5" width="12" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2.5 6v5a1 1 0 001 1h8a1 1 0 001-1V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M5.5 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
