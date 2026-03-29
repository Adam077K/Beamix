'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Bot,
  Users,
  FileText,
  Bell,
  Settings,
  ScanSearch,
  Shield,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ROUTE_CONFIG: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
  dashboard:      { label: 'Dashboard',       icon: LayoutDashboard },
  rankings:       { label: 'Rankings',        icon: BarChart3 },
  agents:         { label: 'AI Agents',       icon: Bot },
  competitors:    { label: 'Competitors',     icon: Users },
  content:        { label: 'Content Library', icon: FileText },
  notifications:  { label: 'Notifications',   icon: Bell },
  settings:       { label: 'Settings',        icon: Settings },
  scan:           { label: 'Scan',            icon: ScanSearch },
  'ai-readiness': { label: 'AI Readiness',    icon: Shield },
  recommendations:{ label: 'Recommendations', icon: Lightbulb },
}

interface BreadcrumbHeaderProps {
  className?: string
  actions?: React.ReactNode
}

export function BreadcrumbHeader({ className, actions }: BreadcrumbHeaderProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Build breadcrumb items
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const config = ROUTE_CONFIG[segment]
    const label = config?.label ?? (segment.charAt(0).toUpperCase() + segment.slice(1))
    const isLast = index === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            )}
            {crumb.isLast ? (
              <span
                className="text-[13px] font-medium text-foreground"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
