'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { WorkflowNode } from '@/lib/demo/surfaces'
import { NODE_VOCAB } from './node-vocab'

/**
 * NodeConfigPanel — right-rail Sheet that opens on node select.
 *
 * Spatial law:
 *   - Node identity stays VIOLET (agent type read-only header).
 *   - Inputs are YOUR structure → blue-accented field labels.
 *   - Cost line in Geist Mono tabular-nums.
 *
 * Design-only: fields render the fixture config as read affordances (no
 * mutation wiring at Phase 1B).
 */

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  open: boolean
  onClose: () => void
}

function formatValue(v: string | number | boolean): string {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return String(v)
  return v
}

function humanizeKey(k: string): string {
  return k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function NodeConfigPanel({ node, open, onClose }: NodeConfigPanelProps) {
  const meta = node ? NODE_VOCAB[node.type] : null
  const Icon = meta?.icon
  const entries = node ? Object.entries(node.config) : []

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-[380px]"
      >
        {node && meta && Icon && (
          <>
            {/* Violet agent-identity header */}
            <div className="border-b border-[#E5E7EB] bg-agent-tint px-6 py-5">
              <SheetHeader className="space-y-0 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-[#6E56F0]">
                    <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#6E56F0]">
                    {meta.eyebrow} agent
                  </span>
                </div>
                <SheetTitle className="mt-3 text-[18px] font-medium leading-[1.25] tracking-[-0.01em] text-[#0A0A0A]">
                  {node.label.replace(/^[A-Za-z]+:\s*/, '')}
                </SheetTitle>
                <SheetDescription className="mt-1 text-[13px] leading-[1.5] text-[#6B7280]">
                  Configure what this agent reads and produces. Inputs are yours
                  to set; the agent does the work.
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Inputs — YOUR structure (blue-accented) */}
            <div className="px-6 py-5">
              <p className="mb-3 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
                Inputs
              </p>
              <dl className="space-y-3">
                {entries.map(([key, value]) => (
                  <div
                    key={key}
                    className="border-l-2 border-l-[#3370FF] pl-3"
                  >
                    <dt className="text-[12px] font-medium text-[#6B7280]">
                      {humanizeKey(key)}
                    </dt>
                    <dd className="mt-0.5 font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Quiet cost line */}
              <div className="mt-6 flex items-center justify-between rounded-[var(--radius-card)] border border-[#E5E7EB] bg-[#F7F6F2] px-4 py-3">
                <span className="text-[13px] text-[#6B7280]">
                  Estimated per run
                </span>
                <span className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#0A0A0A]">
                  {meta.stepHint} · ~$0.02
                </span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
