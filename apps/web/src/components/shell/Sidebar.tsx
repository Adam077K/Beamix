'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Inbox,
  Radar,
  Zap,
  Archive,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PlanBadge } from './PlanBadge'
import { NotificationBell } from './NotificationBell'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
  inboxUnreadCount?: number
}

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/scans', label: 'Scans', icon: Radar },
  { href: '/automation', label: 'Automation', icon: Zap },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

/** Derive initials from an email address for the avatar fallback */
function emailInitials(email: string): string {
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._\-+]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

export function Sidebar({ user, plan, inboxUnreadCount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = emailInitials(user.email)
  const isDiscover = !plan || plan === 'discover'

  return (
    <aside className="flex flex-col w-60 min-h-screen border-r border-[#E5E7EB] bg-white shrink-0">
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#E5E7EB]">
        <div className="relative w-6 h-6 shrink-0">
          <Image
            src="/logo/beamix_logo_blue_Primary.png"
            alt="Beamix logo mark"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-[15px] font-semibold text-[#0A0A0A] tracking-tight leading-none">
          Beamix
        </span>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isInbox = href === '/inbox'
          const hasUnread = isInbox && typeof inboxUnreadCount === 'number' && inboxUnreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 group outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isActive
                  ? 'bg-[#EFF4FF] text-[#0A0A0A] font-medium'
                  : 'text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active left-edge indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-[#3370FF]"
                  aria-hidden="true"
                />
              )}

              <Icon
                size={16}
                aria-hidden="true"
                className={cn(
                  'shrink-0 transition-colors duration-150',
                  isActive
                    ? 'text-[#3370FF]'
                    : 'text-[#9CA3AF] group-hover:text-[#6B7280]',
                )}
              />

              <span className="flex-1 truncate">{label}</span>

              {/* Unread badge for Inbox */}
              {hasUnread && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#3370FF] text-white text-[10px] font-semibold leading-none"
                  aria-label={`${inboxUnreadCount} unread`}
                >
                  {inboxUnreadCount! > 99 ? '99+' : inboxUnreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Upgrade prompt (Discover tier only) ─────────────────────── */}
      {isDiscover && (
        <div className="mx-2 mb-2 rounded-xl bg-gradient-to-br from-[#EFF4FF] to-[#DBEAFE] border border-[#BFDBFE] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-[#3370FF]" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-[#3370FF] uppercase tracking-wide">
              Unlock agents
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-relaxed mb-2">
            Upgrade to Build — let agents fix your AI search visibility.
          </p>
          <Link
            href="/settings?tab=billing"
            className="block w-full text-center rounded-lg bg-[#3370FF] text-white text-[11px] font-medium py-1.5 transition-colors duration-150 hover:bg-[#2558E8] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            See plans
          </Link>
        </div>
      )}

      {/* ── Notification bell ────────────────────────────────────────── */}
      <div className="px-2 pb-1">
        <NotificationBell userEmail={user.email} />
      </div>

      {/* ── User footer ──────────────────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3370FF] text-white text-[10px] font-semibold shrink-0 select-none"
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* Email + plan */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-[#0A0A0A] truncate leading-tight">
              {user.email}
            </p>
            {plan && (
              <div className="mt-0.5">
                <PlanBadge tier={plan} />
              </div>
            )}
          </div>

          <ChevronUp size={12} className="text-[#9CA3AF] shrink-0" aria-hidden="true" />
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] text-[#9CA3AF] hover:text-[#EF4444] transition-colors duration-150 rounded-md hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-1 mt-0.5"
        >
          <LogOut size={12} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
