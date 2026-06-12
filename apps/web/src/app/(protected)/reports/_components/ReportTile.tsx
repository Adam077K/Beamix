'use client'

/**
 * ReportTile — a TIER-2 viz tile inside the composed report.
 *
 * Renders a block's mock body by shape (engines / deltas / figure / list /
 * narrative). Agent tiles carry the M6 violet left-hairline + agent dot.
 * Engine bodies reuse EngineMicroSparkline (M4) — flat baseline when series
 * is null, never fabricated data.
 *
 * Hover surfaces an overflow menu: Move up, Move down, Remove.
 */

import { MoreHorizontal, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { cn } from '@/lib/utils'
import type { BlockTile } from './block-content'

interface ReportTileProps {
  tile: BlockTile
  index: number
  total: number
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}

function deltaTone(delta: number) {
  // negative = moved up = better (positive tone)
  if (delta < 0) return 'text-status-positive'
  if (delta > 0) return 'text-status-critical'
  return 'text-[#6B7280]'
}

export function ReportTile({
  tile,
  index,
  total,
  onRemove,
  onMove,
}: ReportTileProps) {
  const isAgent = tile.kind === 'agent'

  return (
    <article
      className={cn(
        'card-console group relative overflow-hidden p-5',
        isAgent && 'pl-[21px]',
      )}
    >
      {isAgent && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-px"
          style={{ backgroundColor: 'rgba(110,86,240,0.12)' }}
        />
      )}

      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {isAgent && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E56F0]"
              />
            )}
            <h3 className="truncate text-[15px] font-semibold text-[#0A0A0A]">
              {tile.heading}
            </h3>
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-[#6B7280]">
            {tile.caption}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${tile.heading} block actions`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] opacity-0 transition-opacity hover:bg-[#F3F4F6] hover:text-[#0A0A0A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              disabled={index === 0}
              onClick={() => onMove(-1)}
            >
              <ArrowUp className="mr-2 h-4 w-4" /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === total - 1}
              onClick={() => onMove(1)}
            >
              <ArrowDown className="mr-2 h-4 w-4" /> Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRemove}
              className="text-[#DC2626] focus:text-[#DC2626]"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <TileBody tile={tile} />
    </article>
  )
}

function TileBody({ tile }: { tile: BlockTile }) {
  switch (tile.shape) {
    case 'figure':
      return (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[40px] font-medium leading-none tracking-[-0.02em] tabular-nums text-[#0A0A0A]">
            {tile.figure}
          </span>
          <span className="font-mono text-[13px] tabular-nums text-[#9CA3AF]">
            {tile.figureUnit}
          </span>
        </div>
      )

    case 'engines':
      return (
        <ul className="flex flex-col divide-y divide-[#F0F0F0]">
          {tile.engines?.map((e) => (
            <li
              key={e.engine}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <span className="text-[14px] text-[#0A0A0A]">{e.engine}</span>
              <div className="flex items-center gap-3">
                <EngineMicroSparkline
                  points={e.series}
                  currentScore={e.value}
                />
                <span className="w-9 text-right font-mono text-[15px] font-medium tabular-nums text-[#0A0A0A]">
                  {e.value}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )

    case 'deltas':
      return (
        <ul className="flex flex-col divide-y divide-[#F0F0F0]">
          {tile.deltas?.map((d) => (
            <li
              key={d.topic}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <div className="min-w-0">
                <span className="block truncate text-[14px] text-[#0A0A0A]">
                  {d.topic}
                </span>
                <span className="text-[12px] text-[#9CA3AF]">{d.engine}</span>
              </div>
              <span
                className={cn(
                  'font-mono text-[14px] font-medium tabular-nums',
                  deltaTone(d.delta),
                )}
              >
                {d.delta < 0 ? '▲' : d.delta > 0 ? '▼' : '—'}{' '}
                {Math.abs(d.delta)}
              </span>
            </li>
          ))}
        </ul>
      )

    case 'narrative':
      return (
        <div className="flex flex-col gap-3">
          {tile.lines?.map((line, i) => (
            <p
              key={i}
              className="text-[14px] leading-[1.6] text-[#374151]"
            >
              {line}
            </p>
          ))}
        </div>
      )

    case 'list':
    default:
      return (
        <ul className="flex flex-col gap-2">
          {tile.lines?.map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[14px] leading-snug text-[#374151]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                  tile.kind === 'agent' ? 'bg-[#6E56F0]' : 'bg-[#3370FF]',
                )}
              />
              {line}
            </li>
          ))}
        </ul>
      )
  }
}
