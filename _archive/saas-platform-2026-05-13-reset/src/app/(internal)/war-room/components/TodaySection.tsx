'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuditLogSummary, AuditLogRow } from '../lib/queries'

// Status emoji mapping per ORCHESTRATION.md §2G spec
function statusGlyph(status: string): { glyph: string; className: string; label: string } {
  switch (status) {
    case 'complete':
      // F9: Good color with dark-mode variant
      return { glyph: '✓', className: 'text-[#10B981] dark:text-[#34D399]', label: 'Complete' }
    case 'blocked':
    case 'timeout':
    case 'rule_violation':
    case 'over_budget':
      // F9: Critical color with dark-mode variant
      return { glyph: '✗', className: 'text-[#EF4444] dark:text-[#F87171]', label: status }
    case 'anomaly':
      // F9: Fair color with dark-mode variant
      return { glyph: '!', className: 'text-[#F59E0B] dark:text-[#FBBF24]', label: 'Anomaly' }
    case 'running':
    case 'accepted':
    case 'fired':
      // F9: Primary blue with dark-mode variant
      return { glyph: '…', className: 'text-[#3370FF] dark:text-[#5A8FFF]', label: 'In progress' }
    default:
      return { glyph: '·', className: 'text-muted-foreground', label: status }
  }
}

function formatTime(tsIso: string): string {
  return new Date(tsIso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatCost(cost: number | null): string {
  if (cost === null || cost === 0) return '—'
  return `$${cost.toFixed(2)}`
}

function formatRuntime(secs: number | null): string {
  if (!secs) return '—'
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m`
}

function AuditRow({ row }: { row: AuditLogRow }) {
  const { glyph, className, label } = statusGlyph(row.status)

  return (
    // F8: Replaced style={{ gridTemplateColumns: '16px 48px 120px 100px 1fr auto auto' }} with Tailwind arbitrary value.
    <div
      className="grid [grid-template-columns:16px_48px_120px_100px_1fr_auto_auto] items-center gap-x-5 py-1.5 font-mono text-xs hover:bg-muted/30 transition-colors rounded-sm px-3"
      role="row"
      aria-label={`${row.agent} ${label}`}
    >
      {/* status glyph */}
      <span
        className={`${className} font-semibold tabular-nums`}
        aria-label={label}
        title={row.status}
      >
        {glyph}
      </span>

      {/* time */}
      <span className="text-muted-foreground/70 tabular-nums">{formatTime(row.ts)}</span>

      {/* agent */}
      <span className="truncate font-medium text-foreground/90">{row.agent}</span>

      {/* ticket */}
      <span className="truncate text-muted-foreground">
        {row.linear_ticket ?? '—'}
      </span>

      {/* outcome */}
      <span className="truncate text-muted-foreground">{row.outcome ?? row.status}</span>

      {/* cost */}
      <span className="tabular-nums text-muted-foreground text-right whitespace-nowrap">
        {formatCost(row.cost_usd)}
      </span>

      {/* runtime */}
      <span className="tabular-nums text-muted-foreground text-right whitespace-nowrap">
        {formatRuntime(row.runtime_s)}
      </span>
    </div>
  )
}

function EmptyToday() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm text-muted-foreground">No routines have fired today</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1.5 px-3 py-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-5">
          <div className="h-3 w-3 animate-pulse bg-muted rounded" />
          <div className="h-3 w-10 animate-pulse bg-muted rounded" />
          <div className="h-3 w-28 animate-pulse bg-muted rounded" />
          <div className="h-3 w-20 animate-pulse bg-muted rounded" />
          <div className="h-3 flex-1 animate-pulse bg-muted rounded" />
          <div className="ml-auto h-3 w-12 animate-pulse bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export function TodaySection({ initialData }: { initialData: AuditLogSummary }) {
  const [data, setData] = useState<AuditLogSummary>(initialData)
  // F7: Wire loading state correctly — setLoading(true) before fetch, setLoading(false) in finally.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const fetchToday = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/war-room/today', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: AuditLogSummary = await res.json()
      setData(json)
      setLastRefreshed(new Date())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [])

  // 30s polling — safety net if Realtime reconnect fails.
  useEffect(() => {
    const id = setInterval(fetchToday, 30_000)
    return () => clearInterval(id)
  }, [fetchToday])

  // F7: Realtime subscription on audit_log INSERT per ORCHESTRATION.md §2G.
  // Hybrid approach: Realtime triggers immediate refetch on new rows; 30s poll provides fallback.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('war-room-audit-log', {
        config: { broadcast: { self: false } },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_log',
        },
        () => {
          fetchToday()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchToday])

  const { rows, total_cost, routines_fired, failures } = data

  return (
    <section aria-label="Today's activity">
      {/* Header summary row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground/60">
          TODAY
        </h2>
        {/* F9: Primary accent with dark-mode variant */}
        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
          total{' '}
          <span className="text-[#3370FF] dark:text-[#5A8FFF]">
            ${total_cost.toFixed(2)}
          </span>
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          routines fired{' '}
          <span className="font-semibold text-foreground">{routines_fired}</span>
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          failures{' '}
          {/* F9: Critical color with dark-mode variant */}
          <span className={failures > 0 ? 'font-semibold text-[#EF4444] dark:text-[#F87171]' : 'font-semibold text-foreground'}>
            {failures}
          </span>
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
          {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
      </div>

      {/* Column headers */}
      {/* F8: Replaced style={{ gridTemplateColumns: ... }} with Tailwind arbitrary value */}
      <div
        className="grid [grid-template-columns:16px_48px_120px_100px_1fr_auto_auto] items-center gap-x-5 px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60"
        aria-hidden="true"
      >
        <span />
        <span>Time</span>
        <span>Agent</span>
        <span>Ticket</span>
        <span>Outcome</span>
        <span className="text-right">Cost</span>
        <span className="text-right">Runtime</span>
      </div>

      {/* Divider */}
      <div className="mb-1 border-t border-border/50" />

      {/* Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="px-3 py-4 font-mono text-xs text-destructive">
          Error loading today&apos;s data: {error}
        </div>
      ) : rows.length === 0 ? (
        <EmptyToday />
      ) : (
        <div role="table" aria-label="Today's audit log">
          {rows.map((row) => (
            <AuditRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  )
}
