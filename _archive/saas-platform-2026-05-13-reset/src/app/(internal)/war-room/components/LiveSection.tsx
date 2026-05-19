'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProgressRow } from '../lib/queries'

function formatRuntime(tsIso: string): string {
  const diff = Date.now() - new Date(tsIso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function formatCost(cost: number | null): string {
  if (cost === null || cost === 0) return '—'
  return `$${cost.toFixed(2)}`
}

function RunningRow({ row }: { row: ProgressRow }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  return (
    // F8: Replaced style={{ gridTemplateColumns: '14px 1fr 1fr auto auto' }} with Tailwind arbitrary value.
    <div
      className="grid [grid-template-columns:14px_1fr_1fr_auto_auto] items-center gap-x-6 py-2 font-mono text-xs text-foreground hover:bg-muted/40 transition-colors rounded-sm px-3"
      role="row"
    >
      {/* status dot — F9: dark-mode primary variant */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3370FF] dark:bg-[#5A8FFF] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3370FF] dark:bg-[#5A8FFF]" />
      </span>

      {/* routine — F9: dark-mode accent */}
      <span className="truncate text-[#3370FF] dark:text-[#5A8FFF] font-medium">{row.routine}</span>

      {/* ticket + step */}
      <span className="truncate text-muted-foreground">
        {row.linear_ticket ? (
          <span className="text-foreground/80">{row.linear_ticket}</span>
        ) : null}
        {row.linear_ticket && row.step ? ' — ' : ''}
        {row.step}
      </span>

      {/* cost */}
      <span className="tabular-nums text-muted-foreground text-right">
        {formatCost(row.cost_usd)}
      </span>

      {/* runtime */}
      <span className="tabular-nums text-muted-foreground text-right whitespace-nowrap">
        {formatRuntime(row.ts)}
      </span>
    </div>
  )
}

function EmptyRunning() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-2 w-2 rounded-full bg-muted mb-3" />
      <p className="text-sm text-muted-foreground">No routines running</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 px-3 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-6">
          <div className="h-2 w-2 rounded-full animate-pulse bg-muted" />
          <div className="h-3 w-24 animate-pulse bg-muted rounded" />
          <div className="h-3 w-48 animate-pulse bg-muted rounded" />
          <div className="ml-auto h-3 w-12 animate-pulse bg-muted rounded" />
          <div className="h-3 w-8 animate-pulse bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export function LiveSection({ initialRows }: { initialRows: ProgressRow[] }) {
  const [rows, setRows] = useState<ProgressRow[]>(initialRows)
  const [loading, setLoading] = useState(false)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchRunning = useCallback(async () => {
    try {
      const res = await fetch('/api/war-room/running', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ProgressRow[] = await res.json()
      setRows(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    }
  }, [])

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return
    pollIntervalRef.current = setInterval(fetchRunning, 10_000)
  }, [fetchRunning])

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // F6: Documented limitation — Realtime postgres_changes does not support range filters.
    // Subscription matches all status=running rows across time. Acceptable: claude_progress rows
    // with status=running are short-lived (TTL = Routine runtime, max 60 min). Volume bounded.
    const channel = supabase
      .channel('war-room-progress', {
        config: { broadcast: { self: false } },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claude_progress',
          filter: 'status=eq.running',
        },
        () => {
          fetchRunning()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true)
          stopPolling()
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false)
          startPolling()
        }
      })

    channelRef.current = channel

    // Start polling as fallback — Realtime will disable it once connected
    startPolling()

    return () => {
      supabase.removeChannel(channel)
      stopPolling()
    }
  }, [fetchRunning, startPolling, stopPolling])

  const runningRows = rows.filter((r) => r.status === 'running')
  const count = runningRows.length

  return (
    <section aria-label="Now running">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 pb-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground/60">
          NOW RUNNING
        </h2>
        {count > 0 && (
          // F9: dark-mode primary variant
          <span className="rounded-full bg-[#3370FF]/10 dark:bg-[#5A8FFF]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#3370FF] dark:text-[#5A8FFF]">
            {count}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {/* F9: Good (#10B981→#34D399) / Fair (#F59E0B→#FBBF24) dark-mode status indicators */}
          <span
            className={`h-1.5 w-1.5 rounded-full ${realtimeConnected ? 'bg-[#10B981] dark:bg-[#34D399]' : 'bg-[#F59E0B] dark:bg-[#FBBF24]'}`}
            title={realtimeConnected ? 'Realtime connected' : 'Polling fallback active'}
          />
          <span className="font-mono text-[10px] text-muted-foreground">
            {realtimeConnected ? 'live' : 'polling'}
          </span>
        </div>
      </div>

      {/* Column headers */}
      {/* F8: Replaced style={{ gridTemplateColumns: ... }} with Tailwind arbitrary value */}
      <div
        className="grid [grid-template-columns:14px_1fr_1fr_auto_auto] items-center gap-x-6 px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60"
        role="row"
        aria-hidden="true"
      >
        <span />
        <span>Routine</span>
        <span>Ticket — Step</span>
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
          Error loading live data: {error}
        </div>
      ) : count === 0 ? (
        <EmptyRunning />
      ) : (
        <div role="table" aria-label="Running routines">
          {runningRows.map((row) => (
            <RunningRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  )
}
