'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { InboxItem } from '@/lib/types/shared';
import FilterRail, { type FilterKey } from './FilterRail';
import ItemList from './ItemList';
import PreviewPane from './PreviewPane';
import { Button } from '@/components/ui/button';

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

export default function InboxClient({ items }: InboxClientProps) {
  const t = useTranslations('inbox');
  const [filter, setFilter] = useState<StatusFilter>('awaiting_review');
  const [selectedId, setSelectedId] = useState<string | null>(
    items.find((i) => i.status === 'awaiting_review')?.id ?? items[0]?.id ?? null,
  );

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.status === filter);

  const selectedItem = filteredItems.find((i) => i.id === selectedId) ?? null;

  const counts = computeCounts(items);

  // Reset selection when filter changes
  useEffect(() => {
    const first = filteredItems[0];
    setSelectedId(first?.id ?? null);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is inside an input/textarea/contenteditable
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
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
        case 'a':
          e.preventDefault();
          if (selectedId) console.log('[inbox] keyboard approve', selectedId);
          break;
        case 'r':
          e.preventDefault();
          if (selectedId) console.log('[inbox] keyboard reject', selectedId);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, selectedId]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Inbox size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">{t('emptyTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {t('emptyBody')}
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/home">{t('viewSuggestions')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white">
      {/* Keyboard hint bar */}
      <div className="hidden shrink-0 items-center justify-end gap-4 border-b border-gray-100 bg-white px-6 py-1.5 sm:flex">
        <KbdHint keys={['j', 'k']} label={t('navigate')} />
        <KbdHint keys={['a']} label={t('approve')} />
        <KbdHint keys={['r']} label={t('reject')} />
      </div>

      {/* 3-pane layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <FilterRail counts={counts} active={filter} onChange={(f) => setFilter(f as StatusFilter)} />

        <ItemList
          items={filteredItems}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
  );
}

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

function EmptySelection() {
  const t = useTranslations('inbox');
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50/40 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="4"
            width="16"
            height="14"
            rx="2"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          />
          <path
            d="M7 9h8M7 12h5"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600">{t('selectItem')}</p>
      <p className="mt-1 text-xs text-gray-400">
        Use <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">j</kbd>{' '}
        /{' '}
        <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">k</kbd>{' '}
        {t('navigate')}
      </p>
    </div>
  );
}
