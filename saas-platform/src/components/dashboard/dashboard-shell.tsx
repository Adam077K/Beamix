'use client'

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
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar
        businessName={businessName}
        planTier={planTier}
        trialDaysLeft={trialDaysLeft}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
