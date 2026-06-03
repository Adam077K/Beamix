'use client'

import { useEffect, useRef, useState } from 'react'
import { ENGINES, type EngineId, type EngineRowStatus } from './scan-mock'

/**
 * use-scan-simulation — drives the Act-B "scanning moment" with mock timers.
 *
 * ⚠️ MOCK SEAM. This hook fakes engine-by-engine progress with setTimeout +
 * setInterval. When the real pipeline lands, replace the internals with a
 * subscription to real progress events (SSE/stream or polling) that emit the
 * same {status, ticks} per engine and a final `done`. The returned shape is
 * what the UI binds to, so the component layer does not change.
 */

export interface EngineProgress {
  id: EngineId
  status: EngineRowStatus
  /** Live count of queries run so far (mono ticker). */
  ticks: number
  /** Total queries for this engine. */
  total: number
}

export interface ScanSimulationState {
  engines: EngineProgress[]
  /** 0–100 overall progress for the top bar. */
  progress: number
  /** True once every engine has completed. */
  done: boolean
}

interface Options {
  /** Whether the simulation is running. Flip to true to start. */
  active: boolean
  /** Called once after all engines finish. */
  onComplete?: () => void
  /** Per-engine query dwell in ms (real range ~3–5s/engine → ~8–15s total). */
  engineDwellMs?: number
  /** Stagger between engine starts (DESIGN-DIRECTION: 120ms/row). */
  staggerMs?: number
}

export function useScanSimulation({
  active,
  onComplete,
  engineDwellMs = 4200,
  staggerMs = 120,
}: Options): ScanSimulationState {
  const [engines, setEngines] = useState<EngineProgress[]>(() =>
    ENGINES.map((e) => ({ id: e.id, status: 'queued', ticks: 0, total: e.queryCount })),
  )
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Honor reduced motion — collapse the timed sequence to an instant finish so
  // the user still reaches the reveal, just without the live ticking theatre.
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!active || completedRef.current) return

    if (prefersReduced) {
      setEngines((prev) =>
        prev.map((e) => ({ ...e, status: 'done', ticks: e.total })),
      )
      completedRef.current = true
      const t = setTimeout(() => onCompleteRef.current?.(), 600)
      return () => clearTimeout(t)
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const intervals: ReturnType<typeof setInterval>[] = []

    ENGINES.forEach((engine, index) => {
      const startAt = index * (engineDwellMs + staggerMs)

      // queued → querying
      timers.push(
        setTimeout(() => {
          setEngines((prev) =>
            prev.map((e) =>
              e.id === engine.id ? { ...e, status: 'querying' } : e,
            ),
          )

          // Tick the query counter up to total over engineDwellMs.
          const total = engine.queryCount
          const tickEvery = Math.max(60, Math.floor(engineDwellMs / total))
          let current = 0
          const iv = setInterval(() => {
            current = Math.min(total, current + 1)
            setEngines((prev) =>
              prev.map((e) =>
                e.id === engine.id ? { ...e, ticks: current } : e,
              ),
            )
            if (current >= total) clearInterval(iv)
          }, tickEvery)
          intervals.push(iv)
        }, startAt),
      )

      // querying → done
      timers.push(
        setTimeout(() => {
          setEngines((prev) =>
            prev.map((e) =>
              e.id === engine.id
                ? { ...e, status: 'done', ticks: e.total }
                : e,
            ),
          )
        }, startAt + engineDwellMs),
      )
    })

    // All done → fire onComplete after the last engine settles.
    const totalDuration =
      ENGINES.length * (engineDwellMs + staggerMs) + 500
    timers.push(
      setTimeout(() => {
        completedRef.current = true
        onCompleteRef.current?.()
      }, totalDuration),
    )

    return () => {
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const doneCount = engines.filter((e) => e.status === 'done').length
  const tickProgress =
    engines.reduce((sum, e) => sum + e.ticks, 0) /
    Math.max(1, engines.reduce((sum, e) => sum + e.total, 0))
  const progress = Math.round(tickProgress * 100)
  const done = doneCount === engines.length

  return { engines, progress, done }
}
