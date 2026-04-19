'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Home,
  Inbox,
  Radar,
  Zap,
  Archive,
  Users,
  Settings,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const NAV_COMMANDS = [
  { href: '/home', label: 'Home', icon: Home, shortcut: 'H' },
  { href: '/inbox', label: 'Inbox', icon: Inbox, shortcut: 'I' },
  { href: '/scans', label: 'Scans', icon: Radar, shortcut: 'S' },
  { href: '/automation', label: 'Automation', icon: Zap, shortcut: 'A' },
  { href: '/archive', label: 'Archive', icon: Archive, shortcut: 'R' },
  { href: '/competitors', label: 'Competitors', icon: Users, shortcut: 'C' },
  { href: '/settings', label: 'Settings', icon: Settings, shortcut: 'G' },
] as const

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)

  function navigate(href: string) {
    router.push(href)
    onClose()
  }

  // Close on click outside
  useEffect(() => {
    if (!open) return

    function handleMouseDown(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open, onClose])

  // Block body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-[540px] overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.08)]"
        style={{ animation: 'cmdk-panel-in 0.15s ease-out' }}
      >
        <Command
          label="Command palette"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
            }
          }}
          className="flex flex-col"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 text-gray-400"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <Command.Input
              placeholder="Go to..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] text-gray-400">
              Esc
            </kbd>
          </div>

          {/* Command list */}
          <Command.List className="max-h-[320px] overflow-y-auto py-2">
            <Command.Empty className="flex items-center justify-center py-10 text-sm text-gray-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigate" className="px-2">
              {NAV_COMMANDS.map(({ href, label, icon: Icon, shortcut }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => navigate(href)}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors duration-100 data-[selected=true]:bg-gray-50 data-[selected=true]:text-gray-900"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors group-data-[selected=true]:border-gray-300 group-data-[selected=true]:text-gray-900">
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <span className="flex-1 font-medium">{label}</span>
                  <kbd className="hidden items-center gap-0.5 rounded border border-gray-100 bg-gray-50 px-1.5 font-mono text-[10px] text-gray-400 sm:inline-flex">
                    {shortcut}
                  </kbd>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-2.5">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <kbd className="inline-flex h-4 items-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[9px]">
                &uarr;
              </kbd>
              <kbd className="inline-flex h-4 items-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[9px]">
                &darr;
              </kbd>
              <span className="ms-0.5">navigate</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <kbd className="inline-flex h-4 items-center rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[9px]">
                Enter
              </kbd>
              <span>open</span>
            </div>
          </div>
        </Command>
      </div>

      <style>{`
        @keyframes cmdk-panel-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
