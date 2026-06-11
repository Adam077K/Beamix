'use client'

/**
 * ArchiveClientShell — manages the 4-state cycle for the archive page.
 *
 * Phase 1 only: demo data, no Supabase query.
 * In development only: all 4 states cycle-able via URL param
 * ?state=loading|error|empty|populated (gated behind NODE_ENV !== 'production').
 * In production the shell always loads the real flow (loading → populated).
 *
 * States:
 *   loading   → skeleton rows
 *   error     → ErrorState with retry (cycles back to populated)
 *   empty     → EmptyState with two-tier CTA
 *   populated → filter bar + RunTable with 12 rows
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { DEMO_RUNS } from '@/lib/demo/surfaces/archive'
import { RunTable, type TableState } from './RunTable'

const isDev = process.env.NODE_ENV !== 'production'
const VALID_STATES: TableState[] = ['loading', 'error', 'empty', 'populated']

export function ArchiveClientShell() {
  const searchParams = useSearchParams()
  const retryTimerRef = useRef<number | null>(null)

  // Dev-only: read forced state from URL; in production always ignore.
  const forcedState: TableState | null = isDev
    ? (searchParams.get('state') as TableState | null)
    : null
  const isValidForced = forcedState !== null && VALID_STATES.includes(forcedState)

  const [tableState, setTableState] = useState<TableState>(() => {
    if (isValidForced) return forcedState as TableState
    // Simulate a brief loading flash, then settle on populated
    return 'loading'
  })

  useEffect(() => {
    if (isValidForced) {
      setTableState(forcedState as TableState)
      return
    }
    // Simulate load: 600ms skeleton → populated
    const t = window.setTimeout(() => setTableState('populated'), 600)
    return () => window.clearTimeout(t)
  }, [forcedState, isValidForced])

  // Clean up retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current)
      }
    }
  }, [])

  const handleRetry = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current)
    }
    setTableState('loading')
    retryTimerRef.current = window.setTimeout(() => {
      setTableState('populated')
      retryTimerRef.current = null
    }, 800) as unknown as number
  }, [])

  return (
    <RunTable
      state={tableState}
      rows={tableState === 'populated' ? DEMO_RUNS.rows : []}
      traces={tableState === 'populated' ? DEMO_RUNS.traces : {}}
      onRetry={handleRetry}
    />
  )
}
