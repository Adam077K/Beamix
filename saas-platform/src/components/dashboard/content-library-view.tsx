'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  BookOpen,
  Code2,
  Star,
  Search,
  BarChart3,
  MessageSquare,
  Share2,
  Pencil,
  Eye,
} from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// ─── Content type meta ────────────────────────────────────────────────────────

const CONTENT_TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; colorIcon: string; colorBg: string }
> = {
  blog_post:              { label: 'Blog',     icon: BookOpen,      colorIcon: 'text-[var(--color-chart-3)]',  colorBg: 'bg-[var(--color-chart-3)]/10' },
  article:                { label: 'Article',  icon: FileText,      colorIcon: 'text-primary',                 colorBg: 'bg-primary/10' },
  faq:                    { label: 'FAQ',      icon: MessageSquare, colorIcon: 'text-[var(--color-chart-2)]',  colorBg: 'bg-[var(--color-chart-2)]/10' },
  product_description:    { label: 'Product',  icon: FileText,      colorIcon: 'text-[var(--color-chart-4)]', colorBg: 'bg-[var(--color-chart-4)]/10' },
  landing_page:           { label: 'Landing',  icon: FileText,      colorIcon: 'text-[var(--color-chart-3)]', colorBg: 'bg-[var(--color-chart-3)]/10' },
  schema_markup:          { label: 'Schema',   icon: Code2,         colorIcon: 'text-primary',                colorBg: 'bg-primary/10' },
  social_post:            { label: 'Social',   icon: Share2,        colorIcon: 'text-[var(--color-chart-6)]', colorBg: 'bg-[var(--color-chart-6)]/10' },
  review_response:        { label: 'Review',   icon: Star,          colorIcon: 'text-[var(--color-chart-4)]', colorBg: 'bg-[var(--color-chart-4)]/10' },
  competitor_report:      { label: 'Report',   icon: BarChart3,     colorIcon: 'text-primary',                colorBg: 'bg-primary/10' },
  query_suggestions:      { label: 'Queries',  icon: Search,        colorIcon: 'text-[var(--color-chart-2)]', colorBg: 'bg-[var(--color-chart-2)]/10' },
  review_analysis:        { label: 'Analysis', icon: Star,          colorIcon: 'text-[var(--color-chart-4)]', colorBg: 'bg-[var(--color-chart-4)]/10' },
  social_strategy:        { label: 'Social',   icon: Share2,        colorIcon: 'text-[var(--color-chart-6)]', colorBg: 'bg-[var(--color-chart-6)]/10' },
  schema_recommendations: { label: 'Schema',   icon: Code2,         colorIcon: 'text-[var(--color-chart-3)]', colorBg: 'bg-[var(--color-chart-3)]/10' },
}

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-muted text-muted-foreground border-0' },
  ready:     { label: 'Ready',     className: 'bg-[var(--color-score-fair)]/10 text-[var(--color-score-fair)] border-0' },
  published: { label: 'Published', className: 'bg-[var(--color-score-good)]/10 text-[var(--color-score-good)] border-0' },
  completed: { label: 'Completed', className: 'bg-[var(--color-score-good)]/10 text-[var(--color-score-good)] border-0' },
  failed:    { label: 'Failed',    className: 'bg-[var(--color-score-critical)]/10 text-[var(--color-score-critical)] border-0' },
  running:   { label: 'Running',   className: 'bg-[var(--color-score-fair)]/10 text-[var(--color-score-fair)] border-0' },
  archived:  { label: 'Archived',  className: 'bg-muted text-muted-foreground border-0' },
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type ContentFilter = 'all' | 'blog' | 'faq' | 'schema' | 'social' | 'reports'

const FILTER_TABS: { value: ContentFilter; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'blog',    label: 'Blog' },
  { value: 'faq',     label: 'FAQ' },
  { value: 'schema',  label: 'Schema' },
  { value: 'social',  label: 'Social' },
  { value: 'reports', label: 'Reports' },
]

