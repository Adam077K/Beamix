'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Crown,
  X,
  Zap,
  Users,
  Bell,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Rankings', href: '/dashboard/rankings', icon: BarChart3 },
  { label: 'AI Readiness', href: '/dashboard/ai-readiness', icon: Zap },
  { label: 'Competitors', href: '/dashboard/competitors', icon: Users },
  { label: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  { label: 'Content', href: '/dashboard/content', icon: FileText },
  { label: 'Recommendations', href: '/dashboard/recommendations', icon: Lightbulb },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  businessName: string
  planTier: string
  trialDaysLeft: number | null
  onClose?: () => void
  className?: string
}

export function Sidebar({ businessName, planTier, trialDaysLeft, onClose, className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  // On mobile (when onClose is set), never collapse — always show full sidebar
  const effectiveCollapsed = collapsed && !onClose

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col transition-all duration-300 ease-in-out',
        'bg-white/95 dark:bg-[#111111]/95',
        'border-e border-[#E5E7EB] dark:border-white/8',
        'shadow-[2px_0_16px_rgba(0,0,0,0.04)]',
        effectiveCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!effectiveCollapsed && (
          <Link href="/dashboard" className="group flex items-center gap-1.5">
            {/* Orange square mark — placeholder until real logo files arrive */}
            <span
              className={cn(
                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[4px] bg-primary',
                'shadow-[0_0_0_3px_rgba(255,60,0,0.15)]',
                'group-hover:shadow-[0_0_0_4px_rgba(255,60,0,0.20)]',
                'transition-shadow duration-200',
              )}
              aria-hidden="true"
            />
            <span className="font-sans text-[17px] font-semibold tracking-[-0.02em] text-foreground">
              Beam<span className="text-primary">ix</span>
            </span>
          </Link>
        )}
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 md:flex items-center justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Trial banner */}
      {trialDaysLeft !== null && trialDaysLeft > 0 && !effectiveCollapsed && (
        <div
          className={cn(
            'mx-3 mt-3 rounded-xl p-3',
            'gradient-upgrade-card',
            'border border-[#FFCFC4] dark:border-[#FF3C00]/20',
            'shadow-[0_2px_8px_rgba(255,60,0,0.06)]',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold text-foreground">
                {trialDaysLeft}d left
              </span>
            </div>
            <Link
              href="/dashboard/settings"
              className={cn(
                'rounded-full bg-primary/10 px-2 py-0.5',
                'text-[10px] font-semibold text-primary',
                'hover:bg-primary/15 transition-colors duration-150',
              )}
            >
              Upgrade
            </Link>
          </div>
          {/* Progress bar for trial days */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (trialDaysLeft / 7) * 100)}%` }}
              aria-label={`${trialDaysLeft} of 7 trial days remaining`}
            />
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="mt-4 flex-1 space-y-1 px-2" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={effectiveCollapsed ? item.label : undefined}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? [
                      'bg-primary/8 dark:bg-primary/12 text-primary',
                      'shadow-[inset_0_0_0_1px_rgba(255,60,0,0.15)]',
                    ]
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:rounded-xl',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-200',
                  isActive ? 'text-primary' : 'group-hover:text-foreground'
                )}
              />
              {!effectiveCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-border p-3">
        {!effectiveCollapsed && (
          <div className="mb-2 flex items-center gap-2.5 px-1">
            {/* Avatar placeholder */}
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15"
              aria-hidden="true"
            >
              <span className="text-[10px] font-semibold uppercase text-primary">
                {businessName.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{businessName}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{planTier} plan</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          title={effectiveCollapsed ? 'Sign out' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
            'text-muted-foreground transition-colors duration-150',
            'hover:bg-red-50 hover:text-red-600',
            'dark:hover:bg-red-950/50 dark:hover:text-red-400',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!effectiveCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
