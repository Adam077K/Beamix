'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Overview',       href: '/dashboard',                icon: LayoutDashboard },
  { label: 'Rankings',       href: '/dashboard/rankings',       icon: BarChart3 },
  { label: 'Action Center',  href: '/dashboard/action-center',  icon: Zap },
  { label: 'Content',        href: '/dashboard/content',        icon: FileText },
  { label: 'Settings',       href: '/dashboard/settings',       icon: Settings },
]

interface SidebarProps {
  businessName: string
  planTier: string
  trialDaysLeft: number | null
  className?: string
}

export function Sidebar({ businessName, planTier, trialDaysLeft, className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <aside
      className={cn(
        'fixed top-0 z-30 flex h-screen w-[220px] flex-col',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l border-border bg-white',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3370FF]">
            <span className="text-xs font-bold text-white">B</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Beamix
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150',
                active
                  ? 'bg-[#EBF0FF] text-[#3370FF] border-l-2 border-[#3370FF] -ml-px'
                  : 'text-[#6B7280] hover:bg-[#F6F7F9] hover:text-[#111827]'
              )}
            >
              <Icon className={cn('size-[18px]', active ? 'text-[#3370FF]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        {/* Trial badge */}
        {trialDaysLeft !== null && trialDaysLeft > 0 && (
          <div className="rounded-md bg-[#EBF0FF] px-3 py-2">
            <p className="text-xs font-medium text-[#3370FF]">
              {trialDaysLeft} days left in trial
            </p>
            <Link href="/pricing" className="mt-1 block text-[11px] text-[#3370FF]/70 hover:text-[#3370FF] underline">
              Upgrade now
            </Link>
          </div>
        )}

        {/* Business info */}
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6F7F9]">
            <span className="text-xs font-semibold text-[#6B7280]">{businessInitial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">{businessName}</p>
            <p className="text-[11px] capitalize text-[#9CA3AF]">{planTier} plan</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-[#9CA3AF] hover:bg-[#F6F7F9] hover:text-[#6B7280] transition-colors"
        >
          <LogOut className="size-[16px]" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
