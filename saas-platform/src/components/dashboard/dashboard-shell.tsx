'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserMenu } from '@/components/dashboard/user-menu'
import { NotificationDropdown } from '@/components/ui/notification-dropdown'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  body: string | null
  type: string | null
  is_read: boolean
  created_at: string
}

interface DashboardShellProps {
  children: React.ReactNode
  businessName: string
  planTier: string
  trialDaysLeft: number | null
  notifications?: Notification[]
}

const MOBILE_NAV = [
  { label: 'Overview',       href: '/dashboard',               icon: LayoutDashboard },
  { label: 'Rankings',       href: '/dashboard/rankings',      icon: BarChart3 },
  { label: 'Action Center',  href: '/dashboard/action-center', icon: Zap },
  { label: 'Content',        href: '/dashboard/content',       icon: FileText },
  { label: 'Settings',       href: '/dashboard/settings',      icon: Settings },
]

export function DashboardShell({
  children,
  businessName,
  planTier,
  trialDaysLeft,
  notifications = [],
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!mobileOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen])

  // Agent chat pages need full-bleed layout
  const isAgentChat = pathname?.includes('/dashboard/agents/') && pathname !== '/dashboard/agents'

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="dashboard-theme flex h-screen overflow-hidden bg-background">
      {/* 220px sidebar — desktop only */}
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
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 ltr:left-0 rtl:right-0 z-50 w-[260px] bg-white ltr:border-r rtl:border-l border-border flex flex-col md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-14 items-center justify-between px-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3370FF]">
                  <span className="text-xs font-bold text-white">B</span>
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  Beamix
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main navigation">
              {MOBILE_NAV.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-[#EBF0FF] text-[#3370FF]'
                        : 'text-[#6B7280] hover:bg-[#F6F7F9] hover:text-[#111827]'
                    )}
                  >
                    <Icon className={cn('size-[18px]', active ? 'text-[#3370FF]' : 'text-[#9CA3AF]')} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6F7F9]">
                  <span className="text-xs font-semibold text-[#6B7280]">
                    {businessName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{businessName}</p>
                  <p className="text-xs capitalize text-[#9CA3AF]">{planTier} plan</p>
                </div>
              </div>
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="mt-3 flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col ltr:md:pl-[220px] rtl:md:pr-[220px]">
        {/* Top bar — clean, minimal */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-white px-4 md:px-6">
          {/* Left: hamburger (mobile) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-[18px]" />
            </button>

            {/* Mobile logo */}
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3370FF]">
                <span className="text-[10px] font-bold text-white">B</span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Beamix
              </span>
            </Link>
          </div>

          {/* Right: bell + user menu */}
          <div className="flex items-center gap-1.5">
            {trialDaysLeft !== null && trialDaysLeft > 0 && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center rounded-md bg-[#EBF0FF] px-2.5 py-1 text-xs font-medium text-[#3370FF] hover:bg-[#EBF0FF]/80 transition-colors"
              >
                {trialDaysLeft}d trial left
              </Link>
            )}
            {trialDaysLeft !== null && trialDaysLeft <= 0 && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                Trial expired
              </Link>
            )}
            <NotificationDropdown notifications={notifications} />
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
