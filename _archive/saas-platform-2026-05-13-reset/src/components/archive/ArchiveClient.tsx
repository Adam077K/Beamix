'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { agentTypeLabel } from '@/constants/agents'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArchiveItem {
  id: string
  title: string | null
  agent_type: string | null
  status: string
  published_url: string | null
  published_at: string | null
  updated_at: string | null
  content_body: string | null
}

interface ArchiveClientProps {
  items: ArchiveItem[]
}

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'published' | 'approved'

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  published: 'Published',
  approved: 'Approved',
}

function getItemFilters(item: ArchiveItem): FilterKey[] {
  const filters: FilterKey[] = ['all']
  if (item.status === 'published') filters.push('published')
  if (item.status === 'approved') filters.push('approved')
  return filters
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

// ─── Agent label ──────────────────────────────────────────────────────────────

function agentBadge(agentType: string | null): string {
  if (!agentType) return 'Agent'
  return agentTypeLabel(agentType)
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === 'published'
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
        isPublished
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-amber-50 text-amber-700',
      )}
    >
      {isPublished ? 'Published' : 'Approved'}
    </span>
  )
}

// ─── Export button ────────────────────────────────────────────────────────────

function ExportDropdown({ selectedIds, label }: { selectedIds: string[]; label: string }) {
  const [loading, setLoading] = React.useState<'csv' | 'json' | null>(null)

  async function handleExport(format: 'csv' | 'json') {
    setLoading(format)
    try {
      const params = new URLSearchParams({ format })
      if (selectedIds.length > 0) params.set('ids', selectedIds.join(','))
      const res = await fetch(`/api/archive/export?${params.toString()}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beamix-archive-${new Date().toISOString().slice(0, 10)}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="bg-[#3370FF] hover:bg-[#2558e0] text-white active:scale-[0.98] transition-transform"
          disabled={loading !== null}
          aria-label={`Export ${label}`}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Download size={13} />
          )}
          {label}
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="gap-2 text-sm cursor-pointer"
          onSelect={() => handleExport('csv')}
          disabled={loading !== null}
        >
          <Download size={12} className="text-gray-400" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm cursor-pointer"
          onSelect={() => handleExport('json')}
          disabled={loading !== null}
        >
          <Download size={12} className="text-gray-400" />
          Download JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Archive row ──────────────────────────────────────────────────────────────

interface ArchiveRowProps {
  item: ArchiveItem
  isSelected: boolean
  onToggleSelect: (id: string) => void
  index: number
}

function ArchiveRow({ item, isSelected, onToggleSelect, index }: ArchiveRowProps) {
  const router = useRouter()
  const [publishing, setPublishing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const displayTitle = item.title ?? '(Untitled)'
  const badge = agentBadge(item.agent_type)
  const dateStr = item.updated_at ? formatDate(item.updated_at) : ''

  async function handleMarkPublished() {
    const url = window.prompt('Published URL?')
    if (!url) return
    setPublishing(true)
    try {
      const res = await fetch(`/api/archive/${item.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedUrl: url }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setPublishing(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(item.content_body ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative flex items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm',
        'transition-colors duration-100',
        isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/70',
        isSelected &&
          'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#3370FF] before:rounded-r',
      )}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(item.id)}
        aria-label={`Select "${displayTitle}"`}
        className={cn(
          'size-3.5 shrink-0 rounded border-gray-300 accent-[#3370FF]',
          'transition-opacity duration-150',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />

      {/* Title + agent badge */}
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <span className="truncate font-medium text-gray-900">{displayTitle}</span>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {badge}
        </span>
      </div>

      {/* Status badge */}
      <StatusBadge status={item.status} />

      {/* Published URL link */}
      {item.published_url && (
        <a
          href={item.published_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 sm:flex items-center gap-1 text-xs text-[#3370FF] hover:underline"
          aria-label="Open published URL"
        >
          <ExternalLink size={11} />
          View live
        </a>
      )}

      {/* Date */}
      <span className="hidden shrink-0 text-xs text-gray-400 sm:block">{dateStr}</span>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={cn(
          'shrink-0 flex size-6 items-center justify-center rounded transition-all duration-100',
          'text-gray-400 hover:bg-gray-200 hover:text-gray-700',
          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]',
        )}
        aria-label={copied ? 'Copied!' : 'Copy content'}
        title={copied ? 'Copied!' : 'Copy content'}
      >
        <Copy size={13} className={copied ? 'text-emerald-500' : undefined} />
      </button>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'shrink-0 flex size-6 items-center justify-center rounded transition-all duration-100',
              'text-gray-400 hover:bg-gray-200 hover:text-gray-700',
              'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]',
            )}
            aria-label={`Actions for "${displayTitle}"`}
          >
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {item.status === 'approved' && (
            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer"
              onSelect={handleMarkPublished}
              disabled={publishing}
            >
              {publishing ? (
                <Loader2 size={12} className="text-gray-400 animate-spin" />
              ) : (
                <ExternalLink size={12} className="text-gray-400" />
              )}
              Mark as published
            </DropdownMenuItem>
          )}
          {item.published_url && (
            <DropdownMenuItem asChild>
              <a
                href={item.published_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink size={12} className="text-gray-400" />
                Open URL
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="gap-2 text-sm cursor-pointer"
            onSelect={handleCopy}
          >
            <Copy size={12} className="text-gray-400" />
            Copy content
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.li>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ArchiveClient({ items }: ArchiveClientProps) {
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const counts = React.useMemo<Record<FilterKey, number>>(() => {
    const result: Record<FilterKey, number> = { all: 0, published: 0, approved: 0 }
    for (const item of items) {
      for (const key of getItemFilters(item)) {
        result[key] = (result[key] ?? 0) + 1
      }
    }
    return result
  }, [items])

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter((item) => getItemFilters(item).includes(activeFilter))
  }, [items, activeFilter])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)))
    }
  }

  const someSelected = selectedIds.size > 0
  const allSelected = selectedIds.size === filteredItems.length && filteredItems.length > 0
  const filterKeys = Object.keys(FILTER_LABELS) as FilterKey[]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Archive</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {items.length > 0
              ? `${items.length} approved item${items.length !== 1 ? 's' : ''}`
              : 'Approved content lives here after review'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {someSelected ? (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <ExportDropdown
                selectedIds={Array.from(selectedIds)}
                label={`Export ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''}`}
              />
            </motion.div>
          ) : (
            <motion.div
              key="all"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <ExportDropdown selectedIds={[]} label="Export all" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter chips */}
      {items.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter archived items">
          {filterKeys.map((key) => {
            const isActive = activeFilter === key
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveFilter(key)
                  setSelectedIds(new Set())
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800',
                )}
              >
                {FILTER_LABELS[key]}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none',
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {counts[key] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state — no items at all */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <Archive size={20} className="text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-gray-900">Nothing archived yet</p>
          <p className="mt-1 max-w-xs text-xs text-gray-500">
            Content you approve in Inbox moves here. Mark it published once it&apos;s live.
          </p>
          <Button
            asChild
            className="mt-6 bg-[#3370FF] hover:bg-[#2558e0] active:scale-[0.98] transition-transform"
            size="sm"
          >
            <Link href="/inbox">Go to Inbox</Link>
          </Button>
        </div>
      )}

      {/* Empty state — filter has no results */}
      {items.length > 0 && filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
          role="status"
        >
          <p className="text-sm font-medium text-gray-500">
            No {FILTER_LABELS[activeFilter].toLowerCase()} items
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-2 text-xs text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
          >
            View all
          </button>
        </motion.div>
      )}

      {/* List */}
      {filteredItems.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {/* List header row */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50/60 px-4 py-2">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected
              }}
              onChange={toggleSelectAll}
              aria-label="Select all visible items"
              className="size-3.5 shrink-0 rounded border-gray-300 accent-[#3370FF]"
            />
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Item
            </span>
            <span className="ml-auto hidden text-[11px] font-medium uppercase tracking-wider text-gray-400 sm:block">
              Updated
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.ul
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              role="list"
              aria-label="Archived items"
            >
              {filteredItems.map((item, index) => (
                <ArchiveRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                  index={index}
                />
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
