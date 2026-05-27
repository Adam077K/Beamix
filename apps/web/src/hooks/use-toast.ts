'use client'

import * as React from 'react'

interface ToastState {
  open: boolean
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastControls {
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
  state: ToastState
  dismiss: () => void
}

const DURATION = 3500

/**
 * Minimal toast hook — wraps Radix Toast state without a global context.
 * Each component that calls useToast() gets its own toast instance.
 * Mount <ToastRoot /> from @/components/ui/toast wherever you call useToast().
 */
export function useToast(): ToastControls {
  const [state, setState] = React.useState<ToastState>({
    open: false,
    title: '',
  })

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = React.useCallback(() => {
    setState((s) => ({ ...s, open: false }))
  }, [])

  const toast = React.useCallback(
    (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState({ open: true, ...opts })
      timerRef.current = setTimeout(dismiss, DURATION)
    },
    [dismiss],
  )

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { toast, state, dismiss }
}
