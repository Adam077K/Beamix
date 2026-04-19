'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { InboxItem } from '@/lib/types/shared';
import FilterRail, { type FilterKey } from './FilterRail';
import ItemList from './ItemList';
import PreviewPane from './PreviewPane';

interface InboxClientProps {
  items: InboxItem[];
}

type StatusFilter = FilterKey;

function computeCounts(items: InboxItem[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: items.length,
    awaiting_review: 0,
    draft: 0,
    approved: 0,
    archived: 0,
  };
  for (const item of items) {
    if (item.status in counts) {
      counts[item.status]++;
    }
  }
  return counts;
}

// Mobile: chip labels for filter bar
const MOBILE_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'awaiting_review', label: 'Awaiting review' },
  { key: 'draft', label: 'Draft' },
  { key: 'approved', label: 'Approved' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
];

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['j'], label: 'Move selection down' },
  { keys: ['k'], label: 'Move selection up' },
  { keys: ['e'], label: 'Accept / approve' },
  { keys: ['x'], label: 'Reject' },
  { keys: ['r'], label: 'Request changes' },
  { keys: ['a'], label: 'Archive' },
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['Esc'], label: 'Close modal / clear selection' },
];

export default function InboxClient({ items }: InboxClientProps) {
  const [filter, setFilter] = useState<StatusFilter>('awaiting_review');
  const [selectedId, setSelectedId] = useState<string | null>(
    items.find((i) => i.status === 'awaiting_review')?.id ?? items[0]?.id ?? null,
  );
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // Mobile: when a row is tapped, show preview pane full-screen
  const [mobileViewingItem, setMobileViewingItem] = useState(false);

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.status === filter);

  const selectedItem = filteredItems.find((i) => i.id === selectedId) ?? null;
  const counts = computeCounts(items);

  // Reset selection when filter changes
  useEffect(() => {
    const first = filteredItems[0];
    setSelectedId(first?.id ?? null);
    setMobileViewingItem(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleNext = useCallback(() => {
    if (!filteredItems.length) return;
    const idx = filteredItems.findIndex((i) => i.id === selectedId);
    const next = filteredItems[idx + 1] ?? filteredItems[0];
    setSelectedId(next.id);
  }, [filteredItems, selectedId]);

  const handlePrev = useCallback(() => {
    if (!filteredItems.length) return;
    const idx = filteredItems.findIndex((i) => i.id === selectedId);
    const prev =
      idx > 0 ? filteredItems[idx - 1] : filteredItems[filteredItems.length - 1];
    setSelectedId(prev.id);
  }, [filteredItems, selectedId]);

  const handleApprove = useCallback(
    (id: string) => {
      console.log('[inbox] approve', id);
    },
    [],
  );

  const handleReject = useCallback(
    (id: string) => {
      console.log('[inbox] reject', id);
    },
    [],
  );

  const handleRequestChanges = useCallback(
    (id: string) => {
      console.log('[inbox] request-changes', id);
    },
    [],
  );

  const handleArchive = useCallback(
    (id: string) => {
      console.log('[inbox] archive', id);
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if shortcuts modal is open (Esc handled by Dialog)
      if (shortcutsOpen) return;

      // Skip when focus is inside an input/textarea/contenteditable
      const tag = (e.target as HTMLElement).tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case 'j':
          e.preventDefault();
          handleNext();
          break;
        case 'k':
          e.preventDefault();
          handlePrev();
          break;
        case 'e':
          e.preventDefault();
          if (selectedId) handleApprove(selectedId);
          break;
        case 'x':
          e.preventDefault();
          if (selectedId) handleReject(selectedId);
          break;
        case 'r':
          e.preventDefault();
          if (selectedId) handleRequestChanges(selectedId);
          break;
        case 'a':
          e.preventDefault();
          if (selectedId) handleArchive(selectedId);
          break;
        case '?':
          e.preventDefault();
          setShortcutsOpen(true);
          break;
        case 'Escape':
          setSelectedId(null);
          setMobileViewingItem(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNext,
    handlePrev,
    handleApprove,
    handleReject,
    handleRequestChanges,
    handleArchive,
    selectedId,
    shortcutsOpen,
  ]);

  const handleMobileSelect = (id: string) => {
    setSelectedId(id);
    setMobileViewingItem(true);
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white">
      {/* Mobile: filter chip bar (hidden sm+) */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-gray-100 px-4 py-2.5 sm:hidden">
        {MOBILE_FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]',
                isActive
                  ? 'bg-[#3370FF] text-white'
                  : 'border border-gray-200 bg-white text-gray-600',
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'tabular-nums text-[11px]',
                    isActive ? 'text-blue-100' : 'text-gray-400',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3-pane layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* FilterRail — hidden on mobile */}
        <FilterRail
          counts={counts}
          active={filter}
          onChange={(f) => setFilter(f as StatusFilter)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Mobile: item list (full width when not viewing item) */}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto sm:hidden',
            mobileViewingItem ? 'hidden' : 'block',
          )}
        >
          <ItemList
            items={filteredItems}
            selectedId={selectedId}
            onSelect={handleMobileSelect}
            activeFilter={filter}
          />
        </div>

        {/* Mobile: preview (full width when viewing item) */}
        <div
          className={cn(
            'min-h-0 flex-1 flex-col overflow-hidden sm:hidden',
            mobileViewingItem ? 'flex' : 'hidden',
          )}
        >
          {selectedItem ? (
            <PreviewPane
              item={selectedItem}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onArchive={handleArchive}
              onBackToList={() => setMobileViewingItem(false)}
            />
          ) : (
            <EmptySelection />
          )}
        </div>

        {/* Desktop: item list (fixed 420px) */}
        <div className="hidden sm:flex">
          <ItemList
            items={filteredItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activeFilter={filter}
          />
        </div>

        {/* Desktop: preview pane */}
        <main className="hidden min-w-0 flex-1 flex-col overflow-hidden sm:flex">
          {selectedItem ? (
            <PreviewPane
              item={selectedItem}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onArchive={handleArchive}
            />
          ) : (
            <EmptySelection />
          )}
        </main>
      </div>

      {/* Keyboard shortcuts modal */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold text-gray-900">
              Keyboard shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="mt-1">
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-gray-50">
                {SHORTCUTS.map(({ keys, label }) => (
                  <tr key={keys.join('+')} className="flex items-center justify-between py-2">
                    <td className="text-gray-600">{label}</td>
                    <td className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[11px] text-gray-500"
                        >
                          {k}
                        </kbd>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptySelection() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/30 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="#9CA3AF" strokeWidth="1.4" />
          <path d="M6.5 8h7M6.5 11h5" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[13px] font-medium text-gray-600">Select an item to review</p>
      <p className="mt-1.5 text-[12px] text-gray-400">
        Use{' '}
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px] text-gray-500">
          j
        </kbd>
        {' / '}
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px] text-gray-500">
          k
        </kbd>{' '}
        to navigate
      </p>
    </div>
  );
}
