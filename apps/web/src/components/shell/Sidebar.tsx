'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Inbox,
  Radar,
  Zap,
  Archive,
  Users,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { PlanBadge } from './PlanBadge'

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

export function Sidebar({ user, plan, inboxUnreadCount }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 min-h-screen border-r border-gray-100 bg-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-100">
        <Image
          src="/logo/beamix_logo_blue_Primary.png"
          alt="Beamix"
          width={24}
          height={24}
          className="shrink-0"
        />
        <span
          className="text-sm font-semibold text-gray-900 tracking-tight"
          style={{ fontFamily: 'InterDisplay, Inter, sans-serif' }}
        >
          Beamix
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isInbox = href === '/inbox'

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group ${
                isActive
                  ? 'bg-gray-50 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#3370FF]" />
              )}

              <Icon
                size={16}
                className={`shrink-0 ${
                  isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />

              <span className="flex-1">{label}</span>

              {/* Inbox badge */}
              {isInbox && typeof inboxUnreadCount === 'number' && inboxUnreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#3370FF] text-white text-[10px] font-semibold leading-none">
                  {inboxUnreadCount > 99 ? '99+' : inboxUnreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-2 py-3 border-t border-gray-100">
        <div className="flex flex-col gap-2 px-3 py-2 rounded-md">
          {/* Email + plan */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <ChevronDown size={12} className="text-gray-400 shrink-0" />
          </div>

          {plan && (
            <PlanBadge tier={plan} />
          )}

          {/* Sign out */}
          <button
            type="button"
            onClick={() => console.log('sign out')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
