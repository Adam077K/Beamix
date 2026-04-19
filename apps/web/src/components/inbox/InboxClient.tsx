'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { InboxItem } from '@/lib/types/shared';
import FilterRail, { type FilterKey } from './FilterRail';
import ItemList from './ItemList';
import PreviewPane from './PreviewPane';
import { ArrowLeft, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InboxClientProps {
  items: InboxItem[];
}

type StatusFilter = FilterKey;
type MobileView = 'list' | 'preview';

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

// ──────────────────────────────────────────────
// Keyboard shortcuts help overlay
// ──────────────────────────────────────────────

const SHORTCUTS = [
  { keys: ['j'], label: 'Next item' },
  { keys: ['k'], label: 'Previous item' },
  { keys: ['e'], label: 'Approve' },
  { keys: ['x'], label: 'Reject' },
  { keys: ['/'], label: 'Focus search' },
  { keys: ['?'], label: 'Toggle this overlay' },
  { keys: ['Esc'], label: 'Close overlay / deselect' },
];

function KeyboardOverlay({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-72 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Keyboard shortcuts</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] rounded"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[11px] text-gray-500"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Keyboard hint bar
// ──────────────────────────────────────────────

function KbdHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[10px] text-gray-500"
        >
          {k}
        </kbd>
      ))}
      <span>{label}</span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Empty selection placeholder
// ──────────────────────────────────────────────

function EmptySelection() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/30 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="16" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M7 9h8M7 12h5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600">Select an item to review</p>
      <p className="mt-1.5 text-xs text-gray-400">
        Use{' '}
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">j</kbd>{' '}
        /{' '}
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">k</kbd>{' '}
        to navigate — press{' '}
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">?</kbd>{' '}
        for all shortcuts
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export default function InboxClient({ items }: InboxClientProps) {
  const [filter, setFilter] = useState<StatusFilter>('awaiting_review');
  const [selectedId, setSelectedId] = useState<string | null>(
    items.find((i) => i.status === 'awaiting_review')?.id ?? items[0]?.id ?? null,
  );
  const [showKeyboardOverlay, setShowKeyboardOverlay] = useState(false);
  // Mobile: which pane is visible
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.status === filter);

  const selectedItem = filteredItems.find((i) => i.id === selectedId) ?? null;
  const counts = computeCounts(items);

  // Reset selection when filter changes
  useEffect(() => {
    const first = filteredItems[0];
    setSelectedId(first?.id ?? null);
    setMobileView('list');
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
    const prev = idx > 0 ? filteredItems[idx - 1] : filteredItems[filteredItems.length - 1];
    setSelectedId(prev.id);
  }, [filteredItems, selectedId]);

  const handleApprove = useCallback(() => {
    if (!selectedId) return;
    // TODO: wire to server action
    console.log('[inbox] approve', selectedId);
  }, [selectedId]);

  const handleReject = useCallback(() => {
    if (!selectedId) return;
    // TODO: wire to server action
    console.log('[inbox] reject', selectedId);
  }, [selectedId]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      // ? always toggles overlay regardless of focus
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardOverlay((v) => !v);
        return;
      }

      // Close overlay on Escape
      if (e.key === 'Escape' && showKeyboardOverlay) {
        e.preventDefault();
        setShowKeyboardOverlay(false);
        return;
      }

      if (isEditable) return;

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
          handleApprove();
          break;
        case 'x':
          e.preventDefault();
          handleReject();
          break;
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleApprove, handleReject, showKeyboardOverlay]);

  // Mobile row tap handler
  const handleMobileSelect = (id: string) => {
    setSelectedId(id);
    setMobileView('preview');
  };

  return (
    <>
      {/* Keyboard shortcuts overlay */}
      {showKeyboardOverlay && (
        <KeyboardOverlay onClose={() => setShowKeyboardOverlay(false)} />
      )}

      {/* ── Desktop layout (sm+) ── */}
      <div className="hidden min-h-[100dvh] w-full flex-col bg-white sm:flex">
        {/* Hint bar */}
        <div className="flex shrink-0 items-center justify-end gap-4 border-b border-gray-100 bg-white px-6 py-1.5">
          <KbdHint keys={['j', 'k']} label="navigate" />
          <KbdHint keys={['e']} label="approve" />
          <KbdHint keys={['x']} label="reject" />
          <KbdHint keys={['/']} label="search" />
          <button
            type="button"
            onClick={() => setShowKeyboardOverlay(true)}
            className="flex items-center gap-1 rounded text-xs text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] transition-colors"
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard size={12} aria-hidden="true" />
            <kbd className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[10px] text-gray-500">?</kbd>
          </button>
        </div>

        {/* 3-pane */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <FilterRail
            counts={counts}
            active={filter}
            onChange={(f) => setFilter(f as StatusFilter)}
          />

          <ItemList
            items={filteredItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activeFilter={filter}
          />

          <main
            className="flex min-w-0 flex-1 flex-col overflow-hidden"
            aria-label="Item preview"
          >
            {selectedItem ? (
              <PreviewPane
                item={selectedItem}
                onApprove={(id) => console.log('[inbox] approve', id)}
                onReject={(id) => console.log('[inbox] reject', id)}
                onArchive={(id) => console.log('[inbox] archive', id)}
              />
            ) : (
              <EmptySelection />
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile layout (<sm) ── */}
      <div className="flex min-h-[100dvh] w-full flex-col bg-white sm:hidden">
        {mobileView === 'list' ? (
          <>
            {/* Mobile chip filter bar */}
            <FilterRail
              counts={counts}
              active={filter}
              onChange={(f) => setFilter(f as StatusFilter)}
              chipMode
            />
            {/* Item list — tapping navigates to preview */}
            <div className="flex-1 overflow-y-auto">
              <ItemList
                items={filteredItems}
                selectedId={selectedId}
                onSelect={handleMobileSelect}
                activeFilter={filter}
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile preview — full screen with back button */}
            <div
              className={cn(
                'flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3',
              )}
            >
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] active:scale-[0.98] transition-all"
                aria-label="Back to inbox list"
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <span className="truncate text-sm font-medium text-gray-900">
                {selectedItem?.title ?? 'Preview'}
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {selectedItem ? (
                <PreviewPane
                  item={selectedItem}
                  onApprove={(id) => {
                    console.log('[inbox] approve', id);
                    setMobileView('list');
                  }}
                  onReject={(id) => {
                    console.log('[inbox] reject', id);
                    setMobileView('list');
                  }}
                  onArchive={(id) => {
                    console.log('[inbox] archive', id);
                    setMobileView('list');
                  }}
                />
              ) : (
                <EmptySelection />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
