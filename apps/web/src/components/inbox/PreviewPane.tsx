'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import type { InboxItem } from '@/lib/types/shared';

interface PreviewPaneProps {
  item: InboxItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onArchive?: (id: string) => void;
}

type BannerState = 'approved' | 'rejected' | 'archived' | null;

const BANNER_LABELS: Record<NonNullable<BannerState>, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

const BANNER_COLORS: Record<NonNullable<BannerState>, string> = {
  approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  rejected: 'bg-red-50 border-red-200 text-red-700',
  archived: 'bg-gray-50 border-gray-200 text-gray-600',
};

export default function PreviewPane({ item, onApprove, onReject, onArchive }: PreviewPaneProps) {
  const [banner, setBanner] = useState<BannerState>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const triggerBanner = useCallback((type: NonNullable<BannerState>) => {
    setBanner(type);
    const t = setTimeout(() => setBanner(null), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleApprove = () => {
    console.log('[inbox] approve', item.id);
    onApprove?.(item.id);
    triggerBanner('approved');
  };

  const handleReject = () => {
    console.log('[inbox] reject', item.id);
    onReject?.(item.id);
    triggerBanner('rejected');
  };

  const handleArchive = () => {
    console.log('[inbox] archive', item.id);
    onArchive?.(item.id);
    triggerBanner('archived');
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      {/* Top: title + action bar */}
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 leading-tight">
            {item.title}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{item.actionLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleReject}
            className="flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleArchive}
            className="flex h-8 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="flex h-8 items-center rounded-lg bg-[#3370FF] px-3 text-xs font-medium text-white transition-colors hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Inline banner */}
      {banner && (
        <div
          className={cn(
            'shrink-0 border-b px-6 py-2 text-sm font-medium transition-all duration-200',
            BANNER_COLORS[banner],
          )}
          role="status"
          aria-live="polite"
        >
          {BANNER_LABELS[banner]}
        </div>
      )}

      {/* Middle: Markdown content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <article className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#3370FF] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {item.fullMarkdown}
          </ReactMarkdown>
        </article>
      </div>

      {/* Bottom: collapsible evidence */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/60">
        <button
          type="button"
          onClick={() => setEvidenceOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
          aria-expanded={evidenceOpen}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Evidence
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={cn(
              'text-gray-400 transition-transform duration-200',
              evidenceOpen ? 'rotate-180' : 'rotate-0',
            )}
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {evidenceOpen && (
          <div className="grid grid-cols-1 gap-4 px-6 pb-5 pt-1 sm:grid-cols-2">
            {/* Trigger source */}
            <div>
              <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Trigger
              </dt>
              <dd className="text-sm text-gray-700">{item.evidence.triggerSource}</dd>
            </div>

            {/* Impact estimate */}
            <div>
              <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Impact estimate
              </dt>
              <dd className="text-sm text-gray-700">{item.evidence.impactEstimate}</dd>
            </div>

            {/* Target queries */}
            {item.evidence.targetQueries.length > 0 && (
              <div className="col-span-full">
                <dt className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Target queries
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {item.evidence.targetQueries.map((q) => (
                    <span
                      key={q}
                      className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-[#3370FF]"
                    >
                      {q}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {/* YMYL badge */}
            {item.ymylFlagged && (
              <div className="col-span-full">
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 1L1 10h10L6 1z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 5v2.5M6 8.5v.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  YMYL — Review carefully before approving
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
