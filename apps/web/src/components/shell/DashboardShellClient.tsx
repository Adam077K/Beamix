'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from './Sidebar'
import { PreviewModeBanner } from './PreviewModeBanner'
import { PaywallModal } from '@/components/paywall/PaywallModal'
import { CommandPalette } from './CommandPalette'

interface DashboardShellClientProps {
  children: React.ReactNode
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
}

export function DashboardShellClient({ children, user, plan }: DashboardShellClientProps) {
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const lastToggleRef = useRef<number>(0)

  const openPalette = useCallback(() => {
    const now = Date.now()
    // Debounce: prevent duplicate opens within 200ms
    if (now - lastToggleRef.current < 200) return
    lastToggleRef.current = now
    setCmdOpen(true)
  }, [])

  const closePalette = useCallback(() => {
    setCmdOpen(false)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ⌘K on Mac, Ctrl+K on Win/Linux
      const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key === 'k') {
        e.preventDefault()
        e.stopPropagation()
        setCmdOpen((prev) => {
          if (prev) return false
          const now = Date.now()
          if (now - lastToggleRef.current < 200) return false
          lastToggleRef.current = now
          return true
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  return (
    <>
      {plan == null && (
        <PreviewModeBanner onUpgrade={() => setPaywallOpen(true)} />
      )}
      <div className="flex min-h-screen bg-white">
        <Sidebar user={user} plan={plan} onOpenCommandPalette={openPalette} />
        <main className="flex-1 min-h-screen min-w-0">{children}</main>
      </div>
      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        triggerContext="preview-mode-banner"
      />
      <CommandPalette open={cmdOpen} onClose={closePalette} />
    </>
  )
}
