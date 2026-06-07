import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-warm px-6 py-12">
      <div className="flex w-full max-w-[400px] flex-col">
        {/* Wordmark */}
        <div className="mb-6 flex items-center justify-center">
          <span
            className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-[#0A0A0A]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Beamix
          </span>
        </div>

        {/* Page content (the auth card) */}
        {children}

        {/* Quiet footer */}
        <p className="mt-8 text-center text-[12px] leading-[1.5] text-[#9CA3AF]">
          Beamix — done-for-you AI search visibility.
        </p>
      </div>
    </main>
  )
}
