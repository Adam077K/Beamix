'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// ─── Demo data ────────────────────────────────────────────────────────────────

const AI_MODELS = [
  { name: 'ChatGPT', checked: true, plan: null },
  { name: 'Gemini', checked: true, plan: null },
  { name: 'Perplexity', checked: true, plan: null },
  { name: 'Claude', checked: false, plan: 'Pro' as const },
  { name: 'Google AI Overviews', checked: false, plan: 'Pro' as const },
  { name: 'Grok', checked: false, plan: 'Business' as const },
  { name: 'DeepSeek', checked: false, plan: 'Business' as const },
]

const PLAN_BADGE_STYLES: Record<'Pro' | 'Business', string> = {
  Pro: 'bg-[#EEF3FF] text-[#3370FF]',
  Business: 'bg-[#E8EEFB] text-[#1E40AF]',
}

// ─── Check icon ───────────────────────────────────────────────────────────────

function CheckIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="14" height="14" rx="4" fill="#3370FF" />
        <path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="14" height="14" rx="4" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// ─── Group D component ────────────────────────────────────────────────────────

export function GroupD() {
  return (
    <div className="max-w-sm">
      {/* AI Models Scanned */}
      <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">AI Models Scanned</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <div className="space-y-2.5">
            {AI_MODELS.map((model) => (
              <div key={model.name} className="flex items-center gap-2.5">
                <CheckIcon checked={model.checked} />
                <span
                  className={cn(
                    'flex-1 text-xs',
                    model.checked ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {model.name}
                </span>
                {model.plan && (
                  <span
                    className={cn(
                      'rounded-full text-[9px] font-semibold px-1.5 py-0.5 leading-none shrink-0',
                      PLAN_BADGE_STYLES[model.plan]
                    )}
                  >
                    {model.plan}
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Upgrade to Pro to unlock 4 more AI engines.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
