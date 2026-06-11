'use client'

/**
 * ArchiveClientShell — manages the 4-state cycle for the archive page.
 *
 * Phase 1 only: demo data, no Supabase query.
 * All 4 states cycle-able via URL param ?state=loading|error|empty|populated
 * (dev convenience only; production will always land on 'populated').
 *
 * States:
 *   loading   → skeleton rows
 *   error     → ErrorState with retry (cycles back to populated)
 *   empty     → EmptyState with two-tier CTA
 *   populated → filter bar + RunTable with 12 rows
 */

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { DEMO_RUNS } from '@/lib/demo/surfaces/archive'
import { RunTable, type TableState } from './RunTable'

export function ArchiveClientShell() {
  const searchParams = useSearchParams()

  // Dev convenience: ?state=loading|error|empty forces a specific state
  const forcedState = searchParams.get('state') as TableState | null

  const [tableState, setTableState] = useState<TableState>(() => {
    if (forcedState && ['loading', 'error', 'empty', 'populated'].includes(forcedState)) {
      return forcedState
    }
    // Simulate a brief loading flash, then settle on populated
    return 'loading'
  })

  useEffect(() => {
    if (forcedState && ['loading', 'error', 'empty', 'populated'].includes(forcedState)) {
      setTableState(forcedState as TableState)
      return
    }
    // Simulate load: 600ms skeleton → populated
    const t = window.setTimeout(() => setTableState('populated'), 600)
    return () => window.clearTimeout(t)
  }, [forcedState])

  const handleRetry = useCallback(() => {
    setTableState('loading')
    const t = window.setTimeout(() => setTableState('populated'), 800)
    return () => window.clearTimeout(t)
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
