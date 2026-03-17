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
        'flex h-screen flex-col bg-card border-e border-border transition-all duration-200',
        effectiveCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!effectiveCollapsed && (
          <Link href="/dashboard" className="font-sans text-xl font-bold text-foreground">
            Beam<span className="text-primary">ix</span>
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
          className="hidden rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Trial banner */}
      {trialDaysLeft !== null && trialDaysLeft > 0 && !effectiveCollapsed && (
        <div className="mx-3 mt-3 rounded-xl bg-gradient-to-r from-[#FFF5F2] to-[#FFF0EB] p-3 dark:from-[#FF3C00]/10 dark:to-[#FF3C00]/5">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 animate-pulse text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {trialDaysLeft} days left in trial
            </span>
          </div>
          <Link
            href="/dashboard/settings"
            className="mt-1 block text-xs font-medium text-primary hover:underline"
          >
            Upgrade now
          </Link>
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
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#FFF5F2] text-primary font-semibold border-s-2 border-primary dark:bg-[#FF3C00]/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-primary' : ''
                )}
              />
              {!effectiveCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {!effectiveCollapsed && (
          <div className="mb-2 truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{businessName}</span>
            <br />
            <span className="capitalize">{planTier} plan</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          title={effectiveCollapsed ? 'Sign out' : undefined}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-50/70 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!effectiveCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
