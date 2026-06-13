/**
 * createLiveScanEmitter — wires the live scan backend to the ScanEvent stream.
 *
 * Data flow:
 *   Supabase Realtime POSTGRES_CHANGES on scan_progress → mapAndEmit → ScanEvent
 *   Fallback: poll GET /api/scan/free/[scanId]/progress every 1500ms
 *
 * ── PII GUARANTEE ────────────────────────────────────────────────────────────
 * This file NEVER queries `free_scans`. That table contains PII (email, IP, domain).
 * Only `scan_progress` is read — it is PII-free by construction.
 * grep-safety: "free_scans" must not appear in a .from() call in this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'
import {
  DEFAULT_ENGINE_PROGRESS,
  REALTIME_CHANNEL,
  parseProgressRow,
  type EngineProgress,
  type EngineId,
  type ScanProgress,
} from '@/lib/scan/progress'
import {
  ENGINE_META,
  QUERY_SETS,
  inferVertical,
  type EngineState,
  type ScanEvent,
} from './scan-contract'

// ── Supabase anon client (read-only, PII-free table only) ─────────────────────

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── Label map ──────────────────────────────────────────────────────────────────

const ENGINE_LABEL: Record<EngineId, string> = Object.fromEntries(
  ENGINE_META.map((m) => [m.id, m.label]),
) as Record<EngineId, string>

// ── Row → EngineState[] ────────────────────────────────────────────────────────

function progressToEngineStates(engines: EngineProgress[]): EngineState[] {
  return engines.map((ep) => ({
    id: ep.id,
    label: ENGINE_LABEL[ep.id] ?? ep.id,
    status: ep.status,
    queryCount: ep.queryCount,
    totalQueries: ep.totalQueries,
  }))
}

// ── Determine which engine most recently transitioned ─────────────────────────
// We compare current vs previous snapshot and return the engine that changed
// status. Falls back to the first 'querying' engine if nothing changed.

function findChangedEngine(
  current: EngineProgress[],
  previous: EngineProgress[],
): EngineProgress {
  for (let i = 0; i < current.length; i++) {
    const prev = previous[i]
    if (!prev || current[i].status !== prev.status) {
      return current[i]
    }
  }
  // Fallback: return the first querying engine, or else the first engine.
  return (
    current.find((e) => e.status === 'querying') ??
    current[0] ??
    DEFAULT_ENGINE_PROGRESS[0]
  )
}

// ── Map a ScanProgress row → ScanEvent ────────────────────────────────────────

function mapToScanEvent(
  row: ScanProgress,
  previous: EngineProgress[],
): ScanEvent {
  const engines = progressToEngineStates(row.engines)
  const changedEngine = findChangedEngine(row.engines, previous)

  // If the scan failed, synthesize an error state for any engine still querying.
  if (row.status === 'failed') {
    const errorEngines = engines.map((e) =>
      e.status === 'querying' ? { ...e, status: 'error' as const } : e,
    )
    const changedWithError =
      errorEngines.find((e) => e.status === 'error') ?? errorEngines[0]
    return {
      engine: changedWithError,
      engines: errorEngines,
      progress: row.progress,
      currentQuery: null,
      done: true,
    }
  }

  return {
    engine: {
      id: changedEngine.id,
      label: ENGINE_LABEL[changedEngine.id] ?? changedEngine.id,
      status: changedEngine.status,
      queryCount: changedEngine.queryCount,
      totalQueries: changedEngine.totalQueries,
    },
    engines,
    progress: row.progress,
    currentQuery: row.currentQuery,
    done: row.done,
  }
}

// ── Seeded initial event (zero dead gap) ──────────────────────────────────────
// Emitted immediately on start() so the ledger is never blank while we wait
// for the first Realtime event or poll response.

function buildSeededEvent(domain: string, businessName?: string): ScanEvent {
  const vertical = inferVertical(domain)
  const firstQuery = QUERY_SETS[vertical][0] ?? `What is the best ${businessName ?? domain}?`

  const engines: EngineState[] = ENGINE_META.map((m, i) => ({
    id: m.id,
    label: m.label,
    status: i === 0 ? 'querying' : 'queued',
    queryCount: 0,
    totalQueries: 0,
  }))

  return {
    engine: engines[0],
    engines,
    progress: 0.01,
    currentQuery: firstQuery,
    done: false,
  }
}

// ── Main emitter factory ──────────────────────────────────────────────────────

export interface LiveEmitterHandle {
  start: () => void
  stop: () => void
}

/**
 * Creates a live scan emitter that drives the ScanEvent stream from the real
 * Supabase backend via Realtime (POSTGRES_CHANGES) with a polling fallback.
 *
 * FORBIDDEN: never `.from('free_scans')` in this file. Only `scan_progress`.
 */
