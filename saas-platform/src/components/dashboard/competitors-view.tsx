'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Globe, Trash2, Users, TrendingUp, BarChart2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { StatusDot } from '@/components/ui/status-dot'
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
  /** Your current visibility score (0-100), optional */
  yourScore?: number | null
}

// ─── Competitor row for the DataTable ─────────────────────────────────────────

interface CompetitorRow extends Competitor {
  rank: number
  score: number
  isUser?: boolean
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, index])

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {/* Label */}
      <div className="w-32 shrink-0 min-w-0">
        <p className={cn('text-sm truncate', isUser ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
          {label}
        </p>
        {isUser && (
          <Badge className="mt-0.5 rounded-full bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary border-0 h-4">
            You
          </Badge>
        )}
      </div>

      {/* Bar */}
      <div className="relative flex-1 h-2.5 overflow-hidden rounded-full bg-muted/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: isUser ? '#FF3C00' : '#D1D5DB',
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

// ─── Component ────────────────────────────────────────────────────────────────

export function CompetitorsView({ competitors, businessId, yourScore = null }: CompetitorsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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
    { label: 'You', score: userScoreValue, isUser: true },
    ...competitors.map((c, i) => ({ label: c.name, score: mockScore(i), isUser: false })),
  ].sort((a, b) => b.score - a.score)
  const maxScore = Math.max(...comparisonItems.map((i) => i.score), 1)

  // ── Competitor table rows ───────────────────────────────────────────────────
  const tableRows: CompetitorRow[] = competitors.map((comp, i) => ({
    ...comp,
    rank: i + 1,
    score: mockScore(i),
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
          <span className="text-xs text-muted-foreground/40">—</span>
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
              className="h-full rounded-full"
              style={{
                width: `${row.original.score}%`,
                backgroundColor: '#D1D5DB',
              }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-foreground w-7 text-right">
            {row.original.score}
          </span>
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'source',
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5">
          <StatusDot status="completed" size="sm" />
          <span className="text-xs text-muted-foreground">Tracking</span>
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
                  'hover:bg-red-50 hover:text-destructive',
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
          value={trackedCount > 0 ? `#${yourRank}` : '—'}
          subtitle={trackedCount > 0 ? `of ${trackedCount + 1} tracked` : 'add competitors to rank'}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Average Gap"
          value={trackedCount > 0 ? (gap >= 0 ? `+${gap}` : `${gap}`) : '—'}
          subtitle={trackedCount > 0 ? 'pts vs competitors avg' : 'add competitors to compare'}
          scoreColor={gap > 0 ? '#EF4444' : gap < 0 ? '#10B981' : undefined}
          icon={<BarChart2 />}
        />
      </div>

      {/* ── Row 3: Add competitor ──────────────────────────────────────────── */}
      <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:160ms]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Add Competitor</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleAdd}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-enhanced flex-1"
                required
                aria-label="Competitor company name"
              />
              <input
                type="text"
                placeholder="domain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="input-enhanced flex-1"
                required
                aria-label="Competitor domain"
              />
              <Button
                type="submit"
                disabled={isAdding || isPending}
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 btn-primary-lift rounded-lg"
                aria-label="Add competitor"
              >
                <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {isAdding ? 'Adding…' : 'Add Competitor'}
              </Button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* ── Row 4: Visibility comparison bars ─────────────────────────────── */}
      {competitors.length > 0 && (
        <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:240ms]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Visibility Comparison</CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-muted-foreground border-border"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full mr-1 bg-[#FF3C00]"
                  aria-hidden="true"
                />
                You
                <span
                  className="inline-block h-2 w-2 rounded-full mx-1 bg-gray-300"
                  aria-hidden="true"
                />
                Competitors
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
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
          </CardContent>
        </Card>
      )}

      {/* ── Row 5: Competitor table ────────────────────────────────────────── */}
      <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:320ms]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Competitor Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {competitors.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={Users}
                title="No competitors tracked yet"
                description="Add your first competitor above to start tracking their AI visibility and see how you compare."
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
