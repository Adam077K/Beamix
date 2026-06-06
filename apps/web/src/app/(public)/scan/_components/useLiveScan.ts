'use client'

/**
 * useLiveScan — state machine that mirrors useMockScan but drives state from
 * createLiveScanEmitter (real Supabase Realtime + polling fallback).
 *
 * Return shape is identical to UseMockScanReturn, so FreeScanFlow can swap hooks
 * without touching any consumer component.
 *
 * Reveal strategy: server-redirect
 * When done=true, we set isComplete=true and phase='settling'. The ScanningLedger
 * runs its clear animation (onCleared fires), which triggers enterReveal(). At
 * that point FreeScanFlow navigates to /scan/[scanId] — the authoritative,
 * server-rendered, PII-safe result page — instead of rendering ScoreReveal
 * client-side. This means `result` is always null here; FreeScanFlow is
 * responsible for the navigation on enterReveal when scanId is present.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { ENGINE_META, QUERY_SETS, inferVertical, type EngineState } from './scan-contract'
import { createLiveScanEmitter } from './createLiveScanEmitter'
import type { ScanPhase, UseMockScanReturn } from './useMockScan'

// Re-export so FreeScanFlow can use a single import.
export type { ScanPhase }

export interface UseLiveScanReturn extends UseMockScanReturn {
  /** The scan_id provided to this hook — used by FreeScanFlow for the redirect. */
  scanId: string
}

export function useLiveScan(
  scanId: string,
  domain: string,
  businessName?: string,
): UseLiveScanReturn {
  // Initial state mirrors useMockScan's initial state (first engine querying).
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
  const [currentQuery, setCurrentQuery] = useState<string | null>(
    () => QUERY_SETS[inferVertical(domain)][0] ?? null,
  )
  const [isComplete, setIsComplete] = useState(false)
  const [phase, setPhase] = useState<ScanPhase>('scanning')

  // React Strict Mode double-mount guard — mirrors useMockScan exactly.
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const emitter = createLiveScanEmitter(
      scanId,
      domain,
      businessName,
      (event) => {
        setEngines(event.engines)
        setProgress(event.progress)
        setCurrentQuery(event.currentQuery)
        if (event.done) {
          setIsComplete(true)
          setPhase('settling')
        }
      },
    )

    emitter.start()

    return () => {
      // Allow a fresh start if the component genuinely remounts (e.g. retry).
      hasStarted.current = false
      emitter.stop()
    }
    // scanId, domain, businessName are captured once on mount — one-shot scan run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enterReveal = useCallback(() => setPhase('reveal'), [])

  return {
    engines,
    progress,
    currentQuery,
    isComplete,
    // result is always null — real result is fetched server-side at /scan/[scanId].
    result: null,
    phase,
    enterReveal,
    scanId,
  }
}
