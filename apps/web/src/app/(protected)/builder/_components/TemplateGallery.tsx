'use client'

import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { WorkflowTemplate } from '@/lib/demo/surfaces'

/**
 * TemplateGallery — template-first progressive disclosure (var #3).
 *
 * The page opens here, NOT on a bare dotted void. Deliberately WEIGHTED, not an
 * N-equal card grid (M3 / law): one TIER-1 hero template carries the eye, the
 * rest are calm single-line rows, and "Start blank" is a quiet last option.
 *
 * Choosing a template (or blank) reveals the canvas. Blue is the only action
 * colour here — violet never appears on these buttons.
 */

interface TemplateGalleryProps {
  templates: WorkflowTemplate[]
  onPick: (templateId: string) => void
  onBlank: () => void
}

export function TemplateGallery({ templates, onPick, onBlank }: TemplateGalleryProps) {
  const [hero, ...rest] = templates

  return (
    <div className="mx-auto w-full max-w-[760px]">
      {/* Warm intro — sells the surface (two-tier: hero template + quiet blank) */}
      <div className="mb-8 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEEAFD] text-[#6E56F0]">
          <Sparkles className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[20px] font-medium leading-[1.2] tracking-[-0.01em] text-[#0A0A0A]">
            Start from a proven workflow
          </h2>
          <p className="mt-1 max-w-[460px] text-[15px] leading-[1.5] text-[#6B7280]">
            Each template wires your crew into a sequence that has already moved
            visibility for clinics like yours. Tune it, or compose your own.
          </p>
        </div>
      </div>

      {/* Hero template — TIER-1 focal */}
      {hero && (
        <button
          type="button"
          onClick={() => onPick(hero.id)}
          className="card-console-hero group mb-4 flex w-full items-center gap-5 p-6 text-left transition-transform duration-200 hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
              Most used
            </p>
            <p className="mt-2 text-[18px] font-medium leading-[1.25] tracking-[-0.01em] text-[#0A0A0A]">
              {hero.name}
            </p>
            <p className="mt-1.5 max-w-[440px] text-[14px] leading-[1.5] text-[#6B7280]">
              {hero.description}
            </p>
            <p className="mt-3 font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
              {hero.nodeCount} steps
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3370FF] text-white transition-transform duration-200 group-hover:translate-x-0.5">
            <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.25} aria-hidden="true" />
          </span>
        </button>
      )}

      {/* Remaining templates — calm single-line rows */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[#E5E7EB]">
        {rest.map((tpl, i) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onPick(tpl.id)}
            className={cn(
              'flex w-full items-center gap-4 bg-white px-5 py-4 text-left transition-colors duration-150 hover:bg-[#F7F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]',
              i !== rest.length - 1 && 'border-b border-[#E5E7EB]',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-[#0A0A0A]">
                {tpl.name}
              </p>
              <p className="mt-0.5 truncate text-[13px] leading-[1.45] text-[#6B7280]">
                {tpl.description}
              </p>
            </div>
            <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
              {tpl.nodeCount} steps
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-[#9CA3AF]"
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {/* Start blank — quiet last option (two-tier CTA: blue pill above, quiet link feel) */}
      <div className="mt-6 flex items-center justify-center">
        <Button variant="ghost" onClick={onBlank} className="gap-2 text-[#6B7280]">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Start from a blank canvas
        </Button>
      </div>
    </div>
  )
}
