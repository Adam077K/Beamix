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
} from 'lucide-react'
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

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()

  return (
    <aside
      className={`flex flex-col h-full border-r border-[#E5E7EB] bg-white transition-all duration-200 ease-in-out ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Logo area */}
      <div
        className={`flex items-center h-14 px-3 border-b border-[#E5E7EB] ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <span className="text-sm font-semibold text-[#0A0A0A] tracking-tight select-none">
            Beamix
          </span>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-md text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-label={collapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 ${
                isActive
                  ? 'bg-[#3370FF]/8 text-[#3370FF] font-medium'
                  : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F7]'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#3370FF]' : 'text-current'
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3">
        <div
          className={`flex items-center gap-2 px-2.5 py-2 rounded-md ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[#3370FF]/12 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-[#3370FF]">B</span>
          </div>
          {!collapsed && (
            <span className="text-xs text-[#6B7280] truncate">My workspace</span>
          )}
        </div>
      </div>
    </aside>
  )
}
