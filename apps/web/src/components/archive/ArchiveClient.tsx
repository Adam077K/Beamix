'use client'

import { useState, useMemo } from 'react'
import { BulkExportButton } from './BulkExportButton'
import { ExportMenu } from './ExportMenu'
import { PublishToggle } from './PublishToggle'
import { VerificationChip } from './VerificationChip'
import type { VerificationStatus } from './VerificationChip'
import { Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArchiveItem {
  id: string
  actionLabel: string
  agentType?: string
  approvedAt: string
  publishedAt: string | null
  targetUrl: string | null
  verificationStatus: string
  estimatedImpact: 'high' | 'medium' | 'low'
  formats: string[]
}

interface ArchiveClientProps {
  items: ArchiveItem[]
}

type FilterTab = 'all' | 'published' | 'rejected' | 'expired'

/** Returns relative time string: "2d ago", "3h ago", "just now" */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  const diffMonth = Math.floor(diffDay / 30)
  return `${diffMonth}mo ago`
}

/** Derive display-friendly agent name from agentType string */
function formatAgentType(agentType?: string): string | null {
  if (!agentType) return null
  return agentType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const impactColors: Record<string, string> = {
  high: 'text-emerald-700 bg-emerald-50',
  medium: 'text-amber-700 bg-amber-50',
  low: 'text-gray-500 bg-gray-100',
}

const filterLabels: Record<FilterTab, string> = {
  all: 'All',
  published: 'Published',
  rejected: 'Rejected',
  expired: 'Expired',
}

export function ArchiveClient({ items }: ArchiveClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Derive counts per tab
  const counts = useMemo(() => {
    const published = items.filter((i) => i.publishedAt !== null).length
    const rejected = items.filter(
      (i) => i.verificationStatus === 'failed' || i.verificationStatus === 'unverified'
    ).length
    const expired = items.filter((i) => {
      const approved = new Date(i.approvedAt)
      const daysSince = (Date.now() - approved.getTime()) / 86_400_000
      return daysSince > 30 && i.publishedAt === null
    }).length
    return { all: items.length, published, rejected, expired }
  }, [items])

  // Filtered list
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return items
    if (activeFilter === 'published') return items.filter((i) => i.publishedAt !== null)
    if (activeFilter === 'rejected')
      return items.filter(
        (i) => i.verificationStatus === 'failed' || i.verificationStatus === 'unverified'
      )
    if (activeFilter === 'expired') {
      return items.filter((i) => {
        const approved = new Date(i.approvedAt)
        const daysSince = (Date.now() - approved.getTime()) / 86_400_000
        return daysSince > 30 && i.publishedAt === null
      })
    }
    return items
  }, [items, activeFilter])

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const tabs: FilterTab[] = ['all', 'published', 'rejected', 'expired']

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8" dir="ltr">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Archive</h1>
        <BulkExportButton selectedIds={selectedIds.length > 0 ? selectedIds : undefined} />
      </div>

      {/* Filter chips */}
      <div
        className="flex flex-wrap gap-2 mb-5"
        role="tablist"
        aria-label="Filter archive items"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeFilter === tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
              activeFilter === tab
                ? 'bg-[#3370FF] text-white border-[#3370FF]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
            )}
          >
            {filterLabels[tab]}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums',
                activeFilter === tab
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <Archive size={28} className="text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500">Nothing here yet</p>
          <p className="mt-1 text-xs text-gray-400 max-w-[280px]">
            Approved and rejected items will archive here for reference.
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Archived items">
          {filtered.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const agentLabel = formatAgentType(item.agentType)

            return (
              <li
                key={item.id}
                className={cn(
                  'group rounded-lg border bg-white transition-all duration-150',
                  isSelected
                    ? 'border-[#3370FF]/40 shadow-sm ring-1 ring-[#3370FF]/20'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                )}
              >
                {/* Main row — desktop: all in one line; mobile: stacks */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  {/* Checkbox + title block */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      aria-label={`Select "${item.actionLabel}"`}
                      className="mt-0.5 sm:mt-0 h-4 w-4 shrink-0 rounded border-gray-300 text-[#3370FF] accent-[#3370FF] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
                    />
                    <div className="min-w-0 flex-1">
                      {/* Title + chips row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm leading-snug">
                          {item.actionLabel}
                        </span>
                        {agentLabel && (
                          <span className="inline-flex items-center rounded-md bg-[#3370FF]/8 text-[#3370FF] border border-[#3370FF]/20 px-1.5 py-0.5 text-[10px] font-medium leading-none shrink-0">
                            {agentLabel}
                          </span>
                        )}
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize shrink-0',
                            impactColors[item.estimatedImpact] ?? 'text-gray-500 bg-gray-100'
                          )}
                        >
                          {item.estimatedImpact}
                        </span>
                      </div>
                      {/* Meta: URL + timestamps */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-400">
                        {item.targetUrl && (
                          <a
                            href={item.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#3370FF] transition-colors duration-150 truncate max-w-[200px]"
                          >
                            {item.targetUrl.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        <span title={new Date(item.approvedAt).toLocaleString()}>
                          {timeAgo(item.approvedAt)}
                        </span>
                        {item.publishedAt && (
                          <span
                            className="text-emerald-600"
                            title={new Date(item.publishedAt).toLocaleString()}
                          >
                            Published {timeAgo(item.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right-side actions — stacks below on mobile */}
                  <div className="flex flex-wrap items-center gap-3 ps-7 sm:ps-0 sm:shrink-0">
                    <VerificationChip status={item.verificationStatus as VerificationStatus} />
                    <PublishToggle
                      itemId={item.id}
                      isPublished={item.publishedAt !== null}
                    />
                    <ExportMenu
                      itemId={item.id}
                      markdownContent={`# ${item.actionLabel}\n\nApproved: ${item.approvedAt}\n`}
                      htmlContent={
                        item.formats.includes('html')
                          ? `<h1>${item.actionLabel}</h1>`
                          : undefined
                      }
                      jsonContent={JSON.stringify(
                        {
                          id: item.id,
                          label: item.actionLabel,
                          approvedAt: item.approvedAt,
                          publishedAt: item.publishedAt,
                          verificationStatus: item.verificationStatus,
                        },
                        null,
                        2
                      )}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
