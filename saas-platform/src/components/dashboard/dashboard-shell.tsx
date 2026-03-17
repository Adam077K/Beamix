'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { cn } from '@/lib/utils'

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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <span className="font-sans text-xl font-bold text-foreground">
          Beam<span className="text-primary">ix</span>
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in overlay */}
      <div
        className={cn(
          'fixed inset-y-0 start-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
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
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
