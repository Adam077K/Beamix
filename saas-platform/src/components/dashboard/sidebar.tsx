'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  FileText,
  Settings,
  LogOut,
  Users,
  Bell,
  Lightbulb,
  ScanSearch,
  Shield,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from './sidebar-context'

const MAIN_NAV = [
  { label: 'Overview',     href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Rankings',     href: '/dashboard/rankings',     icon: BarChart3 },
  { label: 'AI Readiness', href: '/dashboard/ai-readiness', icon: Shield },
  { label: 'Competitors',  href: '/dashboard/competitors',  icon: Users },
]

const TOOLS_NAV = [
  { label: 'Scan',             href: '/dashboard/scan',            icon: ScanSearch },
  { label: 'AI Agents',        href: '/dashboard/agents',          icon: Bot },
  { label: 'Recommendations',  href: '/dashboard/recommendations', icon: Lightbulb },
  { label: 'Content Library',  href: '/dashboard/content',         icon: FileText },
]

interface SidebarProps {
  businessName: string
  planTier?: string
  trialDaysLeft?: number
  className?: string
}

export function Sidebar({ businessName, planTier, trialDaysLeft, className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, toggle } = useSidebar()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isItemActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const businessInitial = businessName ? businessName.charAt(0).toUpperCase() : 'B'
  const showTrialBanner = !collapsed && trialDaysLeft !== undefined && trialDaysLeft > 0
  const trialProgress = trialDaysLeft !== undefined ? Math.max(0, Math.min(100, (trialDaysLeft / 7) * 100)) : 0

  return (
    <aside
      className={cn(
        'fixed top-0 z-30 flex h-screen flex-col',
        'ltr:left-0 rtl:right-0',
        'ltr:border-r rtl:border-l border-border bg-card',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo zone */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-white">B</span>
            </div>
            <span className="text-sm font-semibold tracking-tight truncate">
              Beam<span className="text-primary">ix</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-white">B</span>
          </Link>
        )}
        <button
          onClick={toggle}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground',
            'hover:bg-muted hover:text-foreground transition-colors',
            collapsed && 'hidden'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={toggle}
          className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3" aria-label="Main navigation">
        {/* MAIN section */}
        <div className="mb-4">
          {!collapsed && (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Main
            </p>
          )}
          <div className="space-y-0.5">
            {MAIN_NAV.map((item) => {
              const active = isItemActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                    active
                      ? 'bg-primary/8 text-primary font-medium ltr:border-l-2 rtl:border-r-2 border-primary ltr:rounded-l-none rtl:rounded-r-none'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </div>

        {/* TOOLS section */}
        <div className="mb-4">
          {!collapsed && (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Tools
            </p>
          )}
          {collapsed && <div className="my-2 h-px mx-2 bg-border" />}
          <div className="space-y-0.5">
            {TOOLS_NAV.map((item) => {
              const active = isItemActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                    active
                      ? 'bg-primary/8 text-primary font-medium ltr:border-l-2 rtl:border-r-2 border-primary ltr:rounded-l-none rtl:rounded-r-none'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Trial banner */}
      {showTrialBanner && (
        <div className="mx-2 mb-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-3">
          <p className="text-[11px] font-medium text-orange-800 mb-1">{trialDaysLeft} days left in trial</p>
          <div className="h-1 w-full rounded-full bg-orange-100 mb-2">
            <div
              className="h-1 rounded-full bg-primary transition-all"
              style={{ width: `${trialProgress}%` }}
            />
          </div>
          <Link
            href="/pricing"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Upgrade now
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border px-2 py-2">
        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          title={collapsed ? 'Notifications' : undefined}
          className={cn(
            'flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
            pathname.startsWith('/dashboard/notifications')
              ? 'bg-primary/8 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </Link>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-primary/8 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          type="button"
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* User avatar */}
        <div
          className={cn(
            'mt-2 flex items-center gap-2.5 rounded-lg px-2 py-2',
            collapsed && 'justify-center px-0'
          )}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            title={businessName}
          >
            <span className="text-xs font-semibold">{businessInitial}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{businessName}</p>
              {planTier && (
                <p className="text-[11px] capitalize text-muted-foreground">{planTier} plan</p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
