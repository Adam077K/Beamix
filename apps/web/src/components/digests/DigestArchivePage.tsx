'use client'

import { DigestList } from './DigestList'
import { DigestEmptyState } from './DigestEmptyState'
import { DigestSkeleton } from './DigestSkeleton'
import { DigestError } from './DigestError'
import type { WeeklyDigest } from '@/types/digest'

interface DigestArchivePageProps {
  digests: WeeklyDigest[]
  /**
   * Explicit state override — used in Storybook/test to demonstrate all states.
   * In production: derived from data.
   */
  forceState?: 'loading' | 'error' | 'empty' | 'populated'
  /** Error retry handler — pass through from the page for error state */
  onRetry?: () => void
}

/**
 * DigestArchivePage — client component that routes to the correct state.
 *
 * States:
 *  (a) LOADING   — DigestSkeleton
 *  (b) ERROR     — DigestError with retry
 *  (c) EMPTY     — DigestEmptyState (ghost preview + Sunday promise)
 *  (d) POPULATED — DigestList (search + list + panel/accordion)
 *
 * In production the page passes real digests; forceState is for dev/demo only.
 */
export function DigestArchivePage({
  digests,
  forceState,
  onRetry,
}: DigestArchivePageProps) {
  if (forceState === 'loading') return <DigestSkeleton />
  if (forceState === 'error') return <DigestError onRetry={onRetry} />
  if (forceState === 'empty' || (digests.length === 0 && !forceState)) {
    return <DigestEmptyState />
  }

  // Wave 2: fetch weekly_digests for customer; wire loading/error states here
  return <DigestList digests={digests} />
}
