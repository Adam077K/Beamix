'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
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
  /**
   * Opt OUT of the shared centered content frame (UIX-F1).
   * By default every page renders inside one shared track —
   * `mx-auto w-full max-w-[1200px] px-6 sm:px-8 py-8` — so pages stop
   * reinventing (and disagreeing on) their own frame. This was the root cause
   * of the team dead-space, the settings orphan column, and the reports clip.
   *
   * Set `fullBleed` when a page needs a wider/edge-to-edge track (e.g. the
   * reports export drawer's third zone, a full-bleed dense table). The page is
   * then responsible for its own padding/centering.
   */
  fullBleed?: boolean
  children: ReactNode
}

export function DashboardShell({
  notificationBell,
  previewBanner,
  killSwitchBanner,
  fullBleed = false,
  children,
}: DashboardShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ⌘K / Ctrl+K opens the command palette from anywhere in the shell.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

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

            {/* Search — muted utility, NOT the loudest element. Opens the
                command palette (scoped: scans, agents, settings). Carries a
                ⌘K hint so the affordance reads as a real search entry, not a
                dead stub. Full field ≥sm; collapses to an icon button below sm. */}
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search scans, agents, and settings"
              aria-keyshortcuts="Meta+K Control+K"
              className="hidden h-9 w-full max-w-[280px] items-center gap-2 rounded-md border border-transparent bg-[#F2F2F2] px-3 text-[13px] text-[#9CA3AF] transition-colors hover:bg-[#ECECEC] hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 sm:flex"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">Search</span>
              <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-[#E5E7EB] bg-white px-1.5 py-0.5 font-mono text-[11px] leading-none text-[#9CA3AF] md:inline-flex">
                <span className="text-[12px]">⌘</span>K
              </kbd>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search scans, agents, and settings"
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

        {/* Content area.
            Shared content frame (UIX-F1): one centered track every page sits
            inside — `mx-auto w-full max-w-[1200px] px-6 sm:px-8 py-8` — so pages
            stop reinventing (and disagreeing on) their own frame. Pages that
            need an edge-to-edge / wider track pass `fullBleed` and own their
            own padding. */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          {fullBleed ? (
            <div className="h-full">{children}</div>
          ) : (
            <div className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-8">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Command palette — portal-style, rendered at shell level */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
