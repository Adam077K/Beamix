'use client'

import { Check } from 'lucide-react'
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
    <div className="flex h-full items-start gap-2 px-4 py-3.5">
      <Check
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0E9E6E]"
        aria-hidden="true"
        strokeWidth={2.5}
      />
      <span className="font-mono text-[12.5px] leading-snug tabular-nums text-[#6B7280]">
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
    <div className="flex h-full flex-col gap-2 bg-[#FDECEC] px-4 py-3.5">
      <div className="space-y-0.5">
        {/* Claimed value — struck through (the wrong AI claim) */}
        <p className="font-mono text-[12.5px] leading-snug tabular-nums text-[#DC2626] line-through decoration-[rgba(220,38,38,0.5)]">
          {check.claimedValue}
        </p>
        {/* True value — the correct figure, neutral mono */}
        <p className="font-mono text-[12.5px] leading-snug tabular-nums text-[#0A0A0A]">
          {check.actualValue}
        </p>
      </div>
      {check.correctHref && (
        <AgentRoute
          href={check.correctHref}
          variant="inline"
          ariaLabel={`Correct the ${skuName} ${ATTR_LABEL[attribute].toLowerCase()} with an agent`}
        >
          Correct this
        </AgentRoute>
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
          <span className="shrink-0 rounded-full bg-status-critical px-2.5 py-1 text-[12px] font-medium text-status-critical">
            <span className="font-mono tabular-nums">{errorCount}</span> wrong{' '}
            {errorCount === 1 ? 'claim' : 'claims'}
          </span>
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
          {/* Grid: SKU label column + 3 attribute columns. Not an N-equal grid —
              the label column is wider and content-weighted. */}
          <div className="min-w-[640px]">
            {/* Column header row */}
            <div className="grid grid-cols-[200px_repeat(3,1fr)] border-b border-[#E5E7EB]">
              <div className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
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
            {skus.map((sku, i) => (
              <div
                key={sku.id}
                className={cn(
                  'grid grid-cols-[200px_repeat(3,1fr)]',
                  i < skus.length - 1 && 'border-b border-[#F0F0F0]',
                )}
              >
                {/* SKU label */}
                <div className="flex items-center px-6 py-3.5">
                  <span className="text-[13.5px] font-medium text-[#0A0A0A]">{sku.name}</span>
                </div>

                {/* Attribute cells */}
                {ATTRIBUTES.map((attr) => {
                  const check = sku.attributeMatrix[attr]
                  return (
                    <div
                      key={attr}
                      className="border-l border-[#F0F0F0]"
                    >
                      {check.correct ? (
                        <CorrectCell value={check.claimedValue} />
                      ) : (
                        <WrongCell check={check} skuName={sku.name} attribute={attr} />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
