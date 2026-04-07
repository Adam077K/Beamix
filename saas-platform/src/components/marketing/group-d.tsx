'use client'

import { cn } from '@/lib/utils'
import { ENGINE_LOGOS } from '@/components/marketing/logos'
import { ArrowRight } from 'lucide-react'
import { FadeUp, Stagger, StaggerItem } from '@/components/marketing/motion'

// ─── Demo data ────────────────────────────────────────────────────────────────

const AI_MODELS = [
  { name: 'ChatGPT', active: true, plan: null },
  { name: 'Gemini', active: true, plan: null },
  { name: 'Perplexity', active: true, plan: null },
  { name: 'Claude', active: false, plan: 'Pro' as const },
  { name: 'Google AI Overviews', active: false, plan: 'Pro' as const },
  { name: 'Grok', active: false, plan: 'Business' as const },
  { name: 'DeepSeek', active: false, plan: 'Business' as const },
]

const PLAN_STYLES: Record<string, string> = {
  Pro: 'bg-[#3370FF]/[0.06] text-[#3370FF]',
  Business: 'bg-[#1E40AF]/[0.06] text-[#1E40AF]',
}

import { CARD, CARD_ACCENT } from '@/components/marketing/card'

// ─── Group D — Grid layout redesign ──────────────────────────────────────────

export function GroupD() {
  const activeCount = AI_MODELS.filter(m => m.active).length

  return (
    <FadeUp>
      <div className={`${CARD_ACCENT} overflow-hidden`}>
        {/* Header with count */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <p className="text-sm font-medium text-gray-900">AI Models Scanned</p>
            <p className="text-[11px] text-gray-400 mt-1">
              <span className="text-[#3370FF] font-medium">{activeCount} active</span> · {AI_MODELS.length} total engines
            </p>
          </div>
          <button
            type="button"
            className="text-xs text-[#3370FF] font-medium hover:underline inline-flex items-center gap-1 transition-colors"
          >
            Upgrade to Pro
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Grid of engine cards */}
        <div className="border-t border-gray-100 p-4">
          <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5" stagger={0.06}>
            {AI_MODELS.map((model) => {
              const Logo = ENGINE_LOGOS[model.name]
              return (
                <StaggerItem key={model.name}>
                  <div className={cn(
                    'relative flex items-center gap-3 rounded-lg border p-3.5 transition-colors',
                    model.active
                      ? 'border-gray-100 hover:bg-gray-50/50 bg-white'
                      : 'border-dashed border-gray-200 bg-gray-50/30'
                  )}>
                    {/* Logo */}
                    <div className="shrink-0">
                      {Logo ? (
                        <Logo size="lg" />
                      ) : (
                        <div className="size-7 rounded-lg bg-gray-100" />
                      )}
                    </div>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        model.active ? 'text-gray-900' : 'text-gray-400'
                      )}>
                        {model.name}
                      </p>
                      {model.plan ? (
                        <span className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none inline-block mt-1',
                          PLAN_STYLES[model.plan]
                        )}>
                          {model.plan}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 mt-0.5 block">Active</span>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className={cn(
                      'absolute top-2.5 right-2.5 size-2 rounded-full shrink-0',
                      model.active ? 'bg-[#3370FF]' : 'border border-gray-300'
                    )} />
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </div>
    </FadeUp>
  )
}
