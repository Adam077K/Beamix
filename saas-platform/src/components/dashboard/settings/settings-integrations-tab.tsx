'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ── Integration list ───────────────────────────────────────

interface Integration {
  name: string
  description: string
  icon: string
  category: string
  comingSoon: boolean
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Google Analytics',
    description: 'Track traffic and conversions from your AI visibility improvements.',
    icon: '📊',
    category: 'Analytics',
    comingSoon: true,
  },
  {
    name: 'Google Search Console',
    description: 'Monitor organic search performance alongside AI rankings.',
    icon: '🔍',
    category: 'Analytics',
    comingSoon: true,
  },
  {
    name: 'WordPress',
    description: 'Publish agent-generated content directly to your WordPress site.',
    icon: '🔌',
    category: 'Publishing',
    comingSoon: true,
  },
  {
    name: 'Slack',
    description: 'Receive scan alerts and agent updates in your Slack workspace.',
    icon: '💬',
    category: 'Notifications',
    comingSoon: true,
  },
  {
    name: 'Zapier',
    description: 'Connect Beamix to 5,000+ apps with no-code automations.',
    icon: '⚡',
    category: 'Automation',
    comingSoon: true,
  },
  {
    name: 'Google Business Profile',
    description: 'Sync business info and post updates to your Google listing.',
    icon: '📍',
    category: 'Publishing',
    comingSoon: true,
  },
]

// ── Category badge colors ──────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Analytics: 'bg-primary/10 text-primary border-primary/20',
  Publishing: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Notifications: 'bg-purple-50 text-purple-600 border-purple-100',
  Automation: 'bg-amber-50 text-amber-600 border-amber-100',
}

// ── Integration Card ───────────────────────────────────────

function IntegrationCard({ integration }: { integration: Integration }) {
  const categoryColor =
    CATEGORY_COLORS[integration.category] ??
    'bg-muted text-muted-foreground border-border'

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-5',
        'shadow-[var(--shadow-card)] transition-all duration-200',
        integration.comingSoon
          ? 'opacity-70'
          : 'hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer',
      )}
    >
      {/* Top row: icon + category + coming soon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl shrink-0">
          {integration.icon}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              categoryColor,
            )}
          >
            {integration.category}
          </span>
          {integration.comingSoon && (
            <Badge
              variant="secondary"
              className="text-[10px] font-medium px-2 py-0 h-5 bg-amber-50 text-amber-700 border border-amber-100"
            >
              Coming Soon
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{integration.name}</p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {integration.description}
        </p>
      </div>

      {/* Connect button (placeholder) */}
      <button
        disabled={integration.comingSoon}
        className={cn(
          'w-full rounded-xl py-2 text-sm font-medium border transition-all duration-150',
          integration.comingSoon
            ? 'border-border text-muted-foreground cursor-not-allowed bg-muted/30'
            : 'border-primary text-primary hover:bg-primary/10',
        )}
        aria-label={
          integration.comingSoon
            ? `${integration.name} — coming soon`
            : `Connect ${integration.name}`
        }
      >
        {integration.comingSoon ? 'Coming Soon' : 'Connect'}
      </button>
    </div>
  )
}

// ── Integrations Tab ───────────────────────────────────────

export function SettingsIntegrationsTab() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Integrations
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Connect Beamix to your platforms to publish content and sync data automatically.
        </p>
      </div>

      {/* Integration grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>

      {/* Request an integration */}
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          Missing an integration?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Let us know which tools you use and we&apos;ll prioritize accordingly.
        </p>
        <button className="mt-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          Request an integration →
        </button>
      </div>
    </div>
  )
}
