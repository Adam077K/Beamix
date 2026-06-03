import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type IllustrationType =
  | 'workspace'
  | 'inbox'
  | 'scan'
  | 'automation'
  | 'archive'
  | 'competitors'
  | 'settings'
  | 'auth'
  | 'error'

interface EmptyStateProps {
  /** Built-in on-brand glyph, used when `glyph` is not supplied. */
  illustration?: IllustrationType
  /** Custom brand glyph overriding `illustration`. Never raw Lucide-in-void. */
  glyph?: ReactNode
  /**
   * Ghosted preview of the real feature behind a subtle scrim (~40% opacity
   * skeleton of the actual UI). Converts an apology into a sales surface
   * (DESIGN-DIRECTION §4.3). Rendered above the glyph/heading.
   */
  preview?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  /**
   * Vertical placement. 'top' (~38% from top) is the default and the spec'd
   * value — dead-center reads "lost / failed". 'center' is kept for legacy
   * full-card states.
   */
  align?: 'top' | 'center'
  className?: string
}

const illustrations: Record<IllustrationType, ReactNode> = {
  workspace: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="12" width="48" height="36" rx="4" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="14" y="20" width="20" height="3" rx="1.5" fill="#D1D5DB" />
      <rect x="14" y="27" width="36" height="2" rx="1" fill="#E5E7EB" />
      <rect x="14" y="32" width="28" height="2" rx="1" fill="#E5E7EB" />
      <rect x="14" y="37" width="32" height="2" rx="1" fill="#E5E7EB" />
      <circle cx="46" cy="21" r="6" fill="#3370FF" fillOpacity="0.12" />
      <circle cx="46" cy="21" r="3" fill="#3370FF" fillOpacity="0.4" />
    </svg>
  ),
  inbox: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="16" width="48" height="32" rx="4" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M8 22 L32 34 L56 22" stroke="#D1D5DB" strokeWidth="2" fill="none" />
      <rect x="20" y="36" width="24" height="2" rx="1" fill="#E5E7EB" />
      <rect x="24" y="41" width="16" height="2" rx="1" fill="#E5E7EB" />
    </svg>
  ),
  scan: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="28" cy="28" r="16" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <circle cx="28" cy="28" r="10" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
      <line x1="40" y1="40" x2="54" y2="54" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="28" r="3" fill="#3370FF" fillOpacity="0.5" />
    </svg>
  ),
  automation: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="10" width="16" height="12" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="38" y="10" width="16" height="12" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="24" y="42" width="16" height="12" rx="3" stroke="#3370FF" strokeWidth="2" fill="#3370FF" fillOpacity="0.08" />
      <path d="M18 22 L18 32 Q18 36 22 36 L32 36" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M46 22 L46 32 Q46 36 42 36 L32 36" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="32" y1="36" x2="32" y2="42" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  archive: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="20" width="48" height="32" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="8" y="12" width="48" height="10" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F0F0F0" />
      <rect x="24" y="15" width="16" height="4" rx="2" fill="#D1D5DB" />
      <rect x="14" y="30" width="36" height="2" rx="1" fill="#E5E7EB" />
      <rect x="14" y="36" width="28" height="2" rx="1" fill="#E5E7EB" />
    </svg>
  ),
  competitors: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="32" r="10" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <circle cx="44" cy="32" r="10" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M30 26 Q32 32 30 38" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
      <path d="M34 26 Q32 32 34 38" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="32" r="3" fill="#D1D5DB" />
      <circle cx="44" cy="32" r="3" fill="#3370FF" fillOpacity="0.5" />
    </svg>
  ),
  settings: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="8" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M32 10 L32 16 M32 48 L32 54 M10 32 L16 32 M48 32 L54 32 M16.7 16.7 L21 21 M43 43 L47.3 47.3 M47.3 16.7 L43 21 M21 43 L16.7 47.3" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#D1D5DB" />
    </svg>
  ),
  auth: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="28" width="28" height="22" rx="4" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M22 28 L22 22 C22 14.3 42 14.3 42 22 L42 28" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="38" r="3" fill="#3370FF" fillOpacity="0.5" />
      <rect x="31" y="38" width="2" height="5" rx="1" fill="#D1D5DB" />
    </svg>
  ),
  error: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="22" stroke="#FCA5A5" strokeWidth="2" fill="#FEF2F2" />
      <line x1="32" y1="20" x2="32" y2="34" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="41" r="2" fill="#EF4444" />
    </svg>
  ),
}

/**
 * BrandGlyph — the default on-brand mark used when no `illustration` or `glyph`
 * is supplied: a soft blue Beamix mark in a tinted chip. Never a bare Lucide
 * icon floating in a void (DESIGN-DIRECTION §4.3).
 */
function BrandGlyph() {
  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF4FF]"
      aria-hidden="true"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 6h9a5 5 0 0 1 0 10H6V6Zm0 10h10a5 5 0 0 1 0 10H6V16Z"
          fill="#3370FF"
        />
        <circle cx="22" cy="6" r="2.5" fill="#3370FF" fillOpacity="0.45" />
      </svg>
    </div>
  )
}

/**
 * EmptyState — the reusable "selling" empty-state template (§4.3).
 *
 * Every empty stub should preview the SHAPE of the real feature behind a subtle
 * scrim and offer one action — converting a stub from an apology into a sales
 * surface. Aligned ~38% from top by default (dead-center reads "lost/failed").
 */
export function EmptyState({
  illustration,
  glyph,
  preview,
  title,
  description,
  action,
  align = 'top',
  className,
}: EmptyStateProps) {
  const mark =
    glyph ?? (illustration ? illustrations[illustration] : <BrandGlyph />)

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center px-6 text-center',
        align === 'top' ? 'pb-16 pt-[18vh]' : 'justify-center py-16',
        className,
      )}
    >
      {preview && (
        <div className="pointer-events-none relative mb-8 w-full max-w-[420px] select-none opacity-40">
          {preview}
          {/* Soft scrim so the preview reads as "coming", not interactive */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>
      )}

      <div className={cn('mb-5', illustration ? 'opacity-80' : '')}>{mark}</div>

      <h3 className="mb-2 text-base font-semibold text-[#0A0A0A]">{title}</h3>

      {description && (
        <p className="max-w-[360px] text-sm leading-relaxed text-[#6B7280]">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
