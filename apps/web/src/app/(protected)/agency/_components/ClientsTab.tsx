'use client'

import { useState } from 'react'
import { Globe, Image as ImageIcon } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { AgentRoute } from './AgentRoute'
import type { AgencyClient, WhiteLabelConfig } from '@/lib/demo/surfaces/types'

const statusMeta: Record<
  AgencyClient['status'],
  { label: string; text: string; bg: string; rail: string }
> = {
  active: {
    label: 'Won',
    text: 'var(--color-status-positive)',
    bg: 'var(--color-status-positive-bg)',
    rail: 'var(--color-status-positive)',
  },
  pitching: {
    label: 'Pitched',
    text: 'var(--color-status-info)',
    bg: 'var(--color-status-info-bg)',
    rail: 'var(--color-status-info)',
  },
  lead: {
    label: 'Audited',
    text: 'var(--color-status-neutral)',
    bg: 'var(--color-status-neutral-bg)',
    rail: 'var(--color-status-neutral)',
  },
}

// Deterministic relative "last audit" labels keyed by domain so the demo reads real.
const lastAuditByDomain: Record<string, string> = {
  'brightsmile-dental.co.il': '2d ago',
  'goldendental.co.il': '4h ago',
  'haifasmile.co.il': '1d ago',
  'rfamilydental.co.il': '6d ago',
}

interface ClientsTabProps {
  clients: AgencyClient[]
  whiteLabel: WhiteLabelConfig[]
  onGenerate: () => void
}

/**
 * ClientsTab — the roster. Intentional asymmetry: a dominant list + a narrow
 * rail showing the selected client's white-label preview and a re-run route.
 * NOT an N-equal card grid (M11).
 */
export function ClientsTab({ clients, whiteLabel, onGenerate }: ClientsTabProps) {
  const [selected, setSelected] = useState<string | null>(clients[0]?.domain ?? null)

  if (clients.length === 0) {
    return (
      <EmptyState
        illustration="competitors"
        title="No clients yet"
        description="Generate your first prospect audit to start a roster. Every audit you generate can be promoted to a client."
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button variant="default" size="default" onClick={onGenerate}>
              Generate audit
            </Button>
            <button
              type="button"
              className="text-[13px] text-[#6B7280] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
            >
              Import clients
            </button>
          </div>
        }
      />
    )
  }

  const selectedClient = clients.find((c) => c.domain === selected) ?? clients[0]
  const selectedWl = whiteLabel.find((w) => w.clientId === selectedClient.domain) ?? null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      {/* Dominant list */}
      <div className="card-console overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#EFF0F2] px-5 py-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Client
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Last audit
          </span>
        </div>
        <ul>
          {clients.map((client) => {
            const meta = statusMeta[client.status]
            const isActive = client.domain === selected
            return (
              <li key={client.domain}>
                <button
                  type="button"
                  onClick={() => setSelected(client.domain)}
                  aria-pressed={isActive}
                  className="flex w-full items-center gap-4 border-b border-[#F3F4F6] px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
                  style={
                    isActive
                      ? { boxShadow: `inset 3px 0 0 0 ${meta.rail}`, backgroundColor: '#F4F6FA' }
                      : undefined
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-[#0A0A0A]">{client.name}</p>
                    <p className="truncate font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
                      {client.domain}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: meta.bg, color: meta.text }}
                  >
                    {meta.label}
                  </span>
                  <span className="w-14 shrink-0 text-right font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
                    {lastAuditByDomain[client.domain] ?? '—'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Narrow rail — selected client white-label thumbnail + re-run route */}
      <aside className="card-inset h-fit p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {selectedClient.name}
        </p>
        <div className="mt-3 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-white">
          {selectedWl?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedWl.logoUrl}
              alt={`${selectedClient.name} report brand preview`}
              className="max-h-12"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#9CA3AF]">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-md text-[13px] font-semibold text-white"
                style={{ backgroundColor: selectedWl?.accent ?? '#3370FF' }}
              >
                {selectedClient.name.slice(0, 1)}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <ImageIcon className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                Default brand
              </span>
            </div>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
          <Globe className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          {selectedWl?.customDomain ?? 'beamix.audit'}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button variant="default" size="default" className="w-full" onClick={onGenerate}>
            Re-run audit
          </Button>
          <AgentRoute className="w-full justify-center" aria-label="Route this client to a fix agent">
            Send to fix agent
          </AgentRoute>
        </div>
      </aside>
    </div>
  )
}
