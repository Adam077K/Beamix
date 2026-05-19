'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-[#E5E7EB] bg-white shrink-0">
          {/* ⌘K trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette (⌘K)"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E5E7EB] text-sm text-[#9CA3AF] bg-[#F7F7F7] hover:bg-white hover:border-[#D1D5DB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded border border-[#E5E7EB] text-[10px] font-medium text-[#9CA3AF] tracking-wide bg-white">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </button>

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
