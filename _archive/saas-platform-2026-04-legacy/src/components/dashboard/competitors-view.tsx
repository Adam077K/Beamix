'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Globe, Trash2, Users, TrendingUp, BarChart2, Plus, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competitor {
  id: string
  name: string
  domain: string | null
  source: string | null
  created_at: string
  business_id: string
}

interface CompetitorsViewProps {
  competitors: Competitor[]
  businessId: string | null
  businessName?: string | null
  /** Your current visibility score (0-100), optional */
  yourScore?: number | null
}

// ─── Competitor row for the DataTable ─────────────────────────────────────────

interface CompetitorRow extends Competitor {
  rank: number
  score: number
  gap: number
  isUser?: boolean
}

// ─── Industry benchmark ───────────────────────────────────────────────────────

const INDUSTRY_BENCHMARK = 45

// ─── Mock scores per competitor (deterministic based on index) ────────────────

function mockScore(index: number): number {
  const base = [72, 61, 55, 44, 38, 30, 25]
  return base[index % base.length] ?? 40
}

// ─── Animated horizontal bar ─────────────────────────────────────────────────

interface VisBarProps {
  label: string
  score: number
  maxScore: number
  isUser: boolean
  index: number
}

function VisBar({ label, score, maxScore, isUser, index }: VisBarProps) {
  const [width, setWidth] = useState(0)
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), index * 80 + 200)
    return () => clearTimeout(t)
  }, [pct, index])

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {/* Label */}
      <div className="w-32 shrink-0 min-w-0">
        <p className={cn('text-sm truncate', isUser ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
          {label}
        </p>
        {isUser && (
          <Badge className="mt-0.5 rounded-full bg-primary/10 px-1.5 py-0 text-xs font-semibold text-primary border-0 h-4">
            You
          </Badge>
        )}
      </div>

      {/* Bar */}
      <div className="relative flex-1 h-2.5 overflow-hidden rounded-full bg-muted/60">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
            isUser ? 'bg-primary' : 'bg-muted-foreground/30',
          )}
          style={{
            width: `${width}%`,
            transitionDelay: `${index * 60}ms`,
          }}
        />
      </div>

      {/* Score */}
      <span
        className={cn(
          'w-8 shrink-0 text-right text-sm tabular-nums',
          isUser ? 'font-bold text-foreground' : 'text-muted-foreground',
        )}
      >
        {score}
      </span>
    </div>
  )
}

// ─── Gap badge ────────────────────────────────────────────────────────────────

