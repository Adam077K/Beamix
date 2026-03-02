'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  businessName: string
  planTier: string
  trialDaysLeft: number | null
}

export function DashboardShell({
  children,
  businessName,
  planTier,
  trialDaysLeft,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-card-border)] bg-white px-4 md:hidden">
        <span className="font-display text-xl font-bold text-[var(--color-text)]">
          Beam<span className="text-[var(--color-accent)]">ix</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent-warm)] ml-0.5 mb-2"></span>
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in overlay */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          businessName={businessName}
          planTier={planTier}
          trialDaysLeft={trialDaysLeft}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
