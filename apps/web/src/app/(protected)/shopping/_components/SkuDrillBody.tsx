'use client'

import { Check } from 'lucide-react'
import { DrillSubRow } from '@/components/console/AnalyticsDrillDrawer'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import type { ShoppingSku, ShoppingDrillRow, AttributeCheck } from '@/lib/demo/surfaces/types'
import { AgentRoute } from './AgentRoute'

/**
 * SkuDrillBody — the per-SKU detail rendered inside AnalyticsDrillDrawer.
 *
 * One coherent product story: position trend, the SKU's attribute-correctness
 * row (pulled from the same matrix, with the SAME violet Correct-this route),
 * shopper sentiment, and revenue. All numbers Geist Mono.
 */

const ATTR_ORDER = [
  { key: 'price', label: 'Price' },
  { key: 'specs', label: 'Specs' },
  { key: 'availability', label: 'Availability' },
] as const

interface SkuDrillBodyProps {
  sku: ShoppingSku
  drill: ShoppingDrillRow | null
}

function ils(n: number): string {
  return `₪${n.toLocaleString('en-US')}`
}

function AttributeRow({
  label,
  check,
  skuName,
}: {
  label: string
  check: AttributeCheck
  skuName: string
}) {
  if (check.correct) {
    return (
      <div className="flex items-start justify-between gap-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
          <Check className="h-3.5 w-3.5 text-[#0E9E6E]" aria-hidden="true" strokeWidth={2.5} />
          {label}
        </span>
        <span className="text-right font-mono text-[12px] tabular-nums text-[#374151]">
          {check.claimedValue}
        </span>
      </div>
    )
  }
  return (
    <div className="rounded-md bg-[#FDECEC] px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-[#DC2626]">{label}</span>
        <div className="text-right">
          <p className="font-mono text-[12px] tabular-nums text-[#DC2626] line-through decoration-[rgba(220,38,38,0.5)]">
            {check.claimedValue}
          </p>
          <p className="font-mono text-[12px] tabular-nums text-[#0A0A0A]">{check.actualValue}</p>
        </div>
      </div>
      {check.correctHref && (
        <div className="mt-2">
          <AgentRoute
            href={check.correctHref}
            variant="inline"
            ariaLabel={`Correct the ${skuName} ${label.toLowerCase()} with an agent`}
          >
            Correct this
          </AgentRoute>
        </div>
      )}
    </div>
  )
}

export function SkuDrillBody({ sku, drill }: SkuDrillBodyProps) {
  const trendPoints = drill ? drill.positionTrend.map((p) => Math.max(0, 100 - p * 6)) : null
  const s = sku.shopperSentiment

  return (
    <>
      {/* Position trend */}
      <DrillSubRow label="Position trend">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[13px] tabular-nums text-[#6B7280]">
            #{drill ? drill.positionTrend[0] : sku.position} &rarr; #{sku.position}
          </span>
          <EngineMicroSparkline points={trendPoints} currentScore={sku.aiVisibility} />
        </div>
      </DrillSubRow>

      {/* Attribute correctness — same matrix row, same violet route */}
      <DrillSubRow label="Attribute accuracy">
        <div className="space-y-1.5">
          {ATTR_ORDER.map(({ key, label }) => (
            <AttributeRow
              key={key}
              label={label}
              check={sku.attributeMatrix[key]}
              skuName={sku.name}
            />
          ))}
        </div>
      </DrillSubRow>

      {/* Shopper sentiment */}
      <DrillSubRow label="Shopper sentiment">
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div style={{ width: `${s.positive}%`, backgroundColor: '#10B981' }} />
          <div style={{ width: `${s.neutral}%`, backgroundColor: '#D1D5DB' }} />
          <div style={{ width: `${s.negative}%`, backgroundColor: '#EF4444' }} />
        </div>
        <p className="mt-2 font-mono text-[12px] tabular-nums text-[#6B7280]">
          {s.positive}% positive · {s.neutral}% neutral · {s.negative}% negative
        </p>
      </DrillSubRow>

      {/* Revenue + queries */}
      <DrillSubRow label="AI-attributed revenue">
        <span className="font-mono text-[18px] tabular-nums text-[#0A0A0A]">
          {ils(sku.aiRevenue)}
        </span>
        {drill && drill.topCitedCompetitor && (
          <p className="mt-1.5 text-[13px] text-[#6B7280]">
            Top-cited rival: <span className="text-[#374151]">{drill.topCitedCompetitor}</span>
          </p>
        )}
      </DrillSubRow>

      {drill && drill.queriesTested.length > 0 && (
        <DrillSubRow label={`Queries tested · ${drill.engine}`}>
          <ul className="space-y-1">
            {drill.queriesTested.map((q) => (
              <li key={q} className="text-[13px] leading-relaxed text-[#374151]">
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </DrillSubRow>
      )}
    </>
  )
}
