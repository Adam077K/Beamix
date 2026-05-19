'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
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
} from 'lucide-react'
import { PlanBadge } from './PlanBadge'
import { NotificationBell } from './NotificationBell'

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

// ─── Sidebar panel (shared by desktop and mobile overlay) ───────────────────

interface SidebarPanelProps extends SidebarProps {
  onClose?: () => void
}

function SidebarPanel({ user, plan, inboxUnreadCount, onClose }: SidebarPanelProps) {
  const pathname = usePathname()

  function handleNavClick() {
    onClose?.()
  }

  return (
    <aside
      className="flex flex-col w-60 min-h-screen border-r border-gray-100 bg-white shrink-0"
      aria-label="Main navigation"
    >
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

        {/* Close button — mobile only */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex items-center justify-center size-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            aria-label="Close navigation"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="App navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isInbox = href === '/inbox'

          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group ${
                isActive
                  ? 'bg-gray-50 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
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
                aria-hidden="true"
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

      {/* Notification bell */}
      <div className="px-2 pb-1">
        <NotificationBell />
      </div>

      {/* User footer */}
      <div className="px-2 py-3 border-t border-gray-100">
        <div className="flex flex-col gap-2 px-3 py-2 rounded-md">
          {/* Email + plan */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <ChevronDown size={12} className="text-gray-400 shrink-0" aria-hidden="true" />
          </div>

          {plan && (
            <PlanBadge tier={plan} />
          )}

          {/* Upgrade link — build tier only */}
          {plan === 'build' && (
            <Link
              href="/settings?tab=billing"
              className="text-xs text-[#3370FF] hover:underline underline-offset-2 transition-colors"
            >
              Upgrade to Scale &rarr;
            </Link>
          )}

          {/* Sign out */}
          <button
            type="button"
            onClick={() => console.log('sign out')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <LogOut size={12} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Main Sidebar export ─────────────────────────────────────────────────────

export function Sidebar({ user, plan, inboxUnreadCount }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const closeDrawer = useCallback(() => {
    setMobileOpen(false)
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeDrawer()
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, closeDrawer])

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Focus first focusable element in drawer when opened
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()
  }, [mobileOpen])

  // Focus trap inside drawer
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return
    const drawer = drawerRef.current

    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onTab)
    return () => document.removeEventListener('keydown', onTab)
  }, [mobileOpen])

  return (
    <>
      {/* ── Desktop sidebar (≥ 768px) ──────────────────────────────────────── */}
      <div className="hidden md:flex">
        <SidebarPanel user={user} plan={plan} inboxUnreadCount={inboxUnreadCount} />
      </div>

      {/* ── Mobile header bar (< 768px) ────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-4 bg-white border-b border-gray-100">
        <button
          ref={hamburgerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center size-9 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 ml-2">
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
      </div>

      {/* ── Mobile offset spacer so content doesn't sit behind fixed header ─ */}
      <div className="md:hidden h-14 shrink-0" aria-hidden="true" />

      {/* ── Mobile overlay + drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            ref={overlayRef}
            className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            aria-hidden="true"
            onClick={closeDrawer}
          />

          {/* Slide-in drawer */}
          <div
            id="mobile-sidebar"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-60 shadow-xl"
            style={{
              animation: 'slideInLeft 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <SidebarPanel
              user={user}
              plan={plan}
              inboxUnreadCount={inboxUnreadCount}
              onClose={closeDrawer}
            />
          </div>
        </>
      )}

      {/* Slide-in keyframe */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