// ── Constants ─────────────────────────────────────────────────────────────────

/** Polling interval used in the HTTP fallback path (1Hz). */
const POLL_INTERVAL_MS = 1000

/**
 * If the Realtime subscription is live but no delta arrives for this long,
 * fall back to polling. Guards against Supabase sending SUBSCRIBED but then
 * silently dropping events (e.g. Realtime publication misconfiguration).
 */
const STALE_DELTA_TIMEOUT_MS = 5000

export function createLiveScanEmitter(
  scanId: string,
  domain: string,
  businessName: string | undefined,
  emit: (event: ScanEvent) => void,
): LiveEmitterHandle {
  let stopped = false
  let previousEngines: EngineProgress[] = [...DEFAULT_ENGINE_PROGRESS]
  let pollInterval: ReturnType<typeof setInterval> | null = null
  let staleDeltaTimer: ReturnType<typeof setTimeout> | null = null
  let realtimeChannel: ReturnType<ReturnType<typeof getAnonClient>['channel']> | null = null
  let reconnectFailures = 0
  const MAX_RECONNECT_FAILURES = 3

  const supabase = getAnonClient()

  /** Start / reset the stale-delta watchdog. Cancels and restarts the 5s timer. */
  function resetStaleDeltaTimer() {
    if (staleDeltaTimer) {
      clearTimeout(staleDeltaTimer)
      staleDeltaTimer = null
    }
    if (stopped) return
    staleDeltaTimer = setTimeout(() => {
      if (stopped) return
      // No delta for 5s — fall back to polling.
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
        realtimeChannel = null
      }
      startPolling()
    }, STALE_DELTA_TIMEOUT_MS)
  }

  function stopStaleDeltaTimer() {
    if (staleDeltaTimer) {
      clearTimeout(staleDeltaTimer)
      staleDeltaTimer = null
    }
  }

  function handleRow(row: ScanProgress) {
    if (stopped) return
    // A row arrived — reset the stale-delta watchdog.
    resetStaleDeltaTimer()
    const event = mapToScanEvent(row, previousEngines)
    previousEngines = [...row.engines]
    emit(event)

    if (event.done) {
      cleanup()
    }
  }

  function startPolling() {
    if (pollInterval) return
    // Stop the stale-delta watchdog — polling is the active strategy now.
    stopStaleDeltaTimer()
    pollInterval = setInterval(async () => {
      if (stopped) return
      try {
        const res = await fetch(`/api/scan/free/${scanId}/progress`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const raw = (await res.json()) as Record<string, unknown>
        const row = parseProgressRow(raw)
        handleRow(row)
        if (row.done && pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
      } catch {
        // network error — keep polling
      }
    }, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  function cleanup() {
    stopped = true
    stopPolling()
    stopStaleDeltaTimer()
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  async function fetchInitialRow() {
    if (stopped) return
    try {
      // Cover the race where progress was written before subscribe confirmed.
      const { data } = await supabase
        .from('scan_progress')
        .select('scan_id,engines,progress,current_query,done,status,updated_at')
        .eq('scan_id', scanId)
        .maybeSingle()

      if (stopped || !data) return

      const row = parseProgressRow(data as Record<string, unknown>)
      handleRow(row)
    } catch {
      // Ignore — the Realtime subscription will catch subsequent updates.
    }
  }

  return {
    start() {
      stopped = false

      // 1. Emit seeded event immediately — zero dead loading gap.
      emit(buildSeededEvent(domain, businessName))

      // 2. Subscribe to Realtime POSTGRES_CHANGES on scan_progress.
      realtimeChannel = supabase
        .channel(REALTIME_CHANNEL(scanId))
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scan_progress',
            filter: `scan_id=eq.${scanId}`,
          },
          (payload: { new: unknown }) => {
            if (stopped) return
            // Reset reconnect counter on successful message.
            reconnectFailures = 0

            const raw = payload.new as Record<string, unknown>
            const row = parseProgressRow(raw)
            handleRow(row)
          },
        )
        .subscribe((status) => {
          if (stopped) return

          if (status === 'SUBSCRIBED') {
            reconnectFailures = 0
            // Race guard: fetch initial row now that the subscription is live.
            fetchInitialRow()
            // Start the stale-delta watchdog — if no row arrives within 5s,
            // fall back to polling.
            resetStaleDeltaTimer()
          } else if (
            status === 'CHANNEL_ERROR' ||
            status === 'TIMED_OUT' ||
            status === 'CLOSED'
          ) {
            reconnectFailures++
            if (reconnectFailures >= MAX_RECONNECT_FAILURES) {
              // Fall back to polling.
              if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel)
                realtimeChannel = null
              }
              startPolling()
            }
          }
        })
    },

    stop() {
      cleanup()
    },
  }
}
