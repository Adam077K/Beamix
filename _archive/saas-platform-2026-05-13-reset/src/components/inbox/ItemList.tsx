'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { agentTypeLabel } from '@/constants/agents';
import type { InboxItem } from '@/lib/types/shared';
import type { FilterKey } from './FilterRail';

interface ItemListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeFilter: FilterKey;
}

const AGENT_INITIALS: Record<string, string> = {
  content_optimizer: 'CO',
  faq_builder: 'FAQ',
  competitor_intelligence: 'CI',
  offsite_presence_builder: 'LB',
  citation_builder: 'CB',
  schema_markup: 'SM',
  local_seo: 'LS',
};

// Deterministic but varied tints per agent type
const AGENT_TINT: Record<string, string> = {
  content_optimizer: 'bg-blue-50 text-blue-600',
  faq_builder: 'bg-violet-50 text-violet-600',
  competitor_intelligence: 'bg-orange-50 text-orange-600',
  offsite_presence_builder: 'bg-teal-50 text-teal-600',
  citation_builder: 'bg-emerald-50 text-emerald-600',
  schema_markup: 'bg-rose-50 text-rose-600',
  local_seo: 'bg-amber-50 text-amber-600',
};

const STATUS_DOT: Record<string, string> = {
  awaiting_review: 'bg-amber-400',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  archived: 'bg-gray-300',
  draft: 'bg-gray-400',
};

const EMPTY_MESSAGES: Record<string, { title: string; body: string }> = {
  awaiting_review: {
    title: 'Nothing waiting',
    body: "You're caught up. New agent outputs will appear here.",
  },
  draft: {
    title: 'No drafts',
    body: 'Saved drafts from agents will show up here.',
  },
  approved: {
    title: 'No approved items',
    body: 'Accept agent suggestions to see them here.',
  },
  archived: {
    title: 'Archive is empty',
    body: 'Archived items move here after 30 days.',
  },
  all: {
    title: 'Inbox is empty',
    body: 'Agent outputs will appear here once agents run.',
  },
};

function formatAge(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
}

function AgentAvatar({ agentType }: { agentType: string }) {
  const tint = AGENT_TINT[agentType] ?? 'bg-gray-100 text-gray-500';
  const initials = AGENT_INITIALS[agentType] ?? agentType.slice(0, 2).toUpperCase();
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold',
        tint,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function ItemList({ items, selectedId, onSelect, activeFilter }: ItemListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0) {
    const msg = EMPTY_MESSAGES[activeFilter] ?? EMPTY_MESSAGES['all'];
    return (
      <div className="flex w-[420px] shrink-0 flex-col items-center justify-center border-e border-gray-100 bg-white px-8 py-16 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="14" height="12" rx="2" stroke="#9CA3AF" strokeWidth="1.4" />
            <path d="M6 7.5h6M6 10.5h4" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">{msg.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">{msg.body}</p>
      </div>
    );
  }

  return (
    <div
      className="w-[420px] shrink-0 overflow-y-auto border-e border-gray-100 bg-white"
      role="listbox"
      aria-label="Inbox items"
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isUnread = item.status === 'awaiting_review';
        const isHovered = hoveredId === item.id;
        const agentLabel = agentTypeLabel(item.agentType);
        const dotColor = STATUS_DOT[item.status] ?? 'bg-gray-300';

        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              'group relative flex w-full items-start gap-3 border-b border-gray-50 px-4 py-[14px] text-left',
              'transition-colors duration-75',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
              isSelected
                ? 'bg-blue-50/80'
                : 'hover:bg-gray-50/70',
            )}
            style={{ minHeight: '72px' }}
          >
            {/* Selection accent bar on start side */}
            {isSelected && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 start-0 w-[3px] bg-[#3370FF]"
              />
            )}

            {/* Bulk-select checkbox — appears on hover */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute start-4 top-[50%] -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white transition-opacity duration-100',
                isHovered && !isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none',
              )}
            />

            {/* Status dot */}
            <span className="mt-0.5 flex shrink-0 items-center pt-[1px]">
              <span
                className={cn('h-2 w-2 rounded-full', dotColor)}
                aria-label={`Status: ${item.status.replace('_', ' ')}`}
              />
            </span>

            {/* Agent avatar */}
            <AgentAvatar agentType={item.agentType} />

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Top line: agent name + time */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] font-semibold text-gray-700">
                  {agentLabel}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
                  {formatAge(item.createdAt)}
                </span>
              </div>

              {/* Middle line: title */}
              <p
                className={cn(
                  'mt-[2px] truncate text-[13px]',
                  isUnread ? 'font-semibold text-gray-900' : 'font-normal text-gray-700',
                )}
              >
                {item.title}
              </p>

              {/* Bottom line: preview snippet */}
              <p className="mt-[2px] line-clamp-1 text-[12px] text-gray-400">
                {item.previewMarkdown.replace(/[#*_`[\]]/g, '').slice(0, 80)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
