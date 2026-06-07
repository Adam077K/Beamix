'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks the user's prefers-reduced-motion setting.
 *
 * Starts `false` (matches SSR markup to avoid hydration mismatch), then syncs
 * to the real media-query value on mount and on change. Callers must gate any
 * JS-driven animation (RAF loops, setInterval) on this — CSS transitions are
 * already neutralized by the global reduced-motion block in globals.css.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
