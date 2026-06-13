'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckCircle2,
  ScrollText,
  GitBranch,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
  Wrench,
  ChevronDown,
  ChevronRight,
  FileText,
  Code2,
  Users,
  Radio,
  BookOpen,
  Clock,
  Radar,
  BarChart2,
  MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/store/sidebar'

// Top-level nav items (before Tools)
const topNavItems = [
  { href: '/dashboard', label: 'Outcomes', icon: LayoutDashboard },
  { href: '/approvals', label: 'Approval Queue', icon: CheckCircle2 },
  { href: '/digests', label: 'Weekly Digest', icon: ScrollText },
  { href: '/traceability', label: 'Traceability', icon: GitBranch },
]

// Intelligence disclosure children
// Batch 2 will add: AI Traffic (/ai-traffic) + Market Intelligence (/market-intelligence)
const intelligenceChildren = [
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/sentiment', label: 'Sentiment', icon: MessageSquare },
]

// The Intelligence group header icon for the collapsed icon-rail
const INTELLIGENCE_HREF = '/analytics'

// Tools disclosure children
const toolsChildren = [
  { href: '/prompts', label: 'Prompts', icon: FileText },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/schema', label: 'Schema', icon: Code2 },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/offsite', label: 'Off-Site', icon: Radio },
  { href: '/blog-studio', label: 'Blog Studio', icon: BookOpen },
  { href: '/archive', label: 'Run History', icon: Clock },
]

// The Tools group header links to /automation (Mode Hub)
const TOOLS_HREF = '/automation'

// Settings — always last
const settingsItem = { href: '/settings', label: 'Settings', icon: Settings }

// ---------------------------------------------------------------------------
// NavLink — a single nav item with active state
// ---------------------------------------------------------------------------

function NavLink({
  href,
  label,
  icon: Icon,
  iconOnly = false,
  onNavigate,
  isActive,
  indented = false,
}: {
  href: string
  label: string
  icon: LucideIcon
  iconOnly?: boolean
  onNavigate?: () => void
  isActive: boolean
  indented?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={iconOnly ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      title={iconOnly ? label : undefined}
      className={cn(
        'flex min-h-[44px] items-center gap-3 rounded-md py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
        indented ? 'pl-7 pr-2.5' : 'px-2.5',
        isActive
          ? 'bg-[#EFF4FF] font-medium text-[#3370FF]'
          : 'text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
        iconOnly && 'justify-center',
      )}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#3370FF]' : 'text-current')}
      />
      {!iconOnly && <span className="truncate">{label}</span>}
    </Link>
  )
}

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
  // Intelligence group expanded state — local, not persisted
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(false)

  // Auto-expand if the current path is an intelligence child
  const isInsideIntelligence =
    pathname === INTELLIGENCE_HREF ||
    intelligenceChildren.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))

  // Sync expanded when pathname puts us inside intelligence
  useEffect(() => {
    if (isInsideIntelligence) setIntelligenceExpanded(true)
  }, [isInsideIntelligence])

  // Tools group expanded state — local, not persisted
  const [toolsExpanded, setToolsExpanded] = useState(false)

  // Auto-expand if the current path is a tools child
  const isInsideTools =
    pathname === TOOLS_HREF ||
    toolsChildren.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))

  // Sync expanded when pathname puts us inside tools
  useEffect(() => {
    if (isInsideTools) setToolsExpanded(true)
  }, [isInsideTools])

  return (
    <nav className="flex-1 space-y-0.5 px-2 py-3" aria-label="Main navigation">
      {/* Top-level items */}
      {topNavItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={Icon}
            iconOnly={iconOnly}
            onNavigate={onNavigate}
            isActive={isActive}
          />
        )
      })}

      {/* Intelligence disclosure group — positioned above Tools */}
      {iconOnly ? (
        // Icon-rail: single Radar glyph linking to /analytics
        <NavLink
          href={INTELLIGENCE_HREF}
          label="Intelligence"
          icon={Radar}
          iconOnly
          onNavigate={onNavigate}
          isActive={isInsideIntelligence}
        />
      ) : (
        <div>
          {/* Group header row — links to /analytics, chevron toggles children */}
          <div className="flex min-h-[44px] items-center">
            <Link
              href={INTELLIGENCE_HREF}
              onClick={onNavigate}
              aria-current={pathname === INTELLIGENCE_HREF ? 'page' : undefined}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isInsideIntelligence
                  ? 'bg-[#EFF4FF] font-medium text-[#3370FF]'
                  : 'text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
              )}
            >
              <Radar
                className={cn(
                  'h-4 w-4 shrink-0',
                  isInsideIntelligence ? 'text-[#3370FF]' : 'text-current',
                )}
              />
              <span className="truncate">Intelligence</span>
            </Link>

            <button
              type="button"
              onClick={() => setIntelligenceExpanded((v) => !v)}
              aria-expanded={intelligenceExpanded}
              aria-label={intelligenceExpanded ? 'Collapse Intelligence' : 'Expand Intelligence'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              {intelligenceExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Intelligence children — indented, same active treatment */}
          {intelligenceExpanded && (
            <div className="space-y-0.5">
              {intelligenceChildren.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    icon={Icon}
                    onNavigate={onNavigate}
                    isActive={isActive}
                    indented
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tools disclosure group */}
      {iconOnly ? (
        // Icon-rail: single Tools glyph linking to /automation
        <NavLink
          href={TOOLS_HREF}
          label="Tools"
          icon={Wrench}
          iconOnly
          onNavigate={onNavigate}
          isActive={isInsideTools}
        />
      ) : (
        <div>
          {/* Group header row — links to /automation, chevron toggles children */}
          <div className="flex min-h-[44px] items-center">
            <Link
              href={TOOLS_HREF}
              onClick={onNavigate}
              aria-current={pathname === TOOLS_HREF ? 'page' : undefined}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1',
                isInsideTools
                  ? 'bg-[#EFF4FF] font-medium text-[#3370FF]'
                  : 'text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#0A0A0A]',
              )}
            >
              <Wrench
                className={cn(
                  'h-4 w-4 shrink-0',
                  isInsideTools ? 'text-[#3370FF]' : 'text-current',
                )}
              />
              <span className="truncate">Tools</span>
            </Link>

            <button
              type="button"
              onClick={() => setToolsExpanded((v) => !v)}
              aria-expanded={toolsExpanded}
              aria-label={toolsExpanded ? 'Collapse Tools' : 'Expand Tools'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              {toolsExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Children — indented, same active treatment */}
          {toolsExpanded && (
            <div className="space-y-0.5">
              {toolsChildren.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    icon={Icon}
                    onNavigate={onNavigate}
                    isActive={isActive}
                    indented
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings — always last */}
      <NavLink
        href={settingsItem.href}
        label={settingsItem.label}
        icon={settingsItem.icon}
        iconOnly={iconOnly}
        onNavigate={onNavigate}
        isActive={pathname === settingsItem.href || pathname.startsWith(settingsItem.href + '/')}
      />
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

  // P2-A — Escape-to-close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // P2-B — body-scroll-lock while drawer open
  useEffect(() => {
    if (open) document.body.classList.add('overflow-hidden')
    else document.body.classList.remove('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}
    >
      {/* Scrim — presentational backdrop only; aria-hidden so AT skips it */}
      <div
        aria-hidden="true"
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
