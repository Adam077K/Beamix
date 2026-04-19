'use client';

import { cn } from '@/lib/utils';

export type FilterKey = 'all' | 'awaiting_review' | 'draft' | 'approved' | 'archived';

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'awaiting_review',
    label: 'Awaiting review',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7.5 4.5V7.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'draft',
    label: 'Draft',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 5.5h5M5 7.5h5M5 9.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 7.5l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'archived',
    label: 'Archived',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <rect x="1.5" y="3.5" width="12" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 6v5a1 1 0 001 1h8a1 1 0 001-1V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5.5 9.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'all',
    label: 'All items',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M2 4h11M2 7.5h11M2 11h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface FilterRailProps {
  counts: Record<string, number>;
  active: string;
  onChange: (filter: string) => void;
  onOpenShortcuts: () => void;
}

export default function FilterRail({ counts, active, onChange, onOpenShortcuts }: FilterRailProps) {
  return (
    <aside
      className="hidden w-60 shrink-0 flex-col border-e border-gray-100 bg-white sm:flex"
      aria-label="Inbox filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="text-[13px] font-semibold text-gray-900">Inbox</h2>
        {counts['awaiting_review'] > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#3370FF] px-1.5 text-[10px] font-semibold tabular-nums text-white">
            {counts['awaiting_review']}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2.5" role="navigation" aria-label="Filter items">
        {FILTERS.map(({ key, label, icon }) => {
          const isActive = active === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'group relative flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] transition-colors duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isActive
                  ? 'bg-blue-50 font-medium text-[#3370FF]'
                  : 'font-normal text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Accent bar on start side (RTL-safe: border-s) */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-[#3370FF]"
                />
              )}
              <span className={cn('shrink-0', isActive ? 'text-[#3370FF]' : 'text-gray-400 group-hover:text-gray-500')}>
                {icon}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'tabular-nums text-xs',
                    isActive ? 'text-[#3370FF]/70' : 'text-gray-400',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyboard shortcut hint at bottom */}
      <div className="mt-auto px-4 pb-5">
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-xs text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          aria-label="View keyboard shortcuts"
        >
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[10px] text-gray-500">
            ?
          </span>
          <span>Keyboard shortcuts</span>
        </button>
      </div>
    </aside>
  );
}
