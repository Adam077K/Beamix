'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Globe, ShoppingBag, Layout, MapPin, Star, Apple, Mail, Tag, Clipboard, AlertCircle, HelpCircle } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'disconnected' | 'paste-ready' | 'action-needed'

interface Integration {
  id: string
  name: string
  category: 'Website' | 'Local' | 'E-commerce' | 'Marketing'
  status: ConnectionStatus
  accountInfo?: string
  connectPrompt: string
  pasteHelper?: string
  icon: React.ElementType
}

// ── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, { label: string; className: string }> = {
    connected: { label: 'Connected', className: 'bg-[var(--color-status-positive-bg,#E6F5EE)] text-[var(--color-status-positive)]' },
    disconnected: { label: 'Not connected', className: 'bg-[var(--color-status-neutral-bg,#F3F4F6)] text-[var(--color-status-neutral)]' },
    'paste-ready': { label: 'Paste-ready', className: 'bg-[var(--color-status-warning-bg,#FDF3E0)] text-[var(--color-status-warning)]' },
    'action-needed': { label: 'Action needed', className: 'bg-[var(--color-status-warning-bg,#FDF3E0)] text-[var(--color-status-warning)]' },
  }
  const { label, className } = map[status]
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium', className)}>
      {label}
    </span>
  )
}

// ── Integration card ─────────────────────────────────────────────────────────

interface IntegrationCardProps {
  integration: Integration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  connecting: string | null
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  connecting,
}: IntegrationCardProps) {
  const Icon = integration.icon
  const isConnecting = connecting === integration.id
  const isConnected = integration.status === 'connected'
  const isPasteReady = integration.status === 'paste-ready'

  return (
    <div
      className={cn(
        'flex items-start gap-4 px-5 py-4 transition-colors',
        'hover:bg-[#F9FAFB]',
      )}
    >
      {/* Icon badge */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        <Icon className="h-5 w-5 text-[var(--color-text-secondary)]" strokeWidth={1.5} aria-hidden="true" />
      </div>

      {/* Name + status + description */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            {integration.name}
          </span>
          <StatusPill status={integration.status} />
        </div>

        {isConnected && integration.accountInfo ? (
          <p className="mt-0.5 text-[12px] font-mono tabular-nums text-[var(--color-text-muted)]">
            {integration.accountInfo}
          </p>
        ) : isPasteReady ? (
          <div className="mt-1 flex items-start gap-1.5">
            <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              {integration.pasteHelper ?? integration.connectPrompt}
            </p>
            <button
              type="button"
              aria-label="Why paste-ready?"
              title="No direct API — we hand you ready-to-paste content for this platform."
              className="mt-0.5 shrink-0 text-[#9CA3AF] hover:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] rounded"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
            {integration.connectPrompt}
          </p>
        )}

        {integration.status === 'action-needed' && integration.accountInfo && (
          <p className="mt-1 flex items-center gap-1 text-[12px] text-[var(--color-status-warning)]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {integration.accountInfo}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0">
        {isConnected ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(integration.id)}
            aria-label={`Disconnect ${integration.name}`}
          >
            Disconnect
          </Button>
        ) : isPasteReady ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onConnect(integration.id)}
            aria-label={`Set up ${integration.name}`}
          >
            Set up
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => onConnect(integration.id)}
            disabled={isConnecting}
            className="min-w-[88px]"
            aria-label={`Connect ${integration.name}`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span className="sr-only">Connecting…</span>
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

// ── Stub data ────────────────────────────────────────────────────────────────
// Wave 2: wire to /api/integrations/status

const INTEGRATIONS: Integration[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    category: 'Website',
    status: 'connected',
    accountInfo: 'cohenlaw.co.il · admin',
    connectPrompt: 'Connect WordPress — Beamix publishes approved posts straight to your site.',
    icon: Globe,
  },
  {
    id: 'webflow',
    name: 'Webflow',
    category: 'Website',
    status: 'disconnected',
    connectPrompt: 'Connect Webflow — approved content lands directly in your CMS, ready to publish.',
    icon: Layout,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    status: 'disconnected',
    connectPrompt: 'Connect Shopify — optimize product descriptions and blog content for AI search visibility.',
    icon: ShoppingBag,
  },
  {
    id: 'gbp',
    name: 'Google Business Profile',
    category: 'Local',
    status: 'action-needed',
    accountInfo: 'Re-authorize to resume listing updates',
    connectPrompt: 'Connect GBP — your agents keep your listing accurate and respond to new queries.',
    icon: MapPin,
  },
  {
    id: 'yelp',
    name: 'Yelp',
    category: 'Local',
    status: 'disconnected',
    connectPrompt: 'Connect Yelp — your agents respond to reviews and keep your profile data accurate.',
    icon: Star,
  },
  {
    id: 'apple-maps',
    name: 'Apple Maps Connect',
    category: 'Local',
    status: 'paste-ready',
    connectPrompt: 'Paste your Apple Maps Connect API key to keep hours, photos, and categories current.',
    pasteHelper: 'No direct publish API — we hand you ready-to-paste content for Apple Maps.',
    icon: Apple,
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'Marketing',
    status: 'disconnected',
    connectPrompt: 'Connect SendGrid — send review-request and nurture emails through your own domain.',
    icon: Mail,
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'Marketing',
    status: 'disconnected',
    connectPrompt: 'Connect GTM — auto-inject FAQ and business schema into your site without code changes.',
    icon: Tag,
  },
]

const CATEGORY_ORDER: Integration['category'][] = ['Website', 'Local', 'E-commerce', 'Marketing']

// ── Main component ────────────────────────────────────────────────────────────

export function PublishingIntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [connecting, setConnecting] = useState<string | null>(null)

  const connectedCount = integrations.filter((i) => i.status === 'connected').length

  async function handleConnect(id: string) {
    setConnecting(id)
    // Wave 2: wire to OAuth flow or API key modal
    await new Promise((r) => setTimeout(r, 1400))
    setConnecting(null)
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'connected' as ConnectionStatus, accountInfo: 'Connected successfully' }
          : i,
      ),
    )
  }

  async function handleDisconnect(id: string) {
    // Wave 2: confirm popover → DELETE /api/integrations/:id
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'disconnected' as ConnectionStatus, accountInfo: undefined }
          : i,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* Connected count header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[var(--color-text-muted)]">
          <span className="font-mono font-medium tabular-nums text-[var(--color-text-primary)]">
            {connectedCount}
          </span>{' '}
          of{' '}
          <span className="font-mono tabular-nums">{integrations.length}</span>{' '}
          connected
        </p>
      </div>

      {/* Category groups */}
      {CATEGORY_ORDER.map((category) => {
        const items = integrations.filter((i) => i.category === category)
        if (items.length === 0) return null

        return (
          <div key={category} className="card-console overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {category}
              </p>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {items.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  connecting={connecting}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Footer note */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-4 py-3.5">
        <Clipboard
          className="mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          All publishing goes through your approval queue unless you&apos;ve set a content class to{' '}
          <span className="font-medium text-[var(--color-text-secondary)]">Auto</span> in Approval preferences.
          You always have the final word.
        </p>
      </div>
    </div>
  )
}
