'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ENGINE_META,
  QUERY_SETS,
  buildMockResult,
  inferVertical,
  type EngineState,
  type ScanEvent,
  type ScanResult,
} from './scan-contract'

/**
 * Mock scan event emitter (DESIGN-DIRECTION §3 real-engine seam).
 *
 * Drives the scanning ledger from a SCRIPTED timeline. The component layer is
 * event-driven and identical to the live pipeline — only this emitter changes
 * when the real engine ships. Each engine resolves sequentially:
 *   ChatGPT ~3.5s · Gemini ~4s · Perplexity ~3s  → ~10.5s total.
 *
 * REAL-ENGINE SEAM: swap createMockScanEmitter for createLiveScanEmitter(scanId)
 * that subscribes to per-engine completion events. The emit() callback signature
 * (ScanEvent) is the wire contract — see scan-contract.ts.
 */

interface EmitterHandle {
  start: () => void
  stop: () => void
}

// Scripted per-engine duration (ms) and final query count.
const SCRIPT: { id: EngineState['id']; duration: number; totalQueries: number }[] = [
  { id: 'chatgpt', duration: 3500, totalQueries: 412 },
  { id: 'gemini', duration: 4000, totalQueries: 318 },
  { id: 'perplexity', duration: 3000, totalQueries: 247 },
]

function createMockScanEmitter(
  domain: string,
  emit: (event: ScanEvent) => void,
): EmitterHandle {
  const vertical = inferVertical(domain)
  const queries = QUERY_SETS[vertical]
  const timers: ReturnType<typeof setTimeout>[] = []
  const intervals: ReturnType<typeof setInterval>[] = []
  let stopped = false

  const engines: EngineState[] = ENGINE_META.map((m, i) => ({
    id: m.id,
    label: m.label,
    status: i === 0 ? 'querying' : 'queued',
    queryCount: 0,
    totalQueries: SCRIPT[i].totalQueries,
  }))

  const totalDuration = SCRIPT.reduce((s, e) => s + e.duration, 0)
  let elapsedBeforeCurrent = 0
  let queryIndex = 0

  const snapshot = (
    active: EngineState,
    progress: number,
    done = false,
  ): ScanEvent => ({
    engine: active,
    engines: engines.map((e) => ({ ...e })),
    progress,
    currentQuery: done ? null : queries[queryIndex % queries.length],
    done,
  })

  function runEngine(index: number) {
    if (stopped || index >= SCRIPT.length) return
    const step = SCRIPT[index]
    const engine = engines[index]
    engine.status = 'querying'
    const startedAt = Date.now()

    // Live count + progress creep tick (every ~120ms).
    const tick = setInterval(() => {
      if (stopped) return
      const intoEngine = Math.min(Date.now() - startedAt, step.duration)
      const frac = intoEngine / step.duration
      engine.queryCount = Math.round(step.totalQueries * frac)
      const overall = (elapsedBeforeCurrent + intoEngine) / totalDuration
      emit(snapshot(engine, Math.min(overall, 0.99)))
    }, 120)
    intervals.push(tick)

    // Query-string swap every ~1.8s during this engine.
    const swap = setInterval(() => {
      if (stopped) return
      queryIndex += 1
    }, 1800)
    intervals.push(swap)

    // Resolve this engine, advance to the next.
    const resolve = setTimeout(() => {
      if (stopped) return
      clearInterval(tick)
      clearInterval(swap)
      engine.status = 'done'
      engine.queryCount = step.totalQueries
      elapsedBeforeCurrent += step.duration

      const isLast = index === SCRIPT.length - 1
      if (isLast) {
        emit(snapshot(engine, 1, true))
      } else {
        engines[index + 1].status = 'querying'
        emit(snapshot(engine, elapsedBeforeCurrent / totalDuration))
        runEngine(index + 1)
      }
    }, step.duration)
    timers.push(resolve)
  }

  return {
    start() {
      stopped = false
      // Emit initial snapshot immediately — zero dead loading gap (Superhuman
      // auto-start, §4 ACT 1 "submitting" state hands straight into the ledger).
      emit(snapshot(engines[0], 0.01))
      runEngine(0)
    },
    stop() {
      stopped = true
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)
    },
  }
}

export type ScanPhase = 'scanning' | 'settling' | 'reveal'

export interface UseMockScanReturn {
  engines: EngineState[]
  progress: number
  currentQuery: string | null
  /** True the instant the last engine resolves — drives the §3 hand-off. */
  isComplete: boolean
  result: ScanResult | null
  phase: ScanPhase
  /** Caller flips phase to 'reveal' once the ledger-clear animation finishes. */
  enterReveal: () => void
}

export function useMockScan(
  domain: string,
  businessName?: string,
): UseMockScanReturn {
  const [engines, setEngines] = useState<EngineState[]>(
    ENGINE_META.map((m, i) => ({
      id: m.id,
      label: m.label,
      status: i === 0 ? 'querying' : 'queued',
      queryCount: 0,
      totalQueries: 0,
    })),
  )
  const [progress, setProgress] = useState(0.01)
  // Initialize to the first vertical-specific query so the streaming prompt is
  // visible from the very first ledger frame — not blank for the first 1.8s swap
  // tick. The first screenshot a reviewer or demo evaluator takes of the ledger
  // will already show a real customer prompt (e.g. "best family dentist near Tel Aviv").
  const [currentQuery, setCurrentQuery] = useState<string | null>(
    () => QUERY_SETS[inferVertical(domain)][0] ?? null,
  )
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [phase, setPhase] = useState<ScanPhase>('scanning')
  const emitterRef = useRef<EmitterHandle | null>(null)
  // React Strict Mode double-invoke guard. Strict Mode mounts → unmounts → remounts
  // in development, causing the emitter to start twice. Without this guard, both
  // invocations run to completion and the second can fire `done` almost immediately,
  // collapsing the 10.5s ledger dwell to <2s. The guard ensures only the live mount
  // (the one that was NOT cleaned up) runs the emitter.
  const hasStarted = useRef(false)

  useEffect(() => {
    // Prevent double-start under React Strict Mode dev double-invoke.
    if (hasStarted.current) return
    hasStarted.current = true

    const emitter = createMockScanEmitter(domain, (event) => {
      setEngines(event.engines)
      setProgress(event.progress)
      setCurrentQuery(event.currentQuery)
      if (event.done) {
        setIsComplete(true)
        setPhase('settling')
        // Real-engine seam: result comes from the pipeline aggregate.
        setResult(buildMockResult(domain, businessName))
      }
    })
    emitterRef.current = emitter
    emitter.start()
    return () => {
      // Reset so if ScanRunner genuinely unmounts and remounts (e.g. the user
      // retries), a fresh scan can start. The `stopped` flag inside the emitter
      // also clears all timers to prevent stale callbacks.
      hasStarted.current = false
      emitter.stop()
    }
    // domain/businessName are captured once on mount — the scan is a one-shot run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enterReveal = useCallback(() => setPhase('reveal'), [])

  return {
    engines,
    progress,
    currentQuery,
    isComplete,
    result,
    phase,
    enterReveal,
  }
}
