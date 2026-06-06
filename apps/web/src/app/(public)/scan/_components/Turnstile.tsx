'use client'

/**
 * Cloudflare Turnstile widget wrapper.
 *
 * Loads the Turnstile script once, renders the widget, and fires onToken when
 * the challenge resolves. Handles re-render and reset correctly (by tracking
 * the widget ID returned by `window.turnstile.render`).
 *
 * Dev mode: when NEXT_PUBLIC_TURNSTILE_SITE_KEY is absent AND NODE_ENV is not
 * 'production', renders a "[dev] Turnstile skipped" placeholder and calls
 * onToken('dev-token') after ~100ms so the form stays unblocked locally.
 *
 * Production guard: when NEXT_PUBLIC_TURNSTILE_SITE_KEY is absent AND
 * NODE_ENV === 'production', renders a permanent error placeholder and NEVER
 * calls onToken — the form is blocked until the key is configured. This
 * prevents accidental unprotected form submissions in production.
 */

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        },
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileProps {
  onToken: (token: string) => void
  /** Called when the challenge expires or errors — token becomes invalid. */
  onReset?: () => void
}

const SCRIPT_ID = 'cf-turnstile-script'
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export function Turnstile({ onToken, onReset }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    // ── Missing key: production guard ────────────────────────────────────────
    // In production with no key: do NOT call onToken — block the form.
    // In development with no key: emit a dev token for local workflow.
    if (!SITE_KEY) {
      if (IS_PRODUCTION) {
        // Intentionally never call onToken — this is the prod block.
        return
      }
      const t = window.setTimeout(() => onToken('dev-token'), 100)
      return () => window.clearTimeout(t)
    }

    // ── Script loader — idempotent ────────────────────────────────────────────
    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return
      // If already rendered, remove the old widget first.
      if (widgetIdRef.current) {
        try {
          window.turnstile?.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
        widgetIdRef.current = null
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY!,
        callback: (token) => onToken(token),
        'expired-callback': () => {
          onReset?.()
          // Auto-reset so the user can solve again without refreshing.
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current)
          }
        },
        'error-callback': () => {
          onReset?.()
        },
        theme: 'light',
        size: 'normal',
      })
    }

    if (window.turnstile) {
      // Script already loaded (navigating back to form).
      renderWidget()
    } else if (!document.getElementById(SCRIPT_ID)) {
      // Mount the script with an async callback.
      window.onTurnstileLoad = renderWidget
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else {
      // Script is in the DOM but not yet loaded — wait for the callback.
      window.onTurnstileLoad = renderWidget
    }

    return () => {
      // Clean up widget on unmount to avoid duplicate renders.
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
        widgetIdRef.current = null
      }
    }
    // onToken/onReset are intentionally not deps — they're callbacks captured
    // at render time. Re-rendering the widget on every callback change would
    // reset the challenge unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Production misconfiguration error ────────────────────────────────────────
  if (!SITE_KEY && IS_PRODUCTION) {
    return (
      <div
        className="flex h-[65px] items-center justify-center rounded-md border border-red-200 bg-red-50 px-4"
        aria-label="Bot verification unavailable — configuration error"
        role="alert"
      >
        <span className="font-[var(--font-mono)] text-[12px] text-red-500">
          Turnstile not configured — form submission disabled
        </span>
      </div>
    )
  }

  // ── Dev mode placeholder ──────────────────────────────────────────────────
  if (!SITE_KEY) {
    return (
      <div
        className="flex h-[65px] items-center justify-center rounded-md border border-dashed border-[#E5E7EB] bg-[#F7F7F7] px-4"
        aria-label="Bot verification (dev mode — skipped)"
        role="status"
      >
        <span className="font-[var(--font-mono)] text-[12px] text-[#9CA3AF]">
          [dev] Turnstile skipped
        </span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      aria-label="Bot verification"
      // Turnstile renders inside this container at ~65px tall.
      className="overflow-hidden rounded-md"
    />
  )
}
