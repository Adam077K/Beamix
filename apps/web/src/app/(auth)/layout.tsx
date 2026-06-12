import type { ReactNode } from 'react'

/**
 * BeamixMark — the blue four-point star/cross brand mark (#3370FF).
 * Inline so the auth front door carries a branded signal, not a bare text
 * wordmark. This is a YOU-surface: blue only, never violet.
 */
function BeamixMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* four-point sparkle: concave diamond pinched at the centre */}
      <path
        d="M12 0 C12.6 6.6 17.4 11.4 24 12 C17.4 12.6 12.6 17.4 12 24 C11.4 17.4 6.6 12.6 0 12 C6.6 11.4 11.4 6.6 12 0 Z"
        fill="#3370FF"
      />
    </svg>
  )
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-warm px-6 py-12">
      {/* Figure/ground — a single soft wash-sky bloom behind the card so the
          near-empty canvas reads as a designed surface, not dead space.
          Background-only, under ~4% effective contrast, blue (you-surface) —
          NO violet here. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 38%, var(--color-wash-sky) 0%, transparent 70%)',
          opacity: 0.6,
        }}
      />

      <div className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex w-full max-w-[400px] flex-col">
          {/* Wordmark — mark + name, fade-up first (reduced-motion safe) */}
          <div className="craft-enter craft-enter-1 mb-6 flex items-center justify-center gap-2">
            <BeamixMark className="h-[26px] w-[26px]" />
            <span
              className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-[#0A0A0A]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Beamix
            </span>
          </div>

          {/* Page content (the auth card) — fade-up second */}
          <div className="craft-enter craft-enter-2">{children}</div>

          {/* Quiet footer — fade-up last */}
          <p className="craft-enter craft-enter-3 mt-8 text-center text-[12px] leading-[1.5] text-[#9CA3AF]">
            Beamix — done-for-you AI search visibility.
          </p>
        </div>
      </div>
    </main>
  )
}
