'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  BookOpen,
  Code2,
  Search,
  MessageSquare,
  Share2,
  BarChart3,
  Star,
  Pencil,
  FileQuestion,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentItem {
  id: string
  title: string
  content: string | null
  agent_type: string
  status: string
  quality_score: number | null
  created_at: string
}

interface ContentLibraryViewProps {
  items: ContentItem[]
}

// ─── Content type metadata ────────────────────────────────────────────────────

interface ContentTypeMeta {
  label: string
  icon: React.ComponentType<{ className?: string }>
  colorIcon: string
  colorBg: string
  filterKey: string
}

const CONTENT_TYPE_META: Record<string, ContentTypeMeta> = {
  blog_post:              { label: 'Blog',    icon: BookOpen,      colorIcon: 'text-violet-600',  colorBg: 'bg-violet-50',  filterKey: 'blog'   },
  article:                { label: 'Blog',    icon: BookOpen,      colorIcon: 'text-violet-600',  colorBg: 'bg-violet-50',  filterKey: 'blog'   },
  faq:                    { label: 'FAQ',     icon: MessageSquare, colorIcon: 'text-emerald-600', colorBg: 'bg-emerald-50', filterKey: 'faq'    },
  faq_agent:              { label: 'FAQ',     icon: MessageSquare, colorIcon: 'text-emerald-600', colorBg: 'bg-emerald-50', filterKey: 'faq'    },
  schema_markup:          { label: 'Schema',  icon: Code2,         colorIcon: 'text-blue-600',    colorBg: 'bg-blue-50',    filterKey: 'schema' },
  schema_recommendations: { label: 'Schema',  icon: Code2,         colorIcon: 'text-blue-600',    colorBg: 'bg-blue-50',    filterKey: 'schema' },
  llms_txt:               { label: 'LLMS.txt', icon: FileQuestion, colorIcon: 'text-amber-600',   colorBg: 'bg-amber-50',   filterKey: 'llms'   },
  social_post:            { label: 'Social',  icon: Share2,        colorIcon: 'text-pink-600',    colorBg: 'bg-pink-50',    filterKey: 'reports'},
  social_strategy:        { label: 'Social',  icon: Share2,        colorIcon: 'text-pink-600',    colorBg: 'bg-pink-50',    filterKey: 'reports'},
  competitor_report:      { label: 'Report',  icon: BarChart3,     colorIcon: 'text-orange-600',  colorBg: 'bg-orange-50',  filterKey: 'reports'},
  competitor_intelligence:{ label: 'Report',  icon: BarChart3,     colorIcon: 'text-orange-600',  colorBg: 'bg-orange-50',  filterKey: 'reports'},
  query_suggestions:      { label: 'Queries', icon: Search,        colorIcon: 'text-teal-600',    colorBg: 'bg-teal-50',    filterKey: 'reports'},
  review_analysis:        { label: 'Review',  icon: Star,          colorIcon: 'text-amber-600',   colorBg: 'bg-amber-50',   filterKey: 'reports'},
  review_response:        { label: 'Review',  icon: Star,          colorIcon: 'text-amber-600',   colorBg: 'bg-amber-50',   filterKey: 'reports'},
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'blog' | 'faq' | 'schema' | 'llms'

const FILTER_TABS: { value: FilterKey; label: string }[] = [
  { value: 'all',    label: 'All' },
  { value: 'blog',   label: 'Blog Posts' },
  { value: 'faq',    label: 'FAQs' },
  { value: 'schema', label: 'Schema' },
  { value: 'llms',   label: 'LLMS.txt' },
]

// ─── Quality dot ──────────────────────────────────────────────────────────────

function QualityDot({ score }: { score: number | null }): React.ReactElement {
  if (score === null) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" aria-hidden="true" />
        <span className="text-xs text-[#9CA3AF]">—</span>
      </span>
    )
  }

  const color =
    score >= 80
      ? { dot: 'bg-[#10B981]', text: 'text-[#10B981]', label: 'Good' }
      : score >= 50
      ? { dot: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', label: 'Fair' }
      : { dot: 'bg-[#EF4444]', text: 'text-[#EF4444]', label: 'Low' }

  return (
    <span className="flex items-center gap-1.5" title={`Quality score: ${score}`}>
      <span
        className={cn('h-2 w-2 rounded-full shrink-0', color.dot)}
        aria-hidden="true"
      />
      <span className={cn('text-xs tabular-nums font-medium', color.text)}>{score}</span>
    </span>
  )
}

// ─── Word count helper ────────────────────────────────────────────────────────

function getWordCount(content: string | null): number | null {
  if (!content) return null
  const words = content.trim().split(/\s+/).filter(Boolean)
  return words.length
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentLibraryView({ items }: ContentLibraryViewProps): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleFilterChange = useCallback((value: FilterKey) => {
    setActiveFilter(value)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const meta = CONTENT_TYPE_META[item.agent_type]
      const matchesFilter =
        activeFilter === 'all' || meta?.filterKey === activeFilter
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [items, activeFilter, searchQuery])

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Content Library
          </h1>
          <span className="text-sm text-[#6B7280] tabular-nums">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#6B7280]">
          AI-generated content created by your agents.
        </p>
      </div>

      {/* ── Filter + search bar ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div
          className="flex gap-0.5 bg-[#F3F4F6] rounded-lg p-1 w-fit flex-wrap"
          role="tablist"
          aria-label="Filter content by type"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeFilter === tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-all font-medium',
                activeFilter === tab.value
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search content..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/40 focus:border-[#3370FF]"
            aria-label="Search content by title"
          />
        </div>
      </div>

      {/* ── Table card ────────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">

        {/* Empty state — no content at all */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] mb-3">
              <FileText className="h-5 w-5 text-[#9CA3AF]" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-[#111827]">No content yet</p>
            <p className="mt-1 text-xs text-[#6B7280] max-w-xs">
              No content yet. Launch an agent to create your first piece.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty state — filter/search has no results */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] mb-3">
              <Search className="h-5 w-5 text-[#9CA3AF]" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-[#111827]">No results</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F6F7F9] border-b border-[#E5E7EB]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap w-[40%]">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                    Quality
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                    Words
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                    Created
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const meta = CONTENT_TYPE_META[item.agent_type] ?? {
                    label: item.agent_type.replace(/_/g, ' '),
                    icon: FileText,
                    colorIcon: 'text-[#9CA3AF]',
                    colorBg: 'bg-[#F3F4F6]',
                    filterKey: 'all',
                  }
                  const Icon = meta.icon
                  const wordCount = getWordCount(item.content)

                  const isPublished =
                    item.status === 'published' || item.status === 'completed'

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-b border-[#F3F4F6] transition-colors hover:bg-[#FAFAFA]',
                        index === filteredItems.length - 1 && 'border-b-0',
                      )}
                    >
                      {/* Title */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                              meta.colorBg,
                              meta.colorIcon,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <span className="text-sm font-medium text-[#111827] truncate max-w-[220px]">
                            {item.title}
                          </span>
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-[#6B7280]">{meta.label}</span>
                      </td>

                      {/* Quality */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <QualityDot score={item.quality_score} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-[#F3F4F6] text-[#6B7280]',
                          )}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Word count */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-[#6B7280] tabular-nums">
                          {wordCount !== null ? wordCount.toLocaleString() : '—'}
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-[#6B7280] tabular-nums">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </span>
                      </td>

                      {/* Edit action */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Link
                          href={`/dashboard/content/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
