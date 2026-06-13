'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import type { ShoppingSku, AttributeCheck } from '@/lib/demo/surfaces/types'
import { AgentRoute } from './AgentRoute'

/**
 * AttributeAccuracyMatrix — THE SIGNATURE MOMENT (PANEL B).
 *
 * The single most precise spatial execution of blue=you / violet=agents in the
 * product. A per-SKU × attribute grid:
 *   - rows    = SKUs
 *   - columns = Price · Specs · Availability
 *
 * Correct cells are NEUTRAL (small check + the stated value, Geist Mono).
 * WRONG cells sit on critical-tint #FDECEC, showing the AI-claimed value struck
 * through with the TRUE value below — and each one carries a violet GHOST
 * "Correct this →" affordance routing to the fix-agent. The DATA is yours
 * (neutral). The FIX is the agents' (violet). Never a solid button.
 *
 * If every attribute is correct, the panel renders a designed positive verdict
 * (one Fraunces beat) instead of a bare grid.
 */

const ATTRIBUTES = ['price', 'specs', 'availability'] as const
type Attribute = (typeof ATTRIBUTES)[number]

const ATTR_LABEL: Record<Attribute, string> = {
  price: 'Price',
  specs: 'Specs',
  availability: 'Availability',
}

interface AttributeAccuracyMatrixProps {
  skus: ShoppingSku[]
}

function CorrectCell({ value }: { value: string }) {
  return (
    // Verified cells carry a faint positive-tint ground so the matrix reads as a
    // GRADED field, not a flat white grid (M7). The check anchors the status.
    <div className="flex h-full items-start gap-2 bg-[#F4FAF6] px-4 py-3.5">
      <span
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E0F2E8]"
        aria-hidden="true"
      >
        <Check className="h-2.5 w-2.5 text-[#0E9E6E]" strokeWidth={3} />
      </span>
      <span className="font-mono text-[12.5px] leading-snug tabular-nums text-[#4B5563]">
        {value}
      </span>
    </div>
  )
}

function WrongCell({
  check,
  skuName,
  attribute,
}: {
  check: AttributeCheck
  skuName: string
  attribute: Attribute
}) {
  return (
    // Wrong cells sit on critical-tint with a left critical hairline so the gap
    // is glanceable down the matrix. Claimed (struck) → Actual (truth) hierarchy.
    <div className="flex h-full flex-col gap-2.5 border-l-2 border-[#EF4444] bg-[#FDECEC] px-4 py-3.5">
      <div className="space-y-2">
        {/* Claimed value — struck through (the wrong AI claim) */}
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FAD4D4]"
            aria-hidden="true"
          >
            <X className="h-2.5 w-2.5 text-[#DC2626]" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#DC2626]/70">
              AI claims
            </p>
            <p className="font-mono text-[12.5px] leading-snug tabular-nums text-[#B91C1C] line-through decoration-[rgba(185,28,28,0.55)]">
              {check.claimedValue}
            </p>
          </div>
        </div>
        {/* True value — the correct figure, prominent neutral mono */}
        <div className="pl-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#6B7280]">
            Actual
          </p>
          <p className="font-mono text-[12.5px] font-medium leading-snug tabular-nums text-[#0A0A0A]">
            {check.actualValue}
          </p>
        </div>
      </div>
      {check.correctHref && (
        <div className="pl-6">
          <AgentRoute
            href={check.correctHref}
            variant="inline"
            ariaLabel={`Correct the ${skuName} ${ATTR_LABEL[attribute].toLowerCase()} with an agent`}
          >
            Correct this
          </AgentRoute>
        </div>
      )}
    </div>
  )
}

