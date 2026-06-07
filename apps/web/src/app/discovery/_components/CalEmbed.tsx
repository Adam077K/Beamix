'use client'

/**
 * CalEmbed — client component that embeds the Cal.com iframe.
 *
 * Shows a branded loading state while the iframe initializes.
 * The booking widget internals are untouched.
 */

import { useState } from 'react'

interface CalEmbedProps {
  calUrl: string
}

export function CalEmbed({ calUrl }: CalEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full">
      {/* Branded loading state — visible until iframe fires onLoad */}
      {!loaded && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[var(--color-surface-warm)] py-16"
          aria-label="Loading booking calendar"
          aria-busy="true"
        >
          <div className="flex items-center gap-2">
            {/* Three-dot mono pulse matching the brand scan animation */}
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="block h-2 w-2 rounded-full bg-[var(--color-accent)]"
                style={{
                  animation: `scan-dot 1.4s ease-in-out infinite`,
                  animationDelay: `${delay}ms`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
            Loading calendar…
          </p>
        </div>
      )}

      <iframe
        src={calUrl}
        className="h-[700px] w-full border-0 sm:h-[800px]"
        title="Book a discovery call with Beamix"
        loading="eager"
        allow="payment"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 300ms ease-out' }}
      />
    </div>
  )
}
