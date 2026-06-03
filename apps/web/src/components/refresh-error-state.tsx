'use client'

import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/error-state'

interface RefreshErrorStateProps {
  title?: string
  description?: string
  retryLabel?: string
}

/**
 * RefreshErrorState — a Server-Component-friendly error block.
 *
 * Server components can't pass a client callback to <ErrorState>, so this thin
 * client wrapper supplies a real "Try again" that re-runs the server render via
 * router.refresh() — never "refresh the page yourself" (DESIGN-DIRECTION §4.4).
 */
export function RefreshErrorState(props: RefreshErrorStateProps) {
  const router = useRouter()
  return <ErrorState {...props} onRetry={() => router.refresh()} />
}