// ─── Normalised table row ─────────────────────────────────────────────────────

interface LibraryRow {
  id: string
  title: string
  agent_type: string
  status: string
  created_at: string
  is_content: boolean
  word_count?: number | null
  quality_score?: number | null
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContentLibraryViewProps {
  content: Array<{
    id: string
    agent_type: string
    title: string
    content_format: string
    word_count: number | null
    quality_score: number | null
    is_favorited: boolean
    created_at: string
  }>
  outputs: Array<{
    id: string
    agent_type: string
    status: string
    created_at: string
    completed_at: string | null
  }>
}

// ─── Type filter helper ───────────────────────────────────────────────────────

const BLOG_TYPES   = new Set(['blog_post', 'article'])
const FAQ_TYPES    = new Set(['faq'])
const SCHEMA_TYPES = new Set(['schema_markup', 'schema_recommendations'])
const SOCIAL_TYPES = new Set(['social_post', 'social_strategy'])
const REPORT_TYPES = new Set(['competitor_report', 'query_suggestions', 'review_analysis', 'review_analyzer'])

function matchesFilter(type: string, filter: ContentFilter): boolean {
  if (filter === 'all')     return true
  if (filter === 'blog')    return BLOG_TYPES.has(type)
  if (filter === 'faq')     return FAQ_TYPES.has(type)
  if (filter === 'schema')  return SCHEMA_TYPES.has(type)
  if (filter === 'social')  return SOCIAL_TYPES.has(type)
  if (filter === 'reports') return REPORT_TYPES.has(type)
  return true
}

// ─── Quality score bar ────────────────────────────────────────────────────────

function QualityBar({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  const color =
    score >= 80
      ? 'var(--color-score-good)'
      : score >= 50
        ? 'var(--color-score-fair)'
        : 'var(--color-score-critical)'
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden="true">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{score}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentLibraryView({ content, outputs }: ContentLibraryViewProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Merge content + outputs into a single normalised array
  const allRows: LibraryRow[] = [
    ...content.map((c) => ({
      id: c.id,
      title: c.title,
      agent_type: c.agent_type,
      status: c.quality_score !== null ? 'published' : 'draft',
      created_at: c.created_at,
      is_content: true,
      word_count: c.word_count,
      quality_score: c.quality_score,
    })),
    ...outputs.map((o) => ({
      id: o.id,
      title: CONTENT_TYPE_META[o.agent_type]?.label ?? o.agent_type,
      agent_type: o.agent_type,
      status: o.status,
      created_at: o.created_at,
      is_content: false,
    })),
  ]

  // ── KPI counts ──────────────────────────────────────────────────────────────
  const totalItems     = allRows.length
  const publishedCount = allRows.filter((r) => r.status === 'published' || r.status === 'completed').length
  const draftCount     = allRows.filter((r) => r.status === 'draft').length

  // ── Filtered rows ───────────────────────────────────────────────────────────
  const filteredRows = allRows.filter((row) => {
    const matchesType   = matchesFilter(row.agent_type, filter)
    const matchesSearch = !searchQuery || row.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns: ColumnDef<LibraryRow>[] = [
    // Title — icon + title text + word count subtitle
    {
      header: () => (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</span>
      ),
      accessorKey: 'title',
      cell: ({ row }) => {
        const meta = CONTENT_TYPE_META[row.original.agent_type] ?? {
          label: row.original.agent_type,
          icon: FileText,
          colorIcon: 'text-muted-foreground',
          colorBg: 'bg-muted',
        }
        const Icon = meta.icon
        return (
          <span className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                meta.colorBg,
                meta.colorIcon,
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {row.original.title}
              </span>
              {row.original.word_count != null && (
                <span className="text-xs text-muted-foreground">
                  {row.original.word_count.toLocaleString()} words
                </span>
              )}
            </span>
          </span>
        )
      },
    },

    // Type — colored dot + label
    {
      header: () => (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</span>
      ),
      accessorKey: 'agent_type',
      cell: ({ row }) => {
        const meta = CONTENT_TYPE_META[row.original.agent_type]
        if (!meta) {
          return (
            <span className="text-xs text-muted-foreground capitalize">
              {row.original.agent_type.replace(/_/g, ' ')}
            </span>
          )
        }
        // Derive solid dot color from colorBg (strip /10 opacity modifier)
        const dotColor = meta.colorBg.replace('/10', '')
        return (
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} aria-hidden="true" />
            <span className="text-xs font-medium text-foreground">{meta.label}</span>
          </div>
        )
      },
    },

    // Status
    {
      header: () => (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
      ),
      accessorKey: 'status',
      cell: ({ row }) => {
        const badge = STATUS_BADGE[row.original.status] ?? {
          label: row.original.status,
          className: 'bg-muted text-muted-foreground border-0',
        }
        return (
          <Badge className={cn('text-xs', badge.className)}>
            {badge.label}
          </Badge>
        )
      },
    },

    // Quality — mini progress bar + numeric score
    {
      header: () => (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quality</span>
      ),
      accessorKey: 'quality_score',
      cell: ({ row }) => <QualityBar score={row.original.quality_score} />,
    },

    // Created
    {
      header: () => (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</span>
      ),
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {format(new Date(row.original.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },

    // Actions
    {
      header: () => null,
      id: 'actions',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="flex items-center justify-end gap-3">
          <Link
            href={`/dashboard/content/${row.original.id}/edit`}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Edit ${row.original.title}`}
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit
          </Link>
          <Link
            href={`/dashboard/content/${row.original.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            aria-label={`View ${row.original.title}`}
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            View
          </Link>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Row 1: Page header ─────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Content Library</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          AI-generated content for your business.
        </p>
      </div>

      {/* ── Row 2: KPI strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-up [animation-delay:80ms]">
        <StatCard
          label="Total Items"
          value={totalItems}
          subtitle="content pieces generated"
          icon={<FileText />}
        />
        <StatCard
          label="Published"
          value={publishedCount}
          subtitle="ready to use"
          scoreColor="var(--color-score-good)"
          icon={<Eye />}
        />
        <StatCard
          label="Drafts"
          value={draftCount}
          subtitle="awaiting review"
          scoreColor="var(--color-score-fair)"
          icon={<Pencil />}
        />
      </div>

      {/* ── Row 3: Filter bar ──────────────────────────────────────────────── */}
      <Card className="rounded-lg shadow-[var(--shadow-card)] animate-fade-up [animation-delay:160ms]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Pill toggle buttons */}
            <div
              className="flex gap-1 bg-muted rounded-lg p-1 w-fit flex-wrap"
              role="group"
              aria-label="Filter content by type"
            >
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-colors font-medium',
                    filter === tab.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-pressed={filter === tab.value}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search input — right-aligned */}
            <div className="relative sm:ml-auto max-w-xs w-full sm:w-auto">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search content…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs"
                aria-label="Search content"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Row 4: Content table ───────────────────────────────────────────── */}
      <Card className="rounded-lg shadow-[var(--shadow-card)] animate-fade-up [animation-delay:240ms]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {filter === 'all' ? 'All Content' : `${FILTER_TABS.find((t) => t.value === filter)?.label} Content`}
            </CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredRows.length} item{filteredRows.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {totalItems === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={FileText}
                title="Your content library is empty"
                description="Content created by AI agents will appear here. Run a Content Writer or Blog Writer agent to get started."
                action={{
                  label: 'Run an Agent',
                  onClick: () => router.push('/dashboard/agents'),
                }}
              />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={Search}
                title="No results found"
                description="Try a different filter or search term."
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredRows}
              emptyMessage="No content matches this filter."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
