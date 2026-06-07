'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Globe, ShoppingBag, Layout, MapPin, Star, Apple, Clipboard } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'disconnected' | 'paste-ready' | 'action-needed'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  status: ConnectionStatus
  accountInfo?: string
  icon: React.ElementType
  connectPrompt: string
}

// ── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, { label: string; className: string }> = {
    connected: { label: 'Connected', className: 'bg-[#E6F5EE] text-[#0E9E6E]' },
    disconnected: { label: 'Not connected', className: 'bg-[#F3F4F6] text-[#6B7280]' },
    'paste-ready': { label: 'Paste API key', className: 'bg-[#EEF2FF] text-[#3370FF]' },
    'action-needed': { label: 'Action needed', className: 'bg-[#FDF3E0] text-[#B8770B]' },
  }
  const { label, className } = map[status]
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium', className)}>
      {label}
    </span>
  )
}

// ── Integration row ──────────────────────────────────────────────────────────

interface IntegrationRowProps {
  integration: Integration
  onConnect: (id: string) => void
  connecting: string | null
}

function IntegrationRow({ integration, onConnect, connecting }: IntegrationRowProps) {
  const Icon = integration.icon
  const isConnecting = connecting === integration.id
  const isConnected = integration.status === 'connected'

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9FAFB] transition-colors">
      {/* Icon badge */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <Icon className="h-5 w-5 text-[#374151]" strokeWidth={1.5} />
      </div>

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#0A0A0A]">{integration.name}</span>
          <StatusPill status={integration.status} />
        </div>
        {isConnected && integration.accountInfo ? (
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            {integration.accountInfo}
          </p>
        ) : (
          <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B7280]">
            {integration.connectPrompt}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0">
        {isConnected ? (
          <Button variant="outline" size="sm" onClick={() => onConnect(integration.id)}>
            Manage
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onConnect(integration.id)}
            disabled={isConnecting}
            className="min-w-[80px]"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Connecting…
              </>
            ) : (
              'Connect'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Publish content to your site',
    category: 'Website',
    status: 'connected',
    accountInfo: 'cohenlaw.co.il · admin',
    icon: Globe,
    connectPrompt: 'Connect WordPress — Beamix publishes approved posts straight to your site, no copy-paste.',
  },
  {
    id: 'gbp',
    name: 'Google Business Profile',
    description: 'Local presence and reviews',
    category: 'Local',
    status: 'action-needed',
    accountInfo: 'Re-authorize to resume updates',
    icon: MapPin,
    connectPrompt: 'Connect Google Business Profile — your agents keep your listing accurate and respond to new queries.',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Product pages and blog',
    category: 'E-commerce',
    status: 'disconnected',
    icon: ShoppingBag,
    connectPrompt: 'Connect Shopify — Beamix optimizes product descriptions and blog content for AI search visibility.',
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'CMS collections and blog',
    category: 'Website',
    status: 'disconnected',
    icon: Layout,
    connectPrompt: 'Connect Webflow — approved content lands directly in your CMS, ready to publish.',
  },
  {
    id: 'yelp',
    name: 'Yelp',
    description: 'Business profile and responses',
    category: 'Local',
    status: 'disconnected',
    icon: Star,
    connectPrompt: 'Connect Yelp — your agents respond to reviews and keep your profile data accurate.',
  },
  {
    id: 'apple-maps',
    name: 'Apple Maps Connect',
    description: 'Business listing accuracy',
    category: 'Local',
    status: 'paste-ready',
    icon: Apple,
    connectPrompt: 'Paste your Apple Maps Connect API key — Beamix keeps your hours, photos, and categories up to date.',
  },
]

export function PublishingIntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [connecting, setConnecting] = useState<string | null>(null)

  async function handleConnect(id: string) {
    const integration = integrations.find((i) => i.id === id)
    if (integration?.status === 'connected') {
      // Stub: open manage panel
      return
    }

    setConnecting(id)
    await new Promise((r) => setTimeout(r, 1400))
    setConnecting(null)
    // Stub: update to connected
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'connected' as ConnectionStatus, accountInfo: 'Connected successfully' }
          : i
      )
    )
  }

  const categories = ['Website', 'Local', 'E-commerce']

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const items = integrations.filter((i) => i.category === category)
        if (items.length === 0) return null

        return (
          <div key={category} className="card-console overflow-hidden">
            <div className="px-6 pt-5 pb-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {category}
              </p>
            </div>
            <div className="divide-y divide-[#F3F4F6] mt-2">
              {items.map((integration) => (
                <IntegrationRow
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  connecting={connecting}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Explanatory footer */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F6F2] px-5 py-4">
        <Clipboard className="mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF]" strokeWidth={1.5} />
        <p className="text-[13px] leading-relaxed text-[#6B7280]">
          All publishing goes through your approval queue unless you&apos;ve set a content class to{' '}
          <span className="font-medium text-[#0A0A0A]">Auto</span> in Approval preferences. You always have the final word.
        </p>
      </div>
    </div>
  )
}
