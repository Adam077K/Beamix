'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  LayoutDashboard,
  Inbox,
  ScanLine,
  Zap,
  Archive,
  Users,
  Settings,
  Search,
} from 'lucide-react'

const routes = [
  { href: '/home', label: 'Home', icon: LayoutDashboard, group: 'Navigate' },
  { href: '/inbox', label: 'Inbox', icon: Inbox, group: 'Navigate' },
  { href: '/scans', label: 'Scans', icon: ScanLine, group: 'Navigate' },
  { href: '/automation', label: 'Automation', icon: Zap, group: 'Navigate' },
  { href: '/archive', label: 'Archive', icon: Archive, group: 'Navigate' },
  { href: '/competitors', label: 'Competitors', icon: Users, group: 'Navigate' },
  { href: '/settings', label: 'Settings', icon: Settings, group: 'Navigate' },
]

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const router = useRouter()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const handleOpenChange = useCallback(
    (value: boolean) => setOpen(value),
    [setOpen]
  )

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [setOpen, isOpen])

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
      setOpen(false)
    },
    [router, setOpen]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={() => handleOpenChange(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-[#E5E7EB] bg-white shadow-xl overflow-hidden">
        <Command className="flex flex-col">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
            <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search or navigate…"
              className="flex-1 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] bg-transparent outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#E5E7EB] text-[10px] font-medium text-[#9CA3AF] tracking-wide">
              ESC
            </kbd>
          </div>

          {/* List */}
          <Command.List className="max-h-72 overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigate"
              className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-[#9CA3AF]"
            >
              {routes.map(({ href, label, icon: Icon }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => navigate(href)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] cursor-default transition-colors aria-selected:bg-[#3370FF]/6 aria-selected:text-[#3370FF] hover:bg-[#F7F7F7]"
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#9CA3AF] aria-selected:text-[#3370FF]" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer hint */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#E5E7EB]">
            <span className="text-[11px] text-[#9CA3AF]">
              <kbd className="font-medium">↑↓</kbd> navigate
            </span>
            <span className="text-[11px] text-[#9CA3AF]">
              <kbd className="font-medium">↵</kbd> select
            </span>
            <span className="text-[11px] text-[#9CA3AF]">
              <kbd className="font-medium">⌘K</kbd> close
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
