'use client'

import { useState } from 'react'
import { Upload, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AgencyClient, WhiteLabelConfig } from '@/lib/demo/surfaces/types'

// Brand-safe swatch set — constrained so a client accent never overrides Beamix
// UI chrome. These are report-cover accents only.
const ACCENT_SWATCHES = ['#3370FF', '#0E9E6E', '#B8770B', '#DC2626', '#6E56F0', '#0A0A0A']

interface WhiteLabelTabProps {
  clients: AgencyClient[]
  whiteLabel: WhiteLabelConfig[]
}

/**
 * WhiteLabelTab — per-CLIENT report branding (honors the locked "white-label is
 * per-client, not per-account" decision). This is YOUR config, so it is blue —
 * there is no violet here.
 *
 * Asymmetric: a config form (left) with a dominant live audit-cover preview
 * (right). Clients without a saved config show a disabled-with-tooltip state.
 */
export function WhiteLabelTab({ clients, whiteLabel }: WhiteLabelTabProps) {
  const [clientId, setClientId] = useState<string>(clients[0]?.domain ?? '')
  const existing = whiteLabel.find((w) => w.clientId === clientId) ?? null

  const [accent, setAccent] = useState<string>(existing?.accent ?? '#3370FF')
  const [customDomain, setCustomDomain] = useState<string>(existing?.customDomain ?? '')

  const handleClientChange = (next: string) => {
    setClientId(next)
    const wl = whiteLabel.find((w) => w.clientId === next) ?? null
    setAccent(wl?.accent ?? '#3370FF')
    setCustomDomain(wl?.customDomain ?? '')
  }

  const isConfigured = !!existing
  const selectedClient = clients.find((c) => c.domain === clientId)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
      {/* Config form */}
      <div className="card-console flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wl-client" className="text-[13px] font-medium text-[#0A0A0A]">
            Client
          </Label>
          <Select value={clientId} onValueChange={handleClientChange}>
            <SelectTrigger id="wl-client" aria-label="Select client to configure">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.domain} value={c.domain}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[12px] text-[#9CA3AF]">
            White-label config is saved per client, not per account.
          </p>
        </div>

        {/* Logo upload */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px] font-medium text-[#0A0A0A]">Report logo</Label>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#D1D5DB] bg-[#FAFAFA] px-4 py-5 text-[13px] text-[#6B7280] transition-colors hover:border-[#3370FF] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            <Upload className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {existing?.logoUrl ? 'Replace logo' : 'Upload logo (SVG or PNG)'}
          </button>
        </div>

        {/* Brand accent — constrained swatches */}
        <div className="flex flex-col gap-2">
          <Label className="text-[13px] font-medium text-[#0A0A0A]">Brand accent</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_SWATCHES.map((swatch) => {
              const active = swatch.toLowerCase() === accent.toLowerCase()
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setAccent(swatch)}
                  aria-label={`Use accent ${swatch}`}
                  aria-pressed={active}
                  className="h-8 w-8 rounded-full ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: swatch,
                    boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${swatch}` : undefined,
                  }}
                />
              )
            })}
          </div>
          <p className="text-[12px] text-[#9CA3AF]">
            Applies to the report cover only — never to the Beamix workspace.
          </p>
        </div>

        {/* Custom report domain */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wl-domain" className="text-[13px] font-medium text-[#0A0A0A]">
            Custom report domain
          </Label>
          <Input
            id="wl-domain"
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="reports.youragency.com"
            aria-label="Custom report domain"
          />
        </div>

        <Button variant="default" size="default" className="w-full">
          Save branding
        </Button>
      </div>

      {/* Live audit-cover preview — dominant */}
      <div className="card-console-hero overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: 'var(--color-surface-warm)' }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-semibold text-white"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            >
              {selectedClient?.name.slice(0, 1) ?? 'B'}
            </span>
            <div className="leading-tight">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                GEO Audit
              </p>
              <p className="flex items-center gap-1 font-[var(--font-mono)] text-[13px] tabular-nums text-[#374151]">
                <Globe className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                {customDomain || 'beamix.audit'}
              </p>
            </div>
          </div>
          {!isConfigured && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#9CA3AF]">
                    Not configured
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Save branding for {selectedClient?.name ?? 'this client'} to publish a
                  white-labeled report.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="px-6 py-8">
          <span
            className="block font-[var(--font-mono)] text-[64px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[#9CA3AF]"
            aria-hidden="true"
          >
            ––
          </span>
          <span className="mt-1 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            GEO visibility · /100
          </span>
          <p className="mt-4 max-w-[440px] text-[14px] leading-relaxed text-[#6B7280]">
            This is how a generated audit cover looks for{' '}
            <span className="font-medium text-[#0A0A0A]">
              {selectedClient?.name ?? 'this client'}
            </span>
            . Generate an audit from the Generate tab to populate the score and findings.
          </p>
        </div>
      </div>
    </div>
  )
}
