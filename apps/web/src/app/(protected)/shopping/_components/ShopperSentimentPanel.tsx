'use client'

import type { ShoppingSku } from '@/lib/demo/surfaces/types'

/**
 * ShopperSentimentPanel — PANEL C (TIER-2 card-console).
 *
 * Per-SKU shopper sentiment as a calm horizontal stacked bar — NOT a loud pie.
 * Desaturated data-viz series: positive (green), neutral (grey), negative (red).
 * Numbers are Geist Mono tabular-nums. The bar is a pure CSS flex composition
 * (no chart lib needed — keeps the panel quiet and legible at arm's length).
 */

interface ShopperSentimentPanelProps {
  skus: ShoppingSku[]
}

const SEGMENTS = [
  { key: 'positive', label: 'Positive', color: '#10B981' }, // data-4
  { key: 'neutral', label: 'Neutral', color: '#D1D5DB' }, // desaturated grey
  { key: 'negative', label: 'Negative', color: '#EF4444' }, // data-6
] as const

export function ShopperSentimentPanel({ skus }: ShopperSentimentPanelProps) {
  return (
    <section className="card-console overflow-hidden" aria-labelledby="sentiment-heading">
      <div className="border-b border-[#E5E7EB] px-6 py-5">
        <h3
          id="sentiment-heading"
          className="font-[var(--font-display)] text-[20px] font-medium tracking-[-0.015em] text-[#0A0A0A]"
        >
          Shopper sentiment
        </h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          How AI characterises each product to shoppers.
        </p>
      </div>

      <div className="divide-y divide-[#F0F0F0]">
        {skus.map((sku) => {
          const s = sku.shopperSentiment
          return (
            <div key={sku.id} className="px-6 py-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-[13.5px] font-medium text-[#0A0A0A]">{sku.name}</span>
                <span className="font-mono text-[12px] tabular-nums text-[#0E9E6E]">
                  {s.positive}% positive
                </span>
              </div>
              {/* Stacked bar */}
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
                role="img"
                aria-label={`${sku.name} sentiment: ${s.positive} percent positive, ${s.neutral} percent neutral, ${s.negative} percent negative.`}
              >
                {SEGMENTS.map((seg) => {
                  const value = s[seg.key]
                  if (value <= 0) return null
                  return (
                    <div
                      key={seg.key}
                      style={{ width: `${value}%`, backgroundColor: seg.color }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-[#E5E7EB] px-6 py-3">
        {SEGMENTS.map((seg) => (
          <span key={seg.key} className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7280]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
            {seg.label}
          </span>
        ))}
      </div>
    </section>
  )
}
