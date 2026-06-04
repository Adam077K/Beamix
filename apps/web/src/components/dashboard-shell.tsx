'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Search, Menu } from 'lucide-react'
import { Sidebar, MobileDrawer } from '@/components/sidebar'
import { CommandPalette } from '@/components/command-palette'

interface DashboardShellProps {
  /** Rendered top-right of the top bar. Wave 1 FE-1 injects NotificationBell here. */
  notificationBell?: ReactNode
  /** Full-width banner above content area. Wave 1 FE-3 injects PreviewBanner here. */
  previewBanner?: ReactNode
  /** Full-width banner above previewBanner. Wave 1 FE-3 injects KillSwitchBanner here. */
  killSwitchBanner?: ReactNode
  children: ReactNode
}

export function DashboardShell({
  notificationBell,
  previewBanner,
  killSwitchBanner,
  children,
}: DashboardShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Persistent rail — hidden below md (drawer takes over) */}
      <Sidebar />

      {/* Mobile overlay drawer — only renders below md */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — toolbar with a floor (border-b) */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E5E7EB] bg-white px-4">
          {/* Left — hamburger (mobile only) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F7F7F7] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search — muted utility, NOT the loudest element.
                Full field ≥sm; collapses to an icon button below sm. */}
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="hidden h-9 w-full max-w-[280px] items-center gap-2 rounded-md border border-transparent bg-[#F2F2F2] px-3 text-[13px] text-[#9CA3AF] transition-colors hover:bg-[#ECECEC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F7F7F7] hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Right slot — notificationBell injected by Wave 1 FE-1 */}
          <div className="flex items-center gap-2">
            {notificationBell ?? null}
          </div>
        </header>

        {/* Banner slots — stacked, full-width */}
        {killSwitchBanner ?? null}
        {previewBanner ?? null}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Command palette — portal-style, rendered at shell level */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
