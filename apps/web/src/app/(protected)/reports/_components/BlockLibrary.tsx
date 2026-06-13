'use client'

/**
 * BlockLibrary — the left-rail report-block catalog.
 *
 * Each block is a 64px card-inset row. Agent blocks (kind:'agent') carry a 1px
 * violet left-hairline + a tiny violet dot — M6 Violet Structure, glanceable at
 * a distance. The add control stays neutral/blue — violet NEVER on a button.
 *
 * Clicking a row (or its + control) appends the block to the canvas.
 */

import { Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportBlock } from '@/lib/demo/surfaces/types'

interface BlockLibraryProps {
  blocks: ReportBlock[]
  /** Block ids already on the canvas — render as added (Check, dimmed). */
  activeIds: string[]
  onAdd: (id: string) => void
  /** When true, render without the eyebrow (used inside the mobile Sheet header). */
  hideEyebrow?: boolean
}

export function BlockLibrary({
  blocks,
  activeIds,
  onAdd,
  hideEyebrow = false,
}: BlockLibraryProps) {
  return (
    <div>
      {!hideEyebrow && (
        <p className="mb-3 border-b border-[#E5E7EB] pb-3 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
          Blocks
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {blocks.map((block) => {
          const isAgent = block.kind === 'agent'
          const added = activeIds.includes(block.id)

          return (
            <li key={block.id}>
              <button
                type="button"
                onClick={() => onAdd(block.id)}
                aria-label={`Add ${block.label} block${added ? ' (already added)' : ''}`}
                className={cn(
                  'card-inset group relative flex h-16 w-full items-center gap-3 overflow-hidden px-3 text-left',
                  'transition-colors hover:bg-[#F4F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
                  added && 'opacity-60',
                )}
              >
                {/* Agent left-hairline — M6 violet structure (indicator only) */}
                {isAgent && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-px"
                    style={{ backgroundColor: 'rgba(110,86,240,0.12)' }}
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {isAgent && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E56F0]"
                      />
                    )}
                    <span className="truncate text-[14px] font-medium text-[#0A0A0A]">
                      {block.label}
                    </span>
                  </div>
                  <span className="mt-0.5 block text-[12px] leading-none text-[#9CA3AF]">
                    {isAgent ? 'Agent block' : 'Data block'}
                  </span>
                </div>

                {/* Add control — always neutral/blue, never violet */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    added
                      ? 'border-transparent bg-[#EEF2FF] text-[#3370FF]'
                      : 'border-[#E5E7EB] bg-white text-[#6B7280] group-hover:border-[#3370FF] group-hover:text-[#3370FF]',
                  )}
                >
                  {added ? (
                    <Check className="h-4 w-4" strokeWidth={2.25} />
                  ) : (
                    <Plus className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
