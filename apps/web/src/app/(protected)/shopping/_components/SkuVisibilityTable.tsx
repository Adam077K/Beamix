'use client'

import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import type { ShoppingSku, ShoppingDrillRow } from '@/lib/demo/surfaces/types'

/**
 * SkuVisibilityTable — PANEL A (TIER-2 card-console).
 *
 * A weighted table, NOT an N-equal card grid. The worst-performing SKU row
 * carries a left critical hairline (M7), so the eye lands on the gap first.
 * Every number is Geist Mono tabular-nums. Rows open the per-SKU drill drawer.
 */

interface SkuVisibilityTableProps {
  skus: ShoppingSku[]
  drill: ShoppingDrillRow[]
  onSelect: (skuId: string) => void
}

function ils(n: number): string {
  return `₪${n.toLocaleString('en-US')}`
}

/** Score-band color for the in-cell visibility micro-bar (data-viz only). */
function bandHex(score: number): string {
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

export function SkuVisibilityTable({ skus, drill, onSelect }: SkuVisibilityTableProps) {
  // The worst-performing SKU (lowest visibility) earns the critical hairline.
  const worstId = skus.reduce(
    (lowest, s) => (s.aiVisibility < lowest.aiVisibility ? s : lowest),
    skus[0],
  )?.id

  // Max visibility scopes the in-row proportion bar so the texture is relative
  // to the field, not absolute — the leader's bar reads full, the laggard short.
  const maxVis = skus.reduce((m, s) => Math.max(m, s.aiVisibility), 0) || 100

  const trendFor = (skuId: string): number[] | null => {
    const row = drill.find((d) => d.skuId === skuId)
    if (!row || row.positionTrend.length < 2) return null
    // Lower position is better. Invert into a bounded "rank score" so the line
    // reads as a real trend. A poor-but-MEASURED position (e.g. #20) still draws
    // a distinct LOW line inside [8,96] — it must never floor to the flat
    // baseline, which is reserved for null/no-data only (M4, fixes P2-4).
    return row.positionTrend.map((p) => {
      const score = 100 - p * 5 // #1 → 95, #18 → 10
      return Math.min(96, Math.max(8, score))
    })
  }

  return (
    <section className="card-console overflow-hidden" aria-labelledby="sku-table-heading">
      <div className="border-b border-[#E5E7EB] px-6 py-5">
        <h3
          id="sku-table-heading"
          className="font-[var(--font-display)] text-[20px] font-medium tracking-[-0.015em] text-[#0A0A0A]"
        >
          SKU visibility
        </h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          How each product ranks when AI recommends what to buy.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Product</TableHead>
            <TableHead className="text-right">AI visibility</TableHead>
            <TableHead className="text-right">Avg position</TableHead>
            <TableHead className="text-right pr-6">AI revenue</TableHead>
            <TableHead className="w-[124px] pr-6 text-right">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skus.map((sku) => {
            const isWorst = sku.id === worstId
            return (
              <TableRow
                key={sku.id}
                onClick={() => onSelect(sku.id)}
                tabIndex={0}
                role="button"
                aria-label={`Open detail for ${sku.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(sku.id)
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
              >
                <TableCell
                  className={cn(
                    'relative pl-6 font-medium text-[#0A0A0A]',
                    isWorst &&
                      'before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-[#EF4444]',
                  )}
                >
                  {sku.name}
                </TableCell>
                <TableCell className="text-right align-middle">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono tabular-nums text-[#0A0A0A]">
                      {sku.aiVisibility}%
                    </span>
                    {/* In-row proportion bar — relative texture so no two rows
                        read N-equal flat (M7). */}
                    <span
                      className="block h-[3px] w-[56px] overflow-hidden rounded-full bg-[#F0F1F4]"
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.max(6, (sku.aiVisibility / maxVis) * 100)}%`,
                          backgroundColor: bandHex(sku.aiVisibility),
                        }}
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-[#6B7280]">
                  #{sku.position}
                </TableCell>
                <TableCell className="pr-6 text-right font-mono tabular-nums text-[#374151]">
                  {ils(sku.aiRevenue)}
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex justify-end">
                    <EngineMicroSparkline
                      points={trendFor(sku.id)}
                      currentScore={sku.aiVisibility}
                      showDelta
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