export function AttributeAccuracyMatrix({ skus }: AttributeAccuracyMatrixProps) {
  const errorCount = skus.reduce(
    (sum, sku) => sum + ATTRIBUTES.filter((a) => !sku.attributeMatrix[a].correct).length,
    0,
  )
  const allCorrect = errorCount === 0

  return (
    <section className="card-console overflow-hidden" aria-labelledby="matrix-heading">
      <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5">
        <div>
          <h3
            id="matrix-heading"
            className="font-[var(--font-display)] text-[20px] font-medium tracking-[-0.015em] text-[#0A0A0A]"
          >
            Attribute accuracy
          </h3>
          <p className="mt-1 max-w-[460px] text-[13px] text-[#6B7280]">
            What AI tells shoppers about each product, checked against your real catalog.
          </p>
        </div>
        {!allCorrect && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full bg-status-critical px-2.5 py-1 text-[12px] font-medium text-status-critical">
              <span className="font-mono tabular-nums">{errorCount}</span> wrong{' '}
              {errorCount === 1 ? 'claim' : 'claims'}
            </span>
            <span className="text-[10px] text-[#9CA3AF] sm:hidden">Scroll attributes &rarr;</span>
          </div>
        )}
      </div>

      {allCorrect ? (
        // Designed positive verdict — never a bare grid (M8 + one Fraunces beat).
        <div className="bg-wash-mint px-6 py-10 text-center">
          <p className="mx-auto max-w-[420px] text-[17px] leading-[1.5] text-[#0A0A0A]">
            Every attribute AI states about your shop is{' '}
            <SerifVerdict>Verified</SerifVerdict> &mdash; price, specs, and availability all match
            your catalog.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Grid: sticky SKU label column + 3 attribute columns.
              The ~200px label column is position:sticky left:0 with a white bg
              and right hairline so each SKU stays anchored on narrow viewports. */}
          <div className="min-w-[640px]">
            {/* Column header row */}
            <div className="grid grid-cols-[200px_repeat(3,1fr)] border-b border-[#E5E7EB]">
              <div className="sticky left-0 z-10 border-r border-[#E5E7EB] bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                Product
              </div>
              {ATTRIBUTES.map((attr) => (
                <div
                  key={attr}
                  className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
                >
                  {ATTR_LABEL[attr]}
                </div>
              ))}
            </div>

            {/* SKU rows */}
            {skus.map((sku, i) => {
              const wrongInRow = ATTRIBUTES.filter((a) => !sku.attributeMatrix[a].correct).length
              const correctInRow = ATTRIBUTES.length - wrongInRow
              const hasError = wrongInRow > 0
              return (
                <div
                  key={sku.id}
                  className={cn(
                    'grid grid-cols-[200px_repeat(3,1fr)]',
                    i < skus.length - 1 && 'border-b border-[#F0F0F0]',
                  )}
                >
                  {/* SKU label — sticky; carries the row's accuracy figure (mono,
                      M11) so each row has a truth-number, not just a name. A left
                      status hairline makes a flawed SKU glanceable down the col. */}
                  <div
                    className={cn(
                      'relative sticky left-0 z-10 flex flex-col justify-center gap-1.5 border-r border-[#F0F0F0] bg-white px-6 py-3.5',
                      hasError &&
                        'before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[#EF4444]',
                    )}
                  >
                    <span className="text-[13.5px] font-medium leading-snug text-[#0A0A0A]">
                      {sku.name}
                    </span>
                    <span
                      className={cn(
                        'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        hasError
                          ? 'bg-status-critical text-status-critical'
                          : 'bg-status-positive text-status-positive',
                      )}
                    >
                      <span className="font-mono tabular-nums">
                        {correctInRow}/{ATTRIBUTES.length}
                      </span>
                      <span className="font-sans">accurate</span>
                    </span>
                  </div>

                  {/* Attribute cells */}
                  {ATTRIBUTES.map((attr) => {
                    const check = sku.attributeMatrix[attr]
                    return (
                      <div key={attr} className="border-l border-[#F0F0F0]">
                        {check.correct ? (
                          <CorrectCell value={check.claimedValue} />
                        ) : (
                          <WrongCell check={check} skuName={sku.name} attribute={attr} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
