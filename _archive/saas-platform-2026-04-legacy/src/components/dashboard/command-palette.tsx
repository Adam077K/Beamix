'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, BarChart3, Bot, FileText, Settings, Users,
  Bell, Lightbulb, ScanSearch, Shield, Search, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  action?: () => void
  section: string
  keywords?: string[]
}

const COMMANDS: CommandItem[] = [
  // Pages
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard', section: 'Pages', keywords: ['home', 'dashboard'] },
  { id: 'rankings', label: 'Rankings', icon: BarChart3, href: '/dashboard/rankings', section: 'Pages', keywords: ['visibility', 'score'] },
  { id: 'ai-readiness', label: 'AI Readiness', icon: Shield, href: '/dashboard/ai-readiness', section: 'Pages', keywords: ['audit', 'crawl'] },
  { id: 'competitors', label: 'Competitors', icon: Users, href: '/dashboard/competitors', section: 'Pages', keywords: ['competition'] },
  { id: 'scan', label: 'Run Scan', icon: ScanSearch, href: '/dashboard/scan', section: 'Pages', keywords: ['start', 'new'] },
  { id: 'agents', label: 'AI Agents', icon: Bot, href: '/dashboard/agents', section: 'Pages', keywords: ['agent', 'ai'] },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, href: '/dashboard/recommendations', section: 'Pages', keywords: ['tips', 'improve'] },
  { id: 'content', label: 'Content Library', icon: FileText, href: '/dashboard/content', section: 'Pages', keywords: ['blog', 'article'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications', section: 'Pages' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings', section: 'Pages', keywords: ['preferences', 'billing'] },
]

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback((value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }, [isControlled, onOpenChange])

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Filter commands
  const filtered = COMMANDS.filter(cmd => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    )
  })

  // Group by section
  const sections = Array.from(new Set(filtered.map(c => c.section)))

  // Keyboard navigation
  const handleKeyNav = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % Math.max(filtered.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      const cmd = filtered[selectedIndex]
      if (cmd.href) router.push(cmd.href)
      if (cmd.action) cmd.action()
      setOpen(false)
    }
  }, [filtered, selectedIndex, router, setOpen])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
              onKeyDown={handleKeyNav}
              className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              aria-label="Search commands"
              aria-autocomplete="list"
              aria-controls="command-palette-results"
              aria-activedescendant={filtered[selectedIndex] ? `cmd-${filtered[selectedIndex].id}` : undefined}
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>
          {/* Results */}
          <div
            id="command-palette-results"
            className="max-h-72 overflow-y-auto py-2"
            role="listbox"
            aria-label="Commands"
          >
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground" role="status">
                No results found.
              </p>
            )}
            {sections.map(section => (
              <div key={section} role="group" aria-label={section}>
                <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {section}
                </p>
                {filtered.filter(c => c.section === section).map(cmd => {
                  const globalIndex = filtered.indexOf(cmd)
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        if (cmd.href) router.push(cmd.href)
                        if (cmd.action) cmd.action()
                        setOpen(false)
                      }}
                      className={cn(
                        'group flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted/50'
                      )}
                    >
                      <cmd.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left">{cmd.label}</span>
                      <ArrowRight
                        className={cn(
                          'h-3 w-3 text-muted-foreground transition-opacity',
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">↵</kbd> Open
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
