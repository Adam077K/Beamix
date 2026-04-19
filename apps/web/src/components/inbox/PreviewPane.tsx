'use client';

import { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import type { InboxItem } from '@/lib/types/shared';
import {
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArchiveX,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface PreviewPaneProps {
  item: InboxItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onArchive?: (id: string) => void;
  /** Loading state — show spinner while content loads */
  loading?: boolean;
  /** Error state — show error message */
  error?: string | null;
}

type BannerState = 'approved' | 'rejected' | 'archived' | null;

const BANNER_CONFIG: Record<
  NonNullable<BannerState>,
  { label: string; className: string; Icon: React.ElementType }
> = {
  approved: {
    label: 'Approved — the agent will apply this change.',
    className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    Icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected — this suggestion will not be applied.',
    className: 'bg-red-50 border-red-200 text-red-600',
    Icon: XCircle,
  },
  archived: {
    label: 'Archived.',
    className: 'bg-gray-50 border-gray-200 text-gray-600',
    Icon: ArchiveX,
  },
};

/** Human-readable agent label */
function agentLabel(agentType: string): string {
  const map: Record<string, string> = {
    content_optimizer: 'Content Agent',
    faq_builder: 'FAQ Agent',
    offsite_presence_builder: 'Presence Agent',
    competitor_intelligence: 'Intel Agent',
    query_researcher: 'Query Agent',
  };
  return map[agentType] ?? 'Agent';
}

function formatDateFull(isoString: string): string {
  return new Date(isoString).toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAge(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'narrow' });
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return 'just now';
}

/** Skeleton loader for the preview pane while content loads */
function PreviewSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white"
      aria-busy="true"
      aria-label="Loading preview"
    >
      {/* Header skeleton */}
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-blue-100" />
        </div>
      </div>
      {/* Metadata bar skeleton */}
      <div className="flex shrink-0 items-center gap-4 border-b border-gray-50 px-6 py-2">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
      </div>
      {/* Content skeleton */}
      <div className="flex flex-1 items-center justify-center bg-white">
        <Loader2 size={20} className="animate-spin text-gray-300" aria-hidden="true" />
      </div>
    </div>
  );
}

/** Error state for the preview pane */
function PreviewError({ message }: { message: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-white px-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={18} className="text-red-400" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-gray-700">Could not load this item</p>
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  );
}

export default function PreviewPane({
  item,
  onApprove,
  onReject,
  onArchive,
  loading = false,
  error = null,
}: PreviewPaneProps) {
  const [banner, setBanner] = useState<BannerState>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  // Reset local state when item changes
  useEffect(() => {
    setBanner(null);
    setEvidenceOpen(false);
  }, [item.id]);

  const triggerBanner = useCallback((type: NonNullable<BannerState>) => {
    setBanner(type);
    const t = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleApprove = () => {
    onApprove?.(item.id);
    triggerBanner('approved');
  };
  const handleReject = () => {
    onReject?.(item.id);
    triggerBanner('rejected');
  };
  const handleArchive = () => {
    onArchive?.(item.id);
    triggerBanner('archived');
  };

  if (loading) return <PreviewSkeleton />;
  if (error) return <PreviewError message={error} />;

  const bannerConfig = banner ? BANNER_CONFIG[banner] : null;
  const isActionable = item.status === 'awaiting_review' || item.status === 'draft';

  return (
    <div
      className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white"
      aria-label={`Preview: ${item.title}`}
    >
      {/* ── Header ── */}
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-[17px] font-semibold leading-snug text-gray-900">
            {item.title}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{item.actionLabel}</p>
        </div>
        {isActionable && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleArchive}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#3370FF] px-3 text-xs font-medium text-white transition-colors duration-150 hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {/* ── Metadata bar ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-gray-50 bg-gray-50/40 px-6 py-2">
        <MetaChip
          icon={<span className="h-1.5 w-1.5 rounded-full bg-[#3370FF]" aria-hidden="true" />}
          label={`By ${agentLabel(item.agentType)}`}
        />
        <MetaChip
          icon={<Clock size={11} className="text-gray-400" aria-hidden="true" />}
          label={`${formatAge(item.createdAt)} · ${formatDateFull(item.createdAt)}`}
        />
        {item.targetUrl && (
          <a
            href={item.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#3370FF] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3370FF] rounded-sm transition-colors duration-150"
          >
            <ExternalLink size={11} aria-hidden="true" />
            {item.targetUrl.replace(/^https?:\/\//, '').split('/')[0]}
          </a>
        )}
        {item.ymylFlagged && (
          <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
            <AlertTriangle size={10} aria-hidden="true" />
            YMYL — review carefully
          </span>
        )}
      </div>

      {/* ── Action result banner (aria-live) ── */}
      <div aria-live="polite" aria-atomic="true" className="shrink-0">
        {bannerConfig && (
          <div
            className={cn(
              'flex items-center gap-2 border-b px-6 py-2.5 text-sm font-medium',
              bannerConfig.className,
            )}
          >
            <bannerConfig.Icon size={14} aria-hidden="true" />
            {bannerConfig.label}
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <article
          className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#3370FF] prose-a:no-underline hover:prose-a:underline"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {item.fullMarkdown}
          </ReactMarkdown>
        </article>
      </div>

      {/* ── Collapsible evidence panel ── */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/60">
        <button
          type="button"
          onClick={() => setEvidenceOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
          aria-expanded={evidenceOpen}
          aria-controls="evidence-panel"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            Evidence
          </span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={cn(
              'text-gray-400 transition-transform duration-200',
              evidenceOpen && 'rotate-180',
            )}
          />
        </button>

        {evidenceOpen && (
          <div
            id="evidence-panel"
            className="grid grid-cols-1 gap-4 px-6 pb-5 pt-1 sm:grid-cols-2"
          >
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Trigger
              </p>
              <p className="text-sm text-gray-700">{item.evidence.triggerSource}</p>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Impact estimate
              </p>
              <p className="text-sm text-gray-700">{item.evidence.impactEstimate}</p>
            </div>

            {item.evidence.targetQueries.length > 0 && (
              <div className="col-span-full">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Target queries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.evidence.targetQueries.map((q) => (
                    <span
                      key={q}
                      className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-[#3370FF]"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pinned CTA footer (mobile) ── */}
      {isActionable && (
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="flex flex-1 h-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="flex flex-1 h-10 items-center justify-center rounded-lg bg-[#3370FF] text-sm font-medium text-white transition-colors hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-gray-500">
      {icon}
      {label}
    </span>
  );
}
