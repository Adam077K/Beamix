'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
      'Score dashboard',
      'Weekly scans',
      '3 competitors tracked',
      'FAQ + Schema agents',
    ],
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
      'Daily scans',
      '5 competitors',
      'Automation',
      'Content Optimizer',
      'Blog Strategist',
      'Freshness Agent',
    ],
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
      '20 competitors',
      'Priority refresh',
      'Bulk approve',
      'Daily digest',
      'Priority support',
    ],
  },
}

export interface TierCardProps {
  tier: TierKey
  annual: boolean
  highlighted: boolean
  onSelect: () => void
}

export function TierCard({ tier, annual, highlighted, onSelect }: TierCardProps) {
  const t = useTranslations('paywall')
  const data = TIERS[tier]
  const price = annual ? data.annual : data.monthly

  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-4 rounded-2xl border bg-white p-6',
        'transition-shadow duration-200',
        highlighted
          ? 'ring-2 ring-[#3370FF] shadow-[0_4px_20px_rgba(51,112,255,0.12)]'
          : 'border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
      )}
    >
      {/* Recommended pill */}
      {highlighted && (
        <div className="absolute -top-3 end-5">
          <span className="inline-flex items-center rounded-full bg-[#3370FF] px-3 py-0.5 text-xs font-medium text-white">
            {t('recommended')}
          </span>
        </div>
      )}

      {/* Tier name */}
      <p className="font-medium text-lg text-[#0A0A0A] tracking-tight">{data.name}</p>

      {/* Price */}
      <div className="flex items-end gap-1">
        <span className="text-4xl font-bold text-[#0A0A0A] leading-none">${price}</span>
        <span className="mb-0.5 text-sm text-gray-500 leading-none">/mo</span>
      </div>

      {/* Annual note */}
      {annual ? (
        <p className="text-xs text-gray-500 -mt-3">
          {t('billedAnnually')} &mdash; ${data.annualTotal}/yr
        </p>
      ) : (
        <p className="text-xs text-gray-400 -mt-3">{t('billedMonthly')}</p>
      )}

      {/* Metadata */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-600">
          {t('aiRunsPerMonth', { runs: data.runs })}
        </p>
        <p className="text-sm text-gray-600">
          {t('engines', { count: data.engines })}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Features */}
      <ul className="flex flex-col gap-2 flex-1">
        {data.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                highlighted ? 'text-[#3370FF]' : 'text-gray-400'
              )}
              strokeWidth={2}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onSelect}
        className={cn(
          'mt-2 w-full rounded-lg py-2.5 text-sm font-medium transition-all duration-150',
          'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          highlighted
            ? 'bg-[#3370FF] text-white hover:bg-[#2558e8] focus-visible:ring-[#3370FF]'
            : 'border border-gray-200 bg-white text-[#0A0A0A] hover:bg-gray-50 focus-visible:ring-gray-400'
        )}
      >
        {t('startWith', { name: data.name })} &rarr;
      </button>
    </div>
  )
}
