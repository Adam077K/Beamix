'use client'

import { Puzzle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ── Integrations list ──────────────────────────────────────

const INTEGRATIONS = [
  {
    name: 'WordPress',
    description: 'Publish content directly to your WordPress site.',
    icon: '🔌',
  },
  {
    name: 'Wix',
    description: 'Auto-publish to your Wix website.',
    icon: '🌐',
  },
  {
    name: 'Google Business Profile',
    description: 'Sync business info and post updates.',
    icon: '📍',
  },
  {
    name: 'Facebook Pages',
    description: 'Share content to your Facebook business page.',
    icon: '📘',
  },
]

// ── Integrations Tab ───────────────────────────────────────

export function SettingsIntegrationsTab() {
  return (
    <div className="space-y-4">
      {/* Empty state header */}
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
          <Puzzle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="font-sans font-medium text-lg text-foreground">
          Integrations coming soon
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Connect Beamix to your platforms to publish content and sync data
          automatically.
        </p>
      </div>

      {/* Integration cards (coming soon) */}
      {INTEGRATIONS.map((integration) => (
        <Card
          key={integration.name}
          className="bg-card rounded-[20px] border border-border shadow-sm opacity-60"
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl shrink-0">
              {integration.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{integration.name}</p>
              <p className="text-sm text-muted-foreground">
                {integration.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 bg-amber-100 text-amber-700"
            >
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
