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
  X,
  Zap,
  Users,
  Bell,
  Lightbulb,
  HelpCircle,
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
        'flex h-screen flex-col transition-all duration-200',
        'bg-card dark:bg-[#111]',
        'border-e border-border',
        effectiveCollapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Logo + workspace */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!effectiveCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary" aria-hidden="true">
              <span className="text-[10px] font-bold text-white">B</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{businessName}</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary" aria-hidden="true">
              <span className="text-[10px] font-bold text-white">B</span>
            </div>
          </Link>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!onClose && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden p-1 text-muted-foreground hover:text-foreground transition-colors md:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-3 flex-1 space-y-0.5 px-2" aria-label="Main navigation">
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
                'flex items-center gap-3 py-[7px] text-[13px] transition-colors duration-150',
                effectiveCollapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'border-s-[3px] border-foreground text-foreground font-semibold'
                  : 'border-s-[3px] border-transparent text-muted-foreground hover:text-foreground'
              )}
              style={isActive && !effectiveCollapsed ? { paddingInlineStart: 'calc(0.75rem - 3px)' } : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!effectiveCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-2 py-3 space-y-0.5">
        {/* Settings */}
        {!effectiveCollapsed ? (
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-[7px] text-[13px] transition-colors duration-150',
              pathname.startsWith('/dashboard/settings')
                ? 'border-s-[3px] border-foreground text-foreground font-semibold'
                : 'border-s-[3px] border-transparent text-muted-foreground hover:text-foreground'
            )}
            style={pathname.startsWith('/dashboard/settings') ? { paddingInlineStart: 'calc(0.75rem - 3px)' } : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
        ) : (
          <Link
            href="/dashboard/settings"
            title="Settings"
            className="flex justify-center py-[7px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}

        {/* Support link */}
        {!effectiveCollapsed && (
          <button
            className="flex w-full items-center gap-3 px-3 py-[7px] text-[13px] text-muted-foreground hover:text-foreground transition-colors border-s-[3px] border-transparent"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            Support
          </button>
        )}

        {/* User section */}
        <div className={cn(
          'flex items-center gap-2.5 pt-3 mt-2 border-t border-border',
          effectiveCollapsed ? 'justify-center px-1' : 'px-3'
        )}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted" aria-hidden="true">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              {businessName.charAt(0)}
            </span>
          </div>
          {!effectiveCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{businessName}</p>
                {trialDaysLeft !== null && trialDaysLeft > 0 ? (
                  <p className="text-[10px] text-muted-foreground">{trialDaysLeft}d trial · <Link href="/dashboard/settings" className="text-primary hover:underline">Upgrade</Link></p>
                ) : (
                  <p className="text-[10px] capitalize text-muted-foreground">{planTier} plan</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
