'use client'

import { useState } from 'react'
import { Plug, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const MCP_URL = 'https://mcp.beamixai.com/sse'

/**
 * McpConnectStrip — the honest "use Beamix from ChatGPT or Claude" affordance.
 *
 * A quiet card-inset strip (NOT a loud banner). Treated as a first-class
 * primitive: not hidden, not oversold. Opens a calm modal with the real
 * connection steps + a copyable MCP endpoint. Violet never touches a button
 * here — the connect action is blue (a YOU action).
 */
export function McpConnectStrip() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard unavailable — the URL is visible to copy manually.
    }
  }

  return (
    <>
      <div className="card-inset flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white"
          aria-hidden="true"
        >
          <Plug className="h-4 w-4 text-[#6B7280]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#0A0A0A]">
            Use Beamix from ChatGPT or Claude
          </p>
          <p className="text-[12px] leading-[1.4] text-[#6B7280]">
            Connect your data over MCP and ask from any AI assistant.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#3370FF] transition-colors hover:bg-[#EFF4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          Connect
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Connect Beamix over MCP</DialogTitle>
            <DialogDescription>
              Add your Beamix workspace to any MCP-aware assistant — ChatGPT,
              Claude, or your own tools — and ask grounded questions there.
            </DialogDescription>
          </DialogHeader>

          <ol className="mt-1 space-y-3">
            {[
              'Open your assistant’s integrations or connectors settings.',
              'Add a new MCP server and paste the Beamix endpoint below.',
              'Authorize the connection — your answers stay grounded in your scans.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF] font-[var(--font-mono)] text-[11px] font-semibold tabular-nums text-[#3370FF]">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-[1.5] text-[#374151]">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F6F2] px-3 py-2.5">
            <code className="flex-1 truncate font-[var(--font-mono)] text-[13px] text-[#0A0A0A]">
              {MCP_URL}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied endpoint' : 'Copy endpoint'}
              className="flex h-7 items-center gap-1.5 rounded-md bg-white px-2 text-[12px] font-medium text-[#3370FF] shadow-[0_0_0_1px_rgba(10,10,10,0.06)] transition-colors hover:bg-[#EFF4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
