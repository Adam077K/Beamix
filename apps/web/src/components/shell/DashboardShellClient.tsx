'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { PreviewModeBanner } from './PreviewModeBanner'
import { PaywallModal } from '@/components/paywall/PaywallModal'

interface DashboardShellClientProps {
  children: React.ReactNode
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
}

export function DashboardShellClient({ children, user, plan }: DashboardShellClientProps) {
  const [paywallOpen, setPaywallOpen] = useState(false)

  return (
    <>
      {plan == null && (
        <PreviewModeBanner onUpgrade={() => setPaywallOpen(true)} />
      )}
      <div className="flex min-h-screen bg-white">
        <Sidebar user={user} plan={plan} />
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerContext="preview-mode-banner"
      />
    </>
  )
}
