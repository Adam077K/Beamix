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
  { label: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  { label: 'Content', href: '/dashboard/content', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  businessName: string
  planTier: string
  trialDaysLeft: number | null
}

export function Sidebar({ businessName, planTier, trialDaysLeft }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-[var(--color-card-border)] bg-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--color-card-border)] px-4">
        {!collapsed && (
          <Link href="/dashboard" className="font-display text-lg font-bold text-[var(--color-text)]">
            Beam<span className="text-[var(--color-accent)]">ix</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Trial banner */}
      {trialDaysLeft !== null && trialDaysLeft > 0 && !collapsed && (
        <div className="mx-3 mt-3 rounded-xl bg-gradient-to-r from-cyan-50 to-orange-50 p-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[var(--color-accent-warm)]" />
            <span className="text-xs font-semibold text-[var(--color-text)]">
              {trialDaysLeft} days left in trial
            </span>
          </div>
          <Link
            href="/dashboard/settings"
            className="mt-1 block text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            Upgrade now
          </Link>
        </div>
      )}

      {/* Nav items */}
      <nav className="mt-4 flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-cyan-50 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-card-border)] p-3">
        {!collapsed && (
          <div className="mb-2 truncate text-xs text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-text)]">{businessName}</span>
            <br />
            <span className="capitalize">{planTier} plan</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
