'use client';

import { cn } from '@/lib/utils';
import {
  Inbox,
  Clock,
  FileText,
  CheckCircle,
  Archive,
  LayoutList,
} from 'lucide-react';

export type FilterKey = 'all' | 'awaiting_review' | 'draft' | 'approved' | 'archived';

const FILTERS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: LayoutList },
  { key: 'awaiting_review', label: 'Awaiting Review', icon: Clock },
  { key: 'draft', label: 'Draft', icon: FileText },
  { key: 'approved', label: 'Approved', icon: CheckCircle },
  { key: 'archived', label: 'Archived', icon: Archive },
];

interface FilterRailProps {
  counts: Record<string, number>;
  active: string;
  onChange: (filter: string) => void;
  /** Mobile chip bar mode — renders as horizontal scrollable row */
  chipMode?: boolean;
}

export default function FilterRail({ counts, active, onChange, chipMode = false }: FilterRailProps) {
  if (chipMode) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] border-b border-gray-100 bg-white">
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={isActive}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isActive
                  ? 'border-[#3370FF] bg-blue-50 text-[#3370FF]'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              <Icon size={12} aria-hidden="true" />
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'tabular-nums',
                    isActive ? 'text-[#3370FF]/70' : 'text-gray-400',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <aside
      className="w-56 shrink-0 border-e border-gray-100 bg-white flex flex-col h-full overflow-y-auto"
      aria-label="Filter inbox by status"
    >
      <div className="flex items-center gap-2 px-4 pb-3 pt-5">
        <Inbox size={14} className="text-gray-400" aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Inbox
        </p>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 pb-4" aria-label="Inbox filters">
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={isActive}
              className={cn(
                'relative flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isActive
                  ? 'bg-blue-50 font-medium text-[#3370FF]'
                  : 'font-normal text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {/* RTL-safe active indicator using start-0 */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute start-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#3370FF]"
                />
              )}

              <Icon
                size={14}
                aria-hidden="true"
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-[#3370FF]' : 'text-gray-400',
                )}
              />

              <span className="flex-1 text-start">{label}</span>

              {count > 0 && (
                <span
                  className={cn(
                    'ms-auto tabular-nums text-xs',
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
    </aside>
  );
}
