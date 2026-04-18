'use client'

import Script from 'next/script'

/**
 * PaddleLoader — loads Paddle.js (client-side checkout overlay).
 *
 * Add this to your root layout. Paddle.js provides:
 * - Checkout overlay (no redirect needed)
 * - Update payment method overlay
 * - Localized pricing display
 *
 * Usage in layout.tsx:
 *   <PaddleLoader />
 *
 * Then in components:
 *   window.Paddle.Checkout.open({ transactionId: '...' })
 */
export function PaddleLoader() {
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
    ? undefined // production is default
    : 'sandbox'

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && window.Paddle) {
          // Set client-side token for Paddle.js
          const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
          if (clientToken) {
            window.Paddle.Initialize({
              token: clientToken,
              ...(environment ? { environment } : {}),
            })
          }
        }
      }}
    />
  )
}

// Extend Window interface for Paddle.js
declare global {
  interface Window {
    Paddle: {
      Initialize: (config: {
        token: string
        environment?: string
        eventCallback?: (event: PaddleEvent) => void
      }) => void
      Checkout: {
        open: (config: {
          transactionId?: string
          items?: Array<{ priceId: string; quantity: number }>
          customer?: { email?: string }
          customData?: Record<string, string>
          settings?: {
            successUrl?: string
            displayMode?: 'overlay' | 'inline'
            theme?: 'light' | 'dark'
            locale?: string
          }
        }) => void
        close: () => void
      }
      Update: (config: { subscriptionId: string }) => void
    }
  }
}

interface PaddleEvent {
  name: string
  data: Record<string, unknown>
}
