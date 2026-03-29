'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  FileText,
  Settings,
  Users,
  Bell,
  Lightbulb,
  ScanSearch,
  Shield,
  Menu,
  X,
  Search,
} from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserMenu } from '@/components/dashboard/user-menu'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { Badge } from '@/components/ui/badge'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { cn } from '@/lib/utils'
import { SidebarProvider, useSidebar } from '@/components/dashboard/sidebar-context'

interface DashboardShellProps {
  children: React.ReactNode
  businessName: string
  planTier: string
  trialDaysLeft: number | null
}

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard',                  label: 'Overview',          icon: LayoutDashboard },
  { href: '/dashboard/rankings',         label: 'Rankings',          icon: BarChart3 },
  { href: '/dashboard/ai-readiness',     label: 'AI Readiness',      icon: Shield },
  { href: '/dashboard/competitors',      label: 'Competitors',       icon: Users },
  { href: '/dashboard/scan',             label: 'Scan',              icon: ScanSearch },
  { href: '/dashboard/agents',           label: 'AI Agents',         icon: Bot },
  { href: '/dashboard/recommendations',  label: 'Recommendations',   icon: Lightbulb },
  { href: '/dashboard/content',          label: 'Content Library',   icon: FileText },
  { href: '/dashboard/notifications',    label: 'Notifications',     icon: Bell },
  { href: '/dashboard/settings',         label: 'Settings',          icon: Settings },
]

function ShellContent({
  children,
  businessName,
  planTier,
  trialDaysLeft,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  useEffect(() => {
    if (!mobileOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen])

  // Agent chat pages need full-bleed layout (no padding/max-width wrapper)
  const isAgentChat = pathname?.includes('/dashboard/agents/') && pathname !== '/dashboard/agents'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Collapsible sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar
          businessName={businessName}
          planTier={planTier}
          trialDaysLeft={trialDaysLeft ?? undefined}
        />
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-card ltr:border-r rtl:border-l border-border flex flex-col md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-14 items-center justify-between px-4 border-b border-border">
              <span className="text-sm font-semibold tracking-tight">
                Beam<span className="text-primary">ix</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main navigation">
              {MOBILE_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {businessName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{businessName}</p>
                  {trialDaysLeft !== null && trialDaysLeft > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {trialDaysLeft}d trial left
                    </p>
                  ) : (
                    <p className="text-xs capitalize text-muted-foreground">{planTier} plan</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          collapsed
            ? 'ltr:md:pl-16 rtl:md:pr-16'
            : 'ltr:md:pl-60 rtl:md:pr-60'
        )}
      >
        {/* Top header bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 md:px-6">
          {/* Left: Mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Mobile logo */}
            <span className="text-sm font-semibold tracking-tight md:hidden">
              Beam<span className="text-primary">ix</span>
            </span>
          </div>

          {/* Center: Command palette trigger — desktop only */}
          <button
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
            }}
            className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Open command palette (⌘K)"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Search...</span>
            <kbd className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>

          {/* Right: Language toggle + notifications + trial badge + user menu */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href="/dashboard/notifications"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>
            {trialDaysLeft !== null && trialDaysLeft > 0 && (
              <Badge className="hidden sm:inline-flex bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                Trial: {trialDaysLeft}d left
              </Badge>
            )}
            {trialDaysLeft !== null && trialDaysLeft <= 0 && (
              <Link href="/pricing">
                <Badge className="hidden sm:inline-flex bg-red-100 text-red-700 border-red-200 hover:bg-red-200 cursor-pointer">
                  Trial expired · Upgrade
                </Badge>
              </Link>
            )}
            <UserMenu businessName={businessName} planTier={planTier} />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto dashboard-bg">
          {isAgentChat ? (
            children
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <SidebarProvider>
      <CommandPalette />
      <ShellContent {...props} />
    </SidebarProvider>
  )
}
