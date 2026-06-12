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

export function SkuVisibilityTable({ skus, drill, onSelect }: SkuVisibilityTableProps) {
  // The worst-performing SKU (lowest visibility) earns the critical hairline.
  const worstId = skus.reduce(
    (lowest, s) => (s.aiVisibility < lowest.aiVisibility ? s : lowest),
    skus[0],
  )?.id

  const trendFor = (skuId: string): number[] | null => {
    const row = drill.find((d) => d.skuId === skuId)
    if (!row) return null
    // Lower position is better — invert into a 0-ish "rank score" for the
    // sparkline shape so the line still reads as a trend (not fabricated data).
    return row.positionTrend.map((p) => Math.max(0, 100 - p * 6))
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
            <TableHead className="w-[88px] pr-6 text-right">Trend</TableHead>
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
                <TableCell className="text-right font-mono tabular-nums text-[#0A0A0A]">
                  {sku.aiVisibility}%
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
