'use client'

import { useState } from 'react'
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
  Menu,
  X,
  Command,
} from 'lucide-react'
import { PlanBadge } from './PlanBadge'
import { NotificationBell } from './NotificationBell'

interface SidebarProps {
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
  inboxUnreadCount?: number
  onOpenCommandPalette?: () => void
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

interface NavListProps {
  pathname: string
  inboxUnreadCount?: number
  onNavClick?: () => void
}

function NavList({ pathname, inboxUnreadCount, onNavClick }: NavListProps) {
  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        const isInbox = href === '/inbox'

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavClick}
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
  )
}

interface SidebarInnerProps {
  user: { email: string }
  plan?: 'discover' | 'build' | 'scale'
  inboxUnreadCount?: number
  onOpenCommandPalette?: () => void
  onNavClick?: () => void
}

function SidebarInner({ user, plan, inboxUnreadCount, onOpenCommandPalette, onNavClick }: SidebarInnerProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-100 shrink-0">
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

      {/* Command palette trigger */}
      {onOpenCommandPalette && (
        <div className="px-2 pt-3 pb-1">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex w-full items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            aria-label="Open command palette"
          >
            <Command size={12} className="shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">Go to...</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1 font-mono text-[10px]">
              <span>⌘</span>
              <span>K</span>
            </span>
          </button>
        </div>
      )}

      {/* Nav */}
      <NavList pathname={pathname} inboxUnreadCount={inboxUnreadCount} onNavClick={onNavClick} />

      {/* Notification bell */}
      <div className="px-2 pb-1">
        <NotificationBell />
      </div>

      {/* User footer */}
      <div className="px-2 py-3 border-t border-gray-100 shrink-0">
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
    </>
  )
}

export function Sidebar({ user, plan, inboxUnreadCount, onOpenCommandPalette }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar — only visible below md */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/beamix_logo_blue_Primary.png"
            alt="Beamix"
            width={22}
            height={22}
            className="shrink-0"
          />
          <span
            className="text-sm font-semibold text-gray-900 tracking-tight"
            style={{ fontFamily: 'InterDisplay, Inter, sans-serif' }}
          >
            Beamix
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside className="relative flex w-72 max-w-[85vw] flex-col min-h-dvh bg-white border-r border-gray-100 shadow-xl">
            {/* Close button row */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo/beamix_logo_blue_Primary.png"
                  alt="Beamix"
                  width={22}
                  height={22}
                  className="shrink-0"
                />
                <span
                  className="text-sm font-semibold text-gray-900 tracking-tight"
                  style={{ fontFamily: 'InterDisplay, Inter, sans-serif' }}
                >
                  Beamix
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
                aria-label="Close navigation menu"
              >
                <X size={16} />
              </button>
            </div>

            <SidebarInner
              user={user}
              plan={plan}
              inboxUnreadCount={inboxUnreadCount}
              onOpenCommandPalette={onOpenCommandPalette ? () => { setMobileOpen(false); onOpenCommandPalette() } : undefined}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — hidden below md */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-gray-100 bg-white shrink-0">
        <SidebarInner
          user={user}
          plan={plan}
          inboxUnreadCount={inboxUnreadCount}
          onOpenCommandPalette={onOpenCommandPalette}
        />
      </aside>
    </>
  )
}
