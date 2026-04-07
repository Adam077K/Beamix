'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  Search,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from './sidebar-context'

const NAV_ITEMS = [
  { label: 'Overview',         href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Rankings',         href: '/dashboard/rankings',     icon: BarChart3 },
  { label: 'AI Readiness',     href: '/dashboard/ai-readiness', icon: Shield },
  { label: 'Competitors',      href: '/dashboard/competitors',  icon: Users },
  // spacing gap handled by separator
  { label: 'Scan',             href: '/dashboard/scan',         icon: ScanSearch },
  { label: 'AI Agents',        href: '/dashboard/agents',       icon: Bot },
  { label: 'Recommendations',  href: '/dashboard/recommendations', icon: Lightbulb },
  { label: 'Content Library',  href: '/dashboard/content',      icon: FileText },
]

const SEPARATOR_AFTER_INDEX = 3

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

  function openCommandPalette() {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    )
  }

  const businessInitial = businessName ? businessName.charAt(0).toUpperCase() : 'B'
  const showTrialBanner = !collapsed && trialDaysLeft !== undefined && trialDaysLeft > 0

  return (
    <aside
      className={cn(
        'fixed top-0 z-30 flex h-screen flex-col',
        'ltr:left-0 rtl:right-0',
        'ltr:border-r rtl:border-l border-border bg-card',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* ── Top: Logo + Collapse ── */}
      <div className={cn(
        'flex shrink-0 items-center border-b border-border',
        collapsed ? 'h-14 justify-center px-2' : 'h-14 justify-between px-3'
      )}>
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 min-w-0',
            collapsed && 'justify-center'
          )}
        >
          <Image
            src="/logo/beamix_logo_blue_Primary.svg"
            alt="Beamix"
            width={22}
            height={22}
            className="shrink-0"
          />
          {!collapsed && (
            <span className="text-[13px] font-semibold text-foreground tracking-tight">
              Beamix
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={toggle}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors duration-150"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Search trigger (Vercel-style) ── */}
      {!collapsed ? (
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={openCommandPalette}
            className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-2.5 py-[7px] text-[13px] text-muted-foreground/70 hover:text-muted-foreground hover:border-foreground/20 transition-colors duration-150"
            aria-label="Search (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] font-mono text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded border border-border">
              /
            </kbd>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 pt-2">
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors duration-150"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={openCommandPalette}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors duration-150"
            aria-label="Search"
            title="Search (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav
        className={cn(
          'flex flex-1 flex-col overflow-y-auto',
          collapsed ? 'px-2 pt-1' : 'px-2 pt-2'
        )}
        aria-label="Main navigation"
      >
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item, index) => {
            const active = isItemActive(item.href)
            return (
              <div key={item.href}>
                {index === SEPARATOR_AFTER_INDEX + 1 && (
                  <div className="my-3" />
                )}
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center rounded-md text-[13px] transition-colors duration-150',
                    collapsed
                      ? 'h-8 w-8 mx-auto justify-center'
                      : 'h-8 w-full gap-2.5 px-2',
                    active
                      ? 'bg-foreground/[0.06] text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
                  )}
                >
                  <item.icon className={cn(
                    'shrink-0',
                    collapsed ? 'h-4 w-4' : 'h-[15px] w-[15px]',
                    active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Trial banner */}
        {showTrialBanner && (
          <div className="mx-3 mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Trial · {trialDaysLeft}d left</span>
            <Link href="/pricing" className="text-[#3370FF] font-medium hover:underline">Upgrade</Link>
          </div>
        )}
      </nav>

      {/* ── Bottom: Notifications + Settings + User ── */}
      <div className="border-t border-border">
        {/* Notifications + Settings row */}
        <div className={cn(
          'space-y-0.5',
          collapsed ? 'px-2 pt-2' : 'px-2 pt-2'
        )}>
          <Link
            href="/dashboard/notifications"
            title={collapsed ? 'Notifications' : undefined}
            className={cn(
              'group flex items-center rounded-md text-[13px] transition-colors duration-150',
              collapsed
                ? 'h-8 w-8 mx-auto justify-center'
                : 'h-8 w-full gap-2.5 px-2',
              pathname.startsWith('/dashboard/notifications')
                ? 'bg-foreground/[0.06] text-foreground font-medium'
                : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
            )}
          >
            <Bell className={cn(
              'shrink-0',
              collapsed ? 'h-4 w-4' : 'h-[15px] w-[15px]'
            )} />
            {!collapsed && <span>Notifications</span>}
          </Link>

          <Link
            href="/dashboard/settings"
            title={collapsed ? 'Settings' : undefined}
            className={cn(
              'group flex items-center rounded-md text-[13px] transition-colors duration-150',
              collapsed
                ? 'h-8 w-8 mx-auto justify-center'
                : 'h-8 w-full gap-2.5 px-2',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-foreground/[0.06] text-foreground font-medium'
                : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
            )}
          >
            <Settings className={cn(
              'shrink-0',
              collapsed ? 'h-4 w-4' : 'h-[15px] w-[15px]'
            )} />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>

        {/* User area (Vercel-style bottom bar) */}
        <div className={cn(
          'border-t border-border',
          collapsed ? 'px-2 py-2' : 'px-2 py-2'
        )}>
          <div className={cn(
            'flex items-center rounded-md transition-colors duration-150',
            collapsed ? 'justify-center py-1' : 'gap-2.5 px-2 py-1.5'
          )}>
            {/* Avatar */}
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
              title={businessName}
            >
              <span className="text-[11px] font-semibold">{businessInitial}</span>
            </div>

            {!collapsed && (
              <>
                {/* Name + plan */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground leading-tight">
                    {businessName}
                  </p>
                  {planTier && (
                    <p className="text-[11px] capitalize text-muted-foreground leading-tight">
                      {planTier}
                    </p>
                  )}
                </div>

                {/* Actions: more menu + sign out */}
                <button
                  onClick={handleSignOut}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors duration-150"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {collapsed && (
              <button
                onClick={handleSignOut}
                className="mt-1 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors duration-150"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
