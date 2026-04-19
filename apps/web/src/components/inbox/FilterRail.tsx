'use client';

import { cn } from '@/lib/utils';

export type FilterKey = 'all' | 'awaiting_review' | 'draft' | 'approved' | 'archived';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'awaiting_review', label: 'Awaiting Review' },
  { key: 'draft', label: 'Draft' },
  { key: 'approved', label: 'Approved' },
  { key: 'archived', label: 'Archived' },
];

interface FilterRailProps {
  counts: Record<string, number>;
  active: string;
  onChange: (filter: string) => void;
}

export default function FilterRail({ counts, active, onChange }: FilterRailProps) {
  return (
    <aside className="w-60 shrink-0 border-e border-gray-100 bg-white h-full flex flex-col pt-4 pb-4">
      <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        Filter
      </p>
      <nav className="flex flex-col gap-0.5 px-2">
        {FILTERS.map(({ key, label }) => {
          const isActive = active === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'relative flex h-9 w-full items-center justify-between rounded-md px-3 text-sm transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isActive
                  ? 'bg-blue-50 font-medium text-[#3370FF]'
                  : 'font-normal text-gray-700 hover:bg-gray-50',
              )}
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute start-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#3370FF]"
                />
              )}
              <span>{label}</span>
              {count > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">{count}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
