'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu, X } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserMenu } from '@/components/dashboard/user-menu'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
  children: React.ReactNode
  businessName: string
  planTier: string
  trialDaysLeft: number | null
}

const TOP_NAV_TABS = [
  { href: '/dashboard',                 label: 'Overview' },
  { href: '/dashboard/rankings',        label: 'Rankings' },
  { href: '/dashboard/agents',          label: 'Agents' },
  { href: '/dashboard/content',         label: 'Content' },
  { href: '/dashboard/competitors',     label: 'Competitors' },
  { href: '/dashboard/ai-readiness',    label: 'AI Readiness' },
  { href: '/dashboard/notifications',   label: 'Notifications' },
  { href: '/dashboard/settings',        label: 'Settings' },
]

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard',                    label: 'Overview' },
  { href: '/dashboard/rankings',           label: 'Rankings' },
  { href: '/dashboard/ai-readiness',       label: 'AI Readiness' },
  { href: '/dashboard/competitors',        label: 'Competitors' },
  { href: '/dashboard/agents',             label: 'AI Agents' },
  { href: '/dashboard/content',            label: 'Content' },
  { href: '/dashboard/recommendations',   label: 'Recommendations' },
  { href: '/dashboard/notifications',      label: 'Notifications' },
  { href: '/dashboard/settings',           label: 'Settings' },
]

function TopNavTab({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150',
        isActive
          ? 'bg-primary text-white font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {label}
    </Link>
  )
}

export function DashboardShell({
  children,
  businessName,
  planTier,
  trialDaysLeft,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Agent chat pages need full-bleed layout (no padding/max-width wrapper)
  const isAgentChat = pathname?.includes('/dashboard/agents/') && pathname !== '/dashboard/agents'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Icon sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar
          businessName={businessName}
          planTier={planTier}
          trialDaysLeft={trialDaysLeft}
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
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col md:hidden">
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
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Mobile navigation">
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
                      'flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
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
      <div className="flex flex-1 flex-col md:pl-[60px]">{/* Matches sidebar width */}
        {/* Top navigation bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 md:px-6">
          {/* Left: Logo + nav tabs */}
          <div className="flex items-center gap-6">
            {/* Mobile: hamburger only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Logo — desktop */}
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 shrink-0"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-white">B</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Beam<span className="text-primary/80">ix</span>
              </span>
            </Link>

            {/* Logo — mobile (centered in header) */}
            <span className="text-sm font-semibold tracking-tight md:hidden">
              Beam<span className="text-primary">ix</span>
            </span>

            {/* Horizontal nav tabs — desktop */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Top navigation">
              {TOP_NAV_TABS.map((tab) => (
                <TopNavTab key={tab.href} href={tab.href} label={tab.label} />
              ))}
            </nav>
          </div>

          {/* Right: Search + notifications + user menu */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard/notifications"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <UserMenu businessName={businessName} planTier={planTier} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto dashboard-bg">
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
