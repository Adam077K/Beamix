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
  blog_post:              { label: 'Blog',     icon: BookOpen,      colorIcon: 'text-violet-600',  colorBg: 'bg-violet-50',  filterKey: 'blog'    },
  article:                { label: 'Blog',     icon: BookOpen,      colorIcon: 'text-violet-600',  colorBg: 'bg-violet-50',  filterKey: 'blog'    },
  faq:                    { label: 'FAQ',      icon: MessageSquare, colorIcon: 'text-emerald-600', colorBg: 'bg-emerald-50', filterKey: 'faq'     },
  faq_agent:              { label: 'FAQ',      icon: MessageSquare, colorIcon: 'text-emerald-600', colorBg: 'bg-emerald-50', filterKey: 'faq'     },
  schema_markup:          { label: 'Schema',   icon: Code2,         colorIcon: 'text-blue-600',    colorBg: 'bg-blue-50',    filterKey: 'schema'  },
  schema_recommendations: { label: 'Schema',   icon: Code2,         colorIcon: 'text-blue-600',    colorBg: 'bg-blue-50',    filterKey: 'schema'  },
  llms_txt:               { label: 'LLMS.txt', icon: FileQuestion,  colorIcon: 'text-amber-600',   colorBg: 'bg-amber-50',   filterKey: 'llms'    },
  social_post:            { label: 'Social',   icon: Share2,        colorIcon: 'text-pink-600',    colorBg: 'bg-pink-50',    filterKey: 'reports' },
  social_strategy:        { label: 'Social',   icon: Share2,        colorIcon: 'text-pink-600',    colorBg: 'bg-pink-50',    filterKey: 'reports' },
  competitor_report:      { label: 'Report',   icon: BarChart3,     colorIcon: 'text-orange-600',  colorBg: 'bg-orange-50',  filterKey: 'reports' },
  competitor_intelligence:{ label: 'Report',   icon: BarChart3,     colorIcon: 'text-orange-600',  colorBg: 'bg-orange-50',  filterKey: 'reports' },
  query_suggestions:      { label: 'Queries',  icon: Search,        colorIcon: 'text-teal-600',    colorBg: 'bg-teal-50',    filterKey: 'reports' },
  review_analysis:        { label: 'Review',   icon: Star,          colorIcon: 'text-amber-600',   colorBg: 'bg-amber-50',   filterKey: 'reports' },
  review_response:        { label: 'Review',   icon: Star,          colorIcon: 'text-amber-600',   colorBg: 'bg-amber-50',   filterKey: 'reports' },
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

// ─── Quality badge ────────────────────────────────────────────────────────────

function QualityBadge({ score }: { score: number | null }): React.ReactElement {
  if (score === null) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-[4px] h-[4px] rounded-full bg-[#D1D5DB] shrink-0" aria-hidden="true" />
        <span className="text-[12px] text-[#9CA3AF] tabular-nums">—</span>
      </div>
    )
  }

  const config =
    score >= 80
      ? { dot: 'bg-[#10B981]', text: 'text-[#6B7280]', label: 'Good' }
      : score >= 50
      ? { dot: 'bg-[#F59E0B]', text: 'text-[#6B7280]', label: 'Fair' }
      : { dot: 'bg-[#EF4444]', text: 'text-[#6B7280]', label: 'Low' }

  return (
    <div
      className="flex items-center gap-1.5"
      title={`Quality score: ${score}`}
    >
      <span className={cn('w-[4px] h-[4px] rounded-full shrink-0', config.dot)} aria-hidden="true" />
      <span className={cn('text-[12px] tabular-nums', config.text)}>{score}</span>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }): React.ReactElement {
  const isPublished = status === 'published' || status === 'completed'

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'w-[4px] h-[4px] rounded-full shrink-0',
          isPublished ? 'bg-[#10B981]' : 'bg-[#9CA3AF]',
        )}
        aria-hidden="true"
      />
      <span className="text-[12px] text-[#6B7280]">
        {isPublished ? 'Published' : 'Draft'}
      </span>
    </div>
  )
}

// ─── Word count helper ────────────────────────────────────────────────────────

function getWordCount(content: string | null): number | null {
  if (!content) return null
  const words = content.trim().split(/\s+/).filter(Boolean)
  return words.length
}

// ─── Main component ───────────────────────────────────────────────────────────

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
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#111827]">
            Content Library
          </h1>
          <span className="text-[13px] text-[#9CA3AF] tabular-nums">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-[13px] text-[#6B7280]">
          AI-generated content created by your agents.
        </p>
      </div>

      {/* ── Toolbar: filters + search ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Filter tabs */}
        <div
          className="flex items-center gap-1"
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
                'h-8 px-3 text-[12px] font-medium rounded-[6px] transition-colors whitespace-nowrap',
                activeFilter === tab.value
                  ? 'bg-[#111827] text-white'
                  : 'text-[#6B7280] hover:bg-[#F6F7F9] hover:text-[#111827]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#9CA3AF]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search content..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-9 w-64 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/10 focus:border-[#3370FF]"
            aria-label="Search content by title"
          />
        </div>
      </div>

      {/* ── Table card ────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">

        {/* Empty state — no content at all */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#F6F7F9] border border-[#E5E7EB] mb-4">
              <FileText className="h-5 w-5 text-[#9CA3AF]" aria-hidden="true" />
            </div>
            <p className="text-[14px] font-semibold text-[#111827]">No content yet</p>
            <p className="mt-1.5 text-[12px] text-[#6B7280] max-w-xs leading-relaxed">
              Launch an agent from the Agents Hub to generate your first piece of content.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty state — filter/search has no results */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#F6F7F9] border border-[#E5E7EB] mb-4">
              <Search className="h-5 w-5 text-[#9CA3AF]" aria-hidden="true" />
            </div>
            <p className="text-[14px] font-semibold text-[#111827]">No results found</p>
            <p className="mt-1.5 text-[12px] text-[#6B7280]">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F6F7F9] border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider w-[40%]">
                    Title
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                    Quality
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                    Words
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                    Created
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredItems.map((item) => {
                  const meta = CONTENT_TYPE_META[item.agent_type] ?? {
                    label: item.agent_type.replace(/_/g, ' '),
                    icon: FileText,
                    colorIcon: 'text-[#9CA3AF]',
                    colorBg: 'bg-[#F6F7F9]',
                    filterKey: 'all',
                  }
                  const Icon = meta.icon
                  const wordCount = getWordCount(item.content)

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F1F4F7] transition-colors"
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]',
                              meta.colorBg,
                              meta.colorIcon,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-medium text-[#111827] truncate max-w-[260px]">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-[#6B7280]">{meta.label}</span>
                      </td>

                      {/* Quality */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QualityBadge score={item.quality_score} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Word count */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-[#6B7280] tabular-nums">
                          {wordCount !== null ? wordCount.toLocaleString() : '—'}
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-[#6B7280] tabular-nums">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </span>
                      </td>

                      {/* Edit action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/dashboard/content/${item.id}`}
                          className="inline-flex items-center gap-1.5 h-7 px-3 text-[12px] font-medium text-[#6B7280] border border-[#E5E7EB] rounded-[6px] hover:bg-[#F6F7F9] hover:text-[#111827] transition-colors"
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
