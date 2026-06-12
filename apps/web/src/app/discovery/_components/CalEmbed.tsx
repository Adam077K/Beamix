'use client'

/**
 * CalEmbed — client component that embeds the Cal.com iframe.
 *
 * Shows a branded loading state (mark + contextual line, M4 signature detail)
 * while the iframe initializes. Height is fluid, not a fixed 700/800px box, so
 * it never overflows at 375px and still gives the month grid room on desktop.
 * The booking widget internals are untouched (third-party iframe).
 */

import { useState } from 'react'

interface CalEmbedProps {
  calUrl: string
}

export function CalEmbed({ calUrl }: CalEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className="relative w-full"
      // Fluid height: min 560px (mobile-safe — no overflow at 375px), grows
      // with the viewport, capped at 760px so the month grid stays in view.
      style={{ height: 'clamp(560px, 78vh, 760px)' }}
    >
      {/* Scoped breathing keyframe — the foundation owns scan-dot but not a
          mark pulse; defined locally so no shared/foundation file is touched. */}
      <style>{`
        @keyframes cal-mark-breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.78; transform: scale(0.94); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-mark-breathe { animation: none !important; }
        }
      `}</style>

      {/* Branded loading state — mark + contextual line (M4), not a bare spinner */}
      {!loaded && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-[var(--color-surface)] px-6"
          aria-label="Loading booking calendar"
          aria-busy="true"
        >
          <BeamixPulseMark />
          <div className="flex items-center gap-2" aria-hidden="true">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
                style={{
                  animation: `scan-dot 1.4s ease-in-out infinite`,
                  animationDelay: `${delay}ms`,
                }}
              />
            ))}
          </div>
          <p className="font-[var(--font-mono)] text-[12px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
            Loading your calendar…
          </p>
        </div>
      )}

      <iframe
        src={calUrl}
        className="h-full w-full border-0"
        title="Book a discovery call with Beamix"
        loading="eager"
        allow="payment"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 300ms ease-out' }}
      />
    </div>
  )
}

/** Accent-tile Beamix mark, gently breathing — the loading signature. */
function BeamixPulseMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="cal-mark-breathe"
      style={{ animation: 'cal-mark-breathe 1.6s ease-in-out infinite' }}
    >
      <rect width="22" height="22" rx="6" fill="var(--color-accent)" />
      <path
        d="M7 6h5a2.6 2.6 0 0 1 0 5.2H7V6Zm0 5.2h5.4a2.6 2.6 0 0 1 0 5.2H7v-5.2Z"
        fill="#fff"
      />
    </svg>
  )
}
