'use client'

/**
 * SavedReportsLedger — the typographic list of saved reports below the canvas.
 *
 * A ledger, NOT a card grid: each row is report name (Inter-Medium 15px) + mono
 * metadata (block count · ISO timestamp) + a quiet "Open" link. Hover lays down
 * a #F4F6FA ground and a left accent hairline. Collapsible via a header toggle.
 */

import { useState } from 'react'
import { ChevronDown, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedReport } from '@/lib/demo/surfaces/types'

interface SavedReportsLedgerProps {
  reports: SavedReport[]
  onOpen: (id: string) => void
}

export function SavedReportsLedger({ reports, onOpen }: SavedReportsLedgerProps) {
  const [open, setOpen] = useState(true)

  return (
    <section aria-label="Saved reports" className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center gap-2 border-b border-[#E5E7EB] pb-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 text-[#9CA3AF] transition-transform',
            open ? '' : '-rotate-90',
          )}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Saved reports
        </span>
        <span className="font-mono text-xs tabular-nums text-[#9CA3AF]">
          {reports.length}
        </span>
      </button>

      {open && (
        <ul className="flex flex-col">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                className="group flex w-full items-center gap-4 rounded-lg border-l-2 border-transparent py-3 pl-3 pr-2 text-left transition-colors hover:border-[#3370FF] hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-[#0A0A0A]">
                    {r.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[12px] tabular-nums text-[#9CA3AF]">
                    {r.blockCount} blocks · {r.lastSaved}
                    {r.shareUrl && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[#6B7280]">
                        <Link2 className="h-3 w-3" aria-hidden="true" />
                        shared
                      </span>
                    )}
                  </span>
                </div>
                <span className="shrink-0 text-[13px] font-medium text-[#6B7280] transition-colors group-hover:text-[#3370FF]">
                  Open
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
