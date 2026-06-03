'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  ScanLine,
  Zap,
  Archive,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSidebarStore } from '@/store/sidebar'

const navItems = [
  { href: '/home', label: 'Home', icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/scans', label: 'Scans', icon: ScanLine },
  { href: '/automation', label: 'Automation', icon: Zap },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

// ---------------------------------------------------------------------------
// NavList — shared between the persistent rail and the mobile drawer
// ---------------------------------------------------------------------------

interface NavListProps {
  pathname: string
  /** Hide labels (icon-rail mode). Never true inside the drawer. */
  iconOnly?: boolean
  /** Fired on link tap — closes the mobile drawer. */
  onNavigate?: () => void
}

function NavList({ pathname, iconOnly = false, onNavigate }: NavListProps) {
  return (
    <nav className="flex-1 space-y-0.5 px-2 py-3" aria-label="Main navigation">
      {navItems.map(({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-label={iconOnly ? label : undefined}
            aria-current={isActive ? 'page' : undefined}
            title={iconOnly ? label : undefined}
            className={`flex min-h-[44px] items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 ${
              isActive
                ? 'bg-[#EFF4FF] font-medium text-[#3370FF]'
                : 'text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]'
            } ${iconOnly ? 'justify-center' : ''}`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? 'text-[#3370FF]' : 'text-current'
              }`}
            />
            {!iconOnly && <span className="truncate">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className="px-2 pb-3">
      <div
        className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${
          iconOnly ? 'justify-center' : ''
        }`}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3370FF]/12">
          <span className="text-[10px] font-semibold text-[#3370FF]">B</span>
        </div>
        {!iconOnly && (
          <span className="truncate text-xs text-[#6B7280]">My workspace</span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar — persistent rail (≥768px). Hidden below md; the mobile drawer
// (MobileDrawer) renders instead via the shell.
//
// Breakpoint contract (DESIGN-DIRECTION §4.5):
//   <768px   → hidden here; app-bar + hamburger + overlay drawer
//   768–1024 → 64px icon-rail acceptable (we honor the user's collapse toggle,
//              but the toggle itself is only shown ≥1024px to keep the rail clean)
//   ≥1024px  → full 240px (user may collapse to 64px)
// ---------------------------------------------------------------------------

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()

  // Below lg the rail is always the 64px icon-rail (collapse toggle hidden).
  // At lg+ the user controls expanded (240px) vs collapsed (64px).
  return (
    <aside
      className={`hidden h-full shrink-0 flex-col border-r border-[#E5E7EB] bg-white transition-all duration-200 ease-in-out md:flex md:w-16 ${
        collapsed ? 'lg:w-16' : 'lg:w-60'
      }`}
    >
      {/* Logo / collapse area */}
      <div
        className={`flex h-14 items-center border-b border-[#E5E7EB] px-3 ${
          collapsed ? 'justify-center' : 'lg:justify-between'
        } justify-center`}
      >
        {!collapsed && (
          <span className="hidden select-none text-sm font-semibold tracking-tight text-[#0A0A0A] lg:inline">
            Beamix
          </span>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden rounded-md p-1.5 text-[#6B7280] transition-colors hover:bg-[#F7F7F7] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 lg:block"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Icon-only below lg; honor collapse at lg+ */}
      <div className="hidden flex-1 flex-col lg:flex">
        <NavList pathname={pathname} iconOnly={collapsed} />
        <SidebarFooter iconOnly={collapsed} />
      </div>
      <div className="flex flex-1 flex-col lg:hidden">
        <NavList pathname={pathname} iconOnly />
        <SidebarFooter iconOnly />
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// MobileDrawer — overlay drawer for <768px (fixed inset-0 z-50 + scrim)
// ---------------------------------------------------------------------------

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel — 240px */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`absolute inset-y-0 left-0 flex w-60 flex-col border-r border-[#E5E7EB] bg-white shadow-xl transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-3">
          <span className="select-none text-sm font-semibold tracking-tight text-[#0A0A0A]">
            Beamix
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F7F7F7] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <NavList pathname={pathname} onNavigate={onClose} />
        <SidebarFooter />
      </div>
    </div>
  )
}
