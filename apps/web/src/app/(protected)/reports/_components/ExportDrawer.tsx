'use client'

/**
 * ExportDrawer — the right-zone Export / Schedule / Share / Connect panel.
 *
 * Appears only once the canvas has ≥1 block (progressive disclosure). Every
 * gated affordance renders DISABLED with an explanatory Tooltip — never hidden:
 *  - White-label share link: gated until a client is assigned (per-CLIENT rule).
 *  - BI connectors (Looker / Tableau): gated off Scale tier.
 *
 * Violet appears nowhere here — export/share/schedule are user actions (blue).
 */

import { useState } from 'react'
import {
  Download,
  FileText,
  Link2,
  Check,
  Copy,
  Database,
  Lock,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ReportConnector } from '@/lib/demo/surfaces/types'
import { cn } from '@/lib/utils'

interface ExportDrawerProps {
  shareUrl: string | null
  connectors: ReportConnector[]
  /** Whether a client is assigned (drives white-label gating). */
  hasClient?: boolean
  /** Scale tier unlocks BI connectors + white-label. */
  isScaleTier?: boolean
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
      {children}
    </p>
  )
}

export function ExportDrawer({
  shareUrl,
  connectors,
  hasClient = false,
  isScaleTier = false,
}: ExportDrawerProps) {
  const [emailOn, setEmailOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [whiteLabel, setWhiteLabel] = useState(false)

  const displayUrl =
    shareUrl ?? 'https://reports.beamixai.com/share/bright-smile-jun-2026'

  function handleCopy() {
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const biConnectors = connectors.filter((c) => c.name !== 'CSV' && c.name !== 'PDF')

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-7">
        {/* EXPORT ---------------------------------------------------------- */}
        <section className="flex flex-col gap-3">
          <SectionLabel>Export</SectionLabel>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start gap-2">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <FileText className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </section>

        <div className="h-px bg-[#E5E7EB]" />

        {/* SCHEDULE -------------------------------------------------------- */}
        <section className="flex flex-col gap-3">
          <SectionLabel>Schedule</SectionLabel>
          <label className="flex items-center justify-between gap-3">
            <span className="text-[14px] text-[#0A0A0A]">Email this report</span>
            <Switch
              checked={emailOn}
              onCheckedChange={setEmailOn}
              aria-label="Email this report on a schedule"
            />
          </label>

          {emailOn && (
            <div className="flex flex-col gap-3 pt-1">
              <Select defaultValue="weekly">
                <SelectTrigger aria-label="Frequency">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="email"
                placeholder="Recipients, comma separated"
                aria-label="Recipients"
              />
              <Button size="sm" className="self-start">
                Save schedule
              </Button>
            </div>
          )}
        </section>

        <div className="h-px bg-[#E5E7EB]" />

        {/* SHARE ----------------------------------------------------------- */}
        <section className="flex flex-col gap-3">
          <SectionLabel>Share</SectionLabel>

          <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] py-1.5 pl-3 pr-1.5">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#6B7280]">
              {displayUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy share link"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#3370FF] transition-colors hover:bg-[#EEF2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-status-positive" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* White-label toggle — DISABLED with tooltip when no client / off-tier */}
          <WhiteLabelRow
            enabled={hasClient && isScaleTier}
            checked={whiteLabel}
            onCheckedChange={setWhiteLabel}
            reason={
              !isScaleTier
                ? 'White-label is available on the Scale plan.'
                : 'White-label is configured per client. Assign a client to enable.'
            }
          />
        </section>

        <div className="h-px bg-[#E5E7EB]" />

        {/* CONNECT BI ------------------------------------------------------ */}
        <section className="flex flex-col gap-3">
          <SectionLabel>Connect BI</SectionLabel>
          <div className="flex flex-col gap-2">
            {biConnectors.map((c) =>
              isScaleTier && !c.gated ? (
                <ConnectorDialog key={c.name} name={c.name} />
              ) : (
                <Tooltip key={c.name}>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      aria-disabled="true"
                      tabIndex={0}
                      className="flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3 text-[13px] font-medium text-[#9CA3AF]"
                    >
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      Connect {c.name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Available on the Scale plan.
                  </TooltipContent>
                </Tooltip>
              ),
            )}
          </div>
        </section>
      </div>
    </TooltipProvider>
  )
}

function WhiteLabelRow({
  enabled,
  checked,
  onCheckedChange,
  reason,
}: {
  enabled: boolean
  checked: boolean
  onCheckedChange: (v: boolean) => void
  reason: string
}) {
  if (enabled) {
    return (
      <label className="flex items-center justify-between gap-3">
        <span className="text-[14px] text-[#0A0A0A]">White-label this link</span>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label="White-label this link"
        />
      </label>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          aria-disabled="true"
          className={cn(
            'flex cursor-not-allowed items-center justify-between gap-3 rounded-lg px-1 py-0.5',
          )}
        >
          <span className="flex items-center gap-1.5 text-[14px] text-[#9CA3AF]">
            <Lock className="h-3.5 w-3.5" /> White-label this link
          </span>
          <Switch checked={false} disabled aria-label="White-label this link" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[200px]">
        {reason}
      </TooltipContent>
    </Tooltip>
  )
}

function ConnectorDialog({ name }: { name: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start gap-2">
          <Database className="h-4 w-4" /> Connect {name}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {name}</DialogTitle>
          <DialogDescription>
            Paste this connector URL and token into {name} to stream this
            report&apos;s data live.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Connector URL
            </p>
            <Input
              readOnly
              value="https://api.beamixai.com/v1/connectors/bright-smile-jun-2026"
              className="font-mono text-[12px]"
              aria-label="Connector URL"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Access token
            </p>
            <Input
              readOnly
              value="bmx_live_••••••••••••••••3f9a"
              className="font-mono text-[12px]"
              aria-label="Access token"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