function GapBadge({ gap }: { gap: number }) {
  if (gap === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
        <Minus className="h-3 w-3" aria-hidden="true" />
        0
      </span>
    )
  }
  if (gap > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--color-score-critical)] tabular-nums">
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
        +{gap}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--color-score-good)] tabular-nums">
      <TrendingDown className="h-3 w-3" aria-hidden="true" />
      {gap}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompetitorsView({ competitors, businessId, businessName, yourScore = null }: CompetitorsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // ── KPI calculations ────────────────────────────────────────────────────────
  const trackedCount = competitors.length
  const competitorScores = competitors.map((_, i) => mockScore(i))
  const userScoreValue = yourScore ?? 0
  const competitorsAbove = competitorScores.filter((s) => s > userScoreValue).length
  const yourRank = competitorsAbove + 1
  const avgCompetitorScore =
    competitorScores.length > 0
      ? Math.round(competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length)
      : 0
  const gap = avgCompetitorScore - userScoreValue

  // ── Comparison data (you + competitors) ────────────────────────────────────
  const comparisonItems = [
    { label: businessName ?? 'You', score: userScoreValue, isUser: true },
    ...competitors.map((c, i) => ({ label: c.name, score: mockScore(i), isUser: false })),
  ].sort((a, b) => b.score - a.score)
  const maxScore = Math.max(...comparisonItems.map((i) => i.score), INDUSTRY_BENCHMARK, 1)

  // ── Competitor table rows ───────────────────────────────────────────────────
  const tableRows: CompetitorRow[] = competitors.map((comp, i) => ({
    ...comp,
    rank: i + 1,
    score: mockScore(i),
    gap: mockScore(i) - userScoreValue,
  }))

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !domain.trim()) return
    if (!businessId) {
      setError('No business found. Complete onboarding first.')
      return
    }
    setIsAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), domain: domain.trim(), business_id: businessId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to add competitor')
        return
      }
      setName('')
      setDomain('')
      startTransition(() => router.refresh())
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/competitors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        startTransition(() => router.refresh())
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setDeletingId(null)
    }
  }

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns: ColumnDef<CompetitorRow>[] = [
    {
      header: '#',
      accessorKey: 'rank',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {row.original.rank}
        </span>
      ),
    },
    {
      header: 'Business',
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
            {row.original.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-medium text-foreground">{row.original.name}</span>
        </span>
      ),
    },
    {
      header: 'Domain',
      accessorKey: 'domain',
      cell: ({ row }) =>
        row.original.domain ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
            {row.original.domain}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">\u2014</span>
        ),
    },
    {
      header: 'Score',
      accessorKey: 'score',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="flex items-center justify-end gap-2">
          <div className="w-14 h-1.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-muted-foreground/40"
              style={{ width: `${row.original.score}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-foreground w-7 text-right">
            {row.original.score}
          </span>
        </span>
      ),
    },
    {
      header: 'Gap',
      accessorKey: 'gap',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="flex justify-end">
          <GapBadge gap={row.original.gap} />
        </span>
      ),
    },
    {
      header: 'Added',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      meta: { align: 'right' },
      cell: ({ row }) => {
        const id = row.original.id
        const isConfirming = confirmDeleteId === id
        return (
          <span className="flex items-center justify-end gap-2">
            {isConfirming ? (
              <>
                <button
                  onClick={() => handleDelete(id)}
                  disabled={deletingId === id || isPending}
                  className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                  aria-label={`Confirm remove ${row.original.name}`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(id)}
                disabled={deletingId === id || isPending}
                className={cn(
                  'rounded-lg p-1.5 text-muted-foreground transition-colors duration-150',
                  'hover:bg-destructive/10 hover:text-destructive',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:pointer-events-none',
                )}
                aria-label={`Remove ${row.original.name}`}
                title={`Remove ${row.original.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Row 1: Page header ─────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Competitor Intelligence</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track and compare your visibility against competitors.
        </p>
      </div>

      {/* ── Row 2: KPI strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-up [animation-delay:80ms]">
        <StatCard
          label="Tracked Competitors"
          value={trackedCount}
          subtitle="actively monitored"
          icon={<Users />}
        />
        <StatCard
          label="Your Rank"
          value={trackedCount > 0 ? `#${yourRank}` : '\u2014'}
          subtitle={trackedCount > 0 ? `of ${trackedCount + 1} tracked` : 'add competitors to rank'}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Average Gap"
          value={trackedCount > 0 ? (gap >= 0 ? `+${gap}` : `${gap}`) : '\u2014'}
          subtitle={trackedCount > 0 ? 'pts vs competitors avg' : 'add competitors to compare'}
          scoreColor={gap > 0 ? 'var(--color-score-critical)' : gap < 0 ? 'var(--color-score-good)' : undefined}
          icon={<BarChart2 />}
        />
      </div>

      {/* ── Row 3: Add competitor ──────────────────────────────────────────── */}
      <Card className="rounded-xl border border-border shadow-[var(--shadow-card)] animate-fade-up [animation-delay:160ms] overflow-hidden">
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1 block" htmlFor="competitor-name">
                Business Name
              </label>
              <Input
                id="competitor-name"
                ref={nameInputRef}
                type="text"
                placeholder="Competitor name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
                required
                aria-label="Competitor business name"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1 block" htmlFor="competitor-domain">
                Domain
              </label>
              <Input
                id="competitor-domain"
                type="text"
                placeholder="competitor.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="h-9"
                required
                aria-label="Competitor domain"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || !domain.trim() || isAdding || isPending}
              className="h-9 px-4 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
              aria-label="Add competitor"
            >
              <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              {isAdding ? 'Adding\u2026' : 'Add'}
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            We&apos;ll track their AI search visibility alongside yours.
          </p>
        </CardContent>
      </Card>

      {/* ── Row 4: Visibility comparison bars ─────────────────────────────── */}
      {competitors.length > 0 && (
        <Card className="rounded-xl border border-border shadow-[var(--shadow-card)] animate-fade-up [animation-delay:240ms]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Visibility Comparison</CardTitle>
              <Badge
                variant="outline"
                className="text-xs font-medium text-muted-foreground border-border"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full mr-1 bg-primary"
                  aria-hidden="true"
                />
                You
                <span
                  className="inline-block h-2 w-2 rounded-full mx-1 bg-muted-foreground/30"
                  aria-hidden="true"
                />
                Competitors
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Industry average benchmark line */}
            <div className="flex items-center gap-3 px-1 pt-1 pb-2 mb-1">
              <span className="text-xs text-muted-foreground w-32 shrink-0">Industry avg</span>
              <div className="flex-1 relative h-6">
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-muted-foreground/40"
                  style={{ left: `${(INDUSTRY_BENCHMARK / maxScore) * 100}%` }}
                  aria-hidden="true"
                />
                <span
                  className="absolute text-xs text-muted-foreground/70 tabular-nums whitespace-nowrap"
                  style={{
                    left: `${(INDUSTRY_BENCHMARK / maxScore) * 100}%`,
                    transform: 'translateX(-50%)',
                    top: '0px',
                  }}
                  aria-label={`Industry average: ${INDUSTRY_BENCHMARK}`}
                >
                  {INDUSTRY_BENCHMARK}
                </span>
              </div>
            </div>
            <div className="divide-y divide-border/20">
              {comparisonItems.map((item, i) => (
                <VisBar
                  key={item.label + i}
                  label={item.label}
                  score={item.score}
                  maxScore={maxScore}
                  isUser={item.isUser}
                  index={i}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40">
              Scores are estimated until a full scan is completed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Row 5: Competitor table ────────────────────────────────────────── */}
      <Card className="rounded-xl border border-border shadow-[var(--shadow-card)] animate-fade-up [animation-delay:320ms]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">Competitor Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {competitors.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={Users}
                title="Track your competitors"
                description="Add competitors to see how your AI visibility compares. We recommend tracking 3\u20135 key competitors."
                action={{
                  label: 'Add your first competitor',
                  onClick: () => nameInputRef.current?.focus(),
                }}
                variant="inline"
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={tableRows}
              emptyMessage="No competitors to display."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
