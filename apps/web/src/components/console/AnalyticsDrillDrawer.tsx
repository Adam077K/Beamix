'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AnalyticsDrillDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** STEP-2 drawer title — the topic or metric being drilled */
  title: string
  /**
   * Optional STEP-1 hero figure shown inline with the title
   * (e.g. "#1.4" avg position, "31%" visibility).
   * Rendered in Geist Mono tabular-nums.
   */
  figure?: string | number | null
  /** Main body content — rows, snippets, agent notes */
  children: ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// AnalyticsDrillDrawer
// ---------------------------------------------------------------------------

/**
 * AnalyticsDrillDrawer — slide-in detail panel for Analytics surfaces.
 *
 * Wraps Shadcn Sheet (side="right", w-[440px]).
 * Closes on overlay click + Escape (Sheet default).
 *
 * Structure:
 *   Header: STEP-2 title + optional Geist Mono hero figure
 *   Body: TIER-3 .card-inset sub-rows supplied via children
 *
 * The M1 depth contract inside the drawer:
 *   - Drawer panel itself is TIER-2 elevation (white + shadow)
 *   - Sub-rows use TIER-3 .card-inset (surface-warm, 1px border, no shadow)
 */
export function AnalyticsDrillDrawer({
  open,
  onOpenChange,
  title,
  figure = null,
  children,
  className,
}: AnalyticsDrillDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex w-full max-w-[440px] flex-col gap-0 p-0 sm:max-w-[440px]',
          className,
        )}
      >
        {/* Header */}
        <SheetHeader className="border-b border-[#E5E7EB] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* STEP-2 title */}
              <SheetTitle className="font-[var(--font-display)] text-[20px] font-medium leading-[1.2] tracking-[-0.015em] text-[#0A0A0A]">
                {title}
              </SheetTitle>
            </div>

            {/* Optional STEP-1 hero figure */}
            {figure !== null && figure !== undefined && (
              <span
                className="shrink-0 font-[var(--font-mono)] text-[36px] leading-none tabular-nums tracking-[-0.03em] text-[#0A0A0A]"
                aria-label={`${figure} ${title}`}
              >
                {figure}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// DrillSubRow — a reusable TIER-3 inset row for drawer body content
// ---------------------------------------------------------------------------

interface DrillSubRowProps {
  /** STEP-3 eyebrow label */
  label: string
  children: ReactNode
  className?: string
}

/**
 * DrillSubRow — a TIER-3 .card-inset row inside the drill drawer body.
 *
 * Usage:
 *   <DrillSubRow label="Your snippet">
 *     <p>…content…</p>
 *   </DrillSubRow>
 */
export function DrillSubRow({ label, children, className }: DrillSubRowProps) {
  return (
    <div className={cn('card-inset px-4 py-3', className)}>
      {/* STEP-3 eyebrow */}
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {label}
      </p>
      <div className="text-[14px] leading-relaxed text-[#374151]">
        {children}
      </div>
    </div>
  )
}
