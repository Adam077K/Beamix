'use client'

import * as React from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TierKey = 'discover' | 'build' | 'scale'

interface TierData {
  name: string
  monthly: number
  annual: number
  annualTotal: number
  runs: number
  engines: number
  features: string[]
  cta: string
  ctaVariant: 'primary' | 'secondary' | 'dark'
}

const TIERS: Record<TierKey, TierData> = {
  discover: {
    name: 'Discover',
    monthly: 79,
    annual: 63,
    annualTotal: 756,
    runs: 25,
    engines: 3,
    features: [
      'AI visibility score dashboard',
      'Weekly scans across 3 AI engines',
      '3 competitors tracked',
      'FAQ + Schema fix agents',
      'Monthly digest report',
    ],
    cta: 'Start Discover',
    ctaVariant: 'secondary',
  },
  build: {
    name: 'Build',
    monthly: 189,
    annual: 151,
    annualTotal: 1812,
    runs: 90,
    engines: 7,
    features: [
      'Everything in Discover',
      'Daily scans across 7 AI engines',
      '5 competitors tracked',
      'Content Optimizer + Blog Strategist',
      'Auto-approve agent runs',
    ],
    cta: 'Start Build',
    ctaVariant: 'primary',
  },
  scale: {
    name: 'Scale',
    monthly: 499,
    annual: 399,
    annualTotal: 4788,
    runs: 250,
    engines: 9,
    features: [
      'Everything in Build',
      '20 competitors tracked',
      'Priority AI refresh queue',
      'Bulk approve + daily digest',
      'Dedicated support channel',
    ],
    cta: 'Talk to sales',
    ctaVariant: 'dark',
  },
}

export interface TierCardProps {
  tier: TierKey
  annual: boolean
  highlighted: boolean
  onSelect: () => void
  loading?: boolean
}

export function TierCard({ tier, annual, highlighted, onSelect, loading = false }: TierCardProps) {
  const data = TIERS[tier]
  const price = annual ? data.annual : data.monthly

  return (
    <div
      className={cn(
        'relative flex w-full flex-col rounded-[20px] bg-white',
        'transition-shadow duration-200',
        highlighted
          ? [
              'border-2 border-[#3370FF]',
              'shadow-[0_8px_32px_rgba(51,112,255,0.14)]',
              'pt-10 pb-6 px-6',
            ]
          : [
              'border border-[#E5E7EB]',
              'shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
              'hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]',
              'p-6',
            ]
      )}
    >
      {/* Most popular badge */}
      {highlighted && (
        <div className="absolute -top-3.5 left-0 right-0 flex justify-center" aria-label="Most popular plan">
          <span className="inline-flex items-center rounded-full bg-[#3370FF] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Most popular
          </span>
        </div>
      )}

      {/* Tier name eyebrow */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
        {data.name}
      </p>

      {/* Price */}
      <div className="mt-3 flex items-end gap-1">
        <span className="text-[40px] font-bold leading-none tracking-tight text-[#0A0A0A]">
          ${price}
        </span>
        <span className="mb-1 text-sm leading-none text-[#6B7280]">/mo</span>
      </div>

      {/* Billing note */}
      <p className="mt-1.5 min-h-[1.125rem] text-xs text-[#6B7280]">
        {annual
          ? `Billed annually — $${data.annualTotal}/yr`
          : 'Billed monthly'}
      </p>

      {/* Usage chips */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
          {data.runs} agent runs/mo
        </span>
        <span className="rounded-md bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
          {data.engines} AI engines
        </span>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-[#E5E7EB]" />

      {/* Features */}
      <ul className="flex flex-1 flex-col gap-2.5" aria-label={`${data.name} plan features`}>
        {data.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-snug text-[#374151]">
            <Check
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                highlighted ? 'text-[#3370FF]' : 'text-[#10B981]'
              )}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <button
        type="button"
        onClick={onSelect}
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? 'Redirecting to checkout...' : data.cta}
        className={cn(
          'mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium',
          'transition-all duration-150 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          data.ctaVariant === 'primary' && [
            'bg-[#3370FF] text-white',
            'hover:bg-[#2558e8]',
            'focus-visible:ring-[#3370FF]',
          ],
          data.ctaVariant === 'secondary' && [
            'border border-[#E5E7EB] bg-white text-[#0A0A0A]',
            'hover:bg-[#F7F7F7]',
            'focus-visible:ring-[#6B7280]',
          ],
          data.ctaVariant === 'dark' && [
            'bg-[#0A0A0A] text-white',
            'hover:bg-[#1f1f1f]',
            'focus-visible:ring-[#0A0A0A]',
          ]
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} aria-hidden="true" />
            Redirecting to checkout...
          </>
        ) : (
          data.cta
        )}
      </button>
    </div>
  )
}
