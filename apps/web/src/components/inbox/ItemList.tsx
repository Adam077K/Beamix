'use client';

import { cn } from '@/lib/utils';
import type { InboxItem } from '@/lib/types/shared';

interface ItemListProps {
  items: InboxItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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

export default function ItemList({ items, selectedId, onSelect }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="flex w-90 shrink-0 flex-col items-center justify-center border-r border-gray-100 bg-white px-6 py-16 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M2 8h16"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">Nothing here</p>
        <p className="mt-1 text-xs text-gray-400">
          Items matching this filter will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-90 shrink-0 overflow-y-auto border-r border-gray-100 bg-white">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isUnread = item.status === 'awaiting_review';
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'relative flex w-full flex-col justify-center gap-0.5 px-4 py-3 text-left transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
              isSelected
                ? 'bg-blue-50'
                : 'hover:bg-gray-50',
            )}
            aria-current={isSelected ? 'true' : undefined}
          >
            {/* Selected left bar */}
            {isSelected && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-0.5 bg-[#3370FF]"
              />
            )}

            {/* Row 1: actionLabel + unread dot */}
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-gray-900">
                {item.actionLabel}
              </span>
              {isUnread && (
                <span
                  aria-label="Unread"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3370FF]"
                />
              )}
            </div>

            {/* Row 2: title */}
            <span className="line-clamp-1 text-xs text-gray-500">
              {item.title}
            </span>

            {/* Row 3: age */}
            <span className="text-xs text-gray-400">
              {formatAge(item.createdAt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
