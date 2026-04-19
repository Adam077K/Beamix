'use client';

import { cn } from '@/lib/utils';
import type { InboxItem } from '@/lib/types/shared';
import type { FilterKey } from './FilterRail';
import {
  FileText,
  Search,
  Link2,
  HelpCircle,
  Sparkles,
  Users,
  CheckCheck,
} from 'lucide-react';

interface ItemListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Active filter key — used to show context-specific empty state */
  activeFilter?: FilterKey;
  /** Loading state — shows skeleton rows */
  loading?: boolean;
}

function formatAge(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'narrow' });
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return 'just now';
}

/** Map agent types to a Lucide icon component */
function AgentIcon({ agentType, isSelected }: { agentType: string; isSelected: boolean }) {
  const className = cn(
    'shrink-0 transition-colors',
    isSelected ? 'text-[#3370FF]' : 'text-gray-400',
  );
  const size = 13;
  switch (agentType) {
    case 'content_optimizer':
      return <FileText size={size} className={className} aria-hidden="true" />;
    case 'faq_builder':
      return <HelpCircle size={size} className={className} aria-hidden="true" />;
    case 'offsite_presence_builder':
      return <Link2 size={size} className={className} aria-hidden="true" />;
    case 'competitor_intelligence':
      return <Users size={size} className={className} aria-hidden="true" />;
    case 'query_researcher':
      return <Search size={size} className={className} aria-hidden="true" />;
    default:
      return <Sparkles size={size} className={className} aria-hidden="true" />;
  }
}

/** Human-readable agent label for display in metadata line */
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

/** Status dot color per status */
function statusDotClass(status: InboxItem['status']): string {
  switch (status) {
    case 'awaiting_review':
      return 'bg-[#3370FF]';
    case 'draft':
      return 'bg-[#F59E0B]';
    case 'approved':
      return 'bg-[#10B981]';
    case 'archived':
      return 'bg-gray-300';
    default:
      return 'bg-gray-300';
  }
}

const EMPTY_COPY: Record<FilterKey, { headline: string; sub: string }> = {
  all: {
    headline: "You're all caught up",
    sub: 'No suggestions yet. Agents will surface items after your next scan.',
  },
  awaiting_review: {
    headline: 'Nothing waiting for review',
    sub: "You're caught up — check back after the next agent run.",
  },
  draft: {
    headline: 'No drafts',
    sub: 'Agent drafts appear here before they are ready for review.',
  },
  approved: {
    headline: 'No approved items',
    sub: 'Approved suggestions will appear here once you start accepting.',
  },
  archived: {
    headline: 'Archive is empty',
    sub: 'Dismissed or archived items land here.',
  },
};

function SkeletonRow() {
  return (
    <div className="flex w-full flex-col gap-1.5 border-b border-gray-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-gray-200" />
        <div className="ms-auto h-2 w-8 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-2.5 w-4/5 animate-pulse rounded bg-gray-100" />
      <div className="h-2 w-1/3 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function ItemList({ items, selectedId, onSelect, activeFilter = 'all', loading = false }: ItemListProps) {
  if (loading) {
    return (
      <div
        className="w-80 shrink-0 overflow-y-auto border-e border-gray-100 bg-white"
        aria-label="Loading inbox items"
        aria-busy="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  const emptyCopy = EMPTY_COPY[activeFilter] ?? EMPTY_COPY.all;

  if (items.length === 0) {
    return (
      <div
        className="flex w-80 shrink-0 flex-col items-center justify-center border-e border-gray-100 bg-white px-6 py-16 text-center"
        role="status"
        aria-label={emptyCopy.headline}
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <CheckCheck size={18} className="text-gray-300" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-gray-700">{emptyCopy.headline}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-400 max-w-[180px]">
          {emptyCopy.sub}
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-80 shrink-0 overflow-y-auto border-e border-gray-100 bg-white"
      role="list"
      aria-label="Inbox items"
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isUnread = item.status === 'awaiting_review';
        return (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(item.id)}
            aria-pressed={isSelected}
            aria-label={`${item.actionLabel}${isUnread ? ' — unread' : ''}`}
            className={cn(
              'relative flex w-full flex-col gap-0.5 border-b border-gray-50 px-4 py-3 text-start transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50/70',
            )}
          >
            {/* RTL-safe selected accent bar */}
            {isSelected && (
              <span
                aria-hidden="true"
                className="absolute start-0 top-0 h-full w-0.5 bg-[#3370FF]"
              />
            )}

            {/* Row 1: status dot + agent icon + action label + time */}
            <div className="flex items-center gap-1.5">
              {/* Status dot */}
              <span
                aria-hidden="true"
                className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusDotClass(item.status))}
              />
              {/* Agent icon */}
              <AgentIcon agentType={item.agentType} isSelected={isSelected} />
              {/* Title / action label */}
              <span
                className={cn(
                  'flex-1 truncate text-[13px] leading-snug',
                  isUnread ? 'font-semibold text-gray-900' : 'font-normal text-gray-700',
                )}
              >
                {item.actionLabel}
              </span>
              {/* Timestamp */}
              <span className="ms-auto shrink-0 text-[11px] text-gray-400 tabular-nums">
                {formatAge(item.createdAt)}
              </span>
            </div>

            {/* Row 2: preview snippet */}
            <p className="line-clamp-2 ps-[calc(1.5rem_+_0.375rem)] text-[12px] leading-relaxed text-gray-500">
              {item.previewMarkdown.replace(/[#*_`>]/g, '').trim()}
            </p>

            {/* Row 3: agent label */}
            <p className="ps-[calc(1.5rem_+_0.375rem)] text-[11px] text-gray-400">
              {agentLabel(item.agentType)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
