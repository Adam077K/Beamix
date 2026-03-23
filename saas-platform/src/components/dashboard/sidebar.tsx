'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  FileText,
  Settings,
  LogOut,
  Users,
  Bell,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavIconProps {
  icon: React.ComponentType<{ className?: string }>
  href?: string
  label?: string
  onClick?: () => void
  isActive?: boolean
}

function NavIcon({ icon: Icon, href, label, onClick, isActive }: NavIconProps) {
  const content = (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
  )

  if (href) {
    return (
      <Link href={href} title={label} aria-label={label}>
        {content}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      type="button"
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      {content}
    </button>
  )
}

const MAIN_NAV = [
  { label: 'Overview',        href: '/dashboard',                    icon: LayoutDashboard },
  { label: 'Rankings',        href: '/dashboard/rankings',           icon: BarChart3 },
  { label: 'Competitors',     href: '/dashboard/competitors',        icon: Users },
  { label: 'AI Agents',       href: '/dashboard/agents',             icon: Bot },
  { label: 'Content',         href: '/dashboard/content',            icon: FileText },
  { label: 'Recommendations', href: '/dashboard/recommendations',    icon: Lightbulb },
  { label: 'Notifications',   href: '/dashboard/notifications',      icon: Bell },
]

interface SidebarProps {
  businessName: string
  className?: string
}

export function Sidebar({ businessName, className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isItemActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const businessInitial = businessName ? businessName.charAt(0).toUpperCase() : 'B'

  return (
    <aside
      className={cn(
        'fixed top-0 z-30 flex h-screen w-[60px] flex-col items-center',
        'ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l border-border bg-card py-3',
        className
      )}
    >
      {/* Business initial avatar */}
      <div className="mb-3 flex flex-col items-center">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
          title={businessName}
          aria-label={`Business: ${businessName}`}
        >
          <span className="text-sm font-semibold">{businessInitial}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="mb-2 h-px w-8 bg-border" />

      {/* Main navigation */}
      <nav
        className="flex flex-1 flex-col items-center gap-1 py-1"
        aria-label="Main navigation"
      >
        {MAIN_NAV.map((item) => (
          <NavIcon
            key={item.href}
            icon={item.icon}
            href={item.href}
            label={item.label}
            isActive={isItemActive(item.href)}
          />
        ))}
      </nav>

      {/* Bottom utilities: Settings + Sign out */}
      <div className="flex flex-col items-center gap-1">
        <NavIcon
          icon={Settings}
          href="/dashboard/settings"
          label="Settings"
          isActive={pathname.startsWith('/dashboard/settings')}
        />
        <NavIcon icon={LogOut} onClick={handleSignOut} label="Sign out" />
      </div>
    </aside>
  )
}
