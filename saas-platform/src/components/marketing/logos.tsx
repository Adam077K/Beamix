'use client'

import type React from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogoSize = 'sm' | 'md' | 'lg'

const SIZES: Record<LogoSize, number> = { sm: 20, md: 24, lg: 32 }

interface BrandMarkProps {
  size?: LogoSize
  className?: string
}

// ─── Generic brand mark ───────────────────────────────────────────────────────

function BrandMark({
  letter,
  bg,
  size = 'md',
  className,
  textColor = 'white',
}: BrandMarkProps & { letter: string; bg: string; textColor?: string }) {
  const s = SIZES[size]
  const fontSize = s <= 20 ? 9 : s <= 24 ? 10 : 13
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-md font-bold shrink-0 shadow-sm leading-none',
        className,
      )}
      style={{ width: s, height: s, backgroundColor: bg, fontSize, color: textColor }}
      aria-hidden="true"
    >
      {letter}
    </div>
  )
}

// ─── AI Engine logos ──────────────────────────────────────────────────────────
// Brand colors are the ONE exception to blue-only — logos must be recognizable.

export function ChatGPTMark(props: BrandMarkProps) {
  return <BrandMark letter="G" bg="#10A37F" {...props} />
}

export function GeminiMark(props: BrandMarkProps) {
  return <BrandMark letter="G" bg="#4285F4" {...props} />
}

export function PerplexityMark(props: BrandMarkProps) {
  return <BrandMark letter="P" bg="#20B2AA" {...props} />
}

export function ClaudeMark(props: BrandMarkProps) {
  return <BrandMark letter="C" bg="#CC785C" {...props} />
}

export function GoogleAIMark(props: BrandMarkProps) {
  return <BrandMark letter="AI" bg="#EA4335" {...props} />
}

export function GrokMark(props: BrandMarkProps) {
  return <BrandMark letter="X" bg="#0A0A0A" {...props} />
}

export function DeepSeekMark(props: BrandMarkProps) {
  return <BrandMark letter="D" bg="#4A6CF7" {...props} />
}

// ─── Engine logo map ──────────────────────────────────────────────────────────

type MarkComponent = (props: BrandMarkProps) => React.ReactElement

export const ENGINE_LOGOS: Record<string, MarkComponent> = {
  ChatGPT: ChatGPTMark,
  Gemini: GeminiMark,
  Perplexity: PerplexityMark,
  Claude: ClaudeMark,
  'Google AI': GoogleAIMark,
  'Google AI Overviews': GoogleAIMark,
  Grok: GrokMark,
  DeepSeek: DeepSeekMark,
}

// ─── Coffee brand marks ───────────────────────────────────────────────────────
// User's own brand always gets the Beamix blue #3370FF.
// Competitor brands get blue-shade fallback marks (no PNG files available).

// Fixed competitor color palette — distinct shades from the brand blue family
const COMPETITOR_COLORS = [
  '#1E40AF', // deep blue
  '#2563EB', // mid blue
  '#5A8FFF', // light blue
  '#1D4ED8', // royal blue
  '#3B82F6', // sky blue
]

export function BrewBeanMark(props: BrandMarkProps) {
  return <BrandMark letter="BB" bg="#3370FF" {...props} />
}

export function CompetitorMark({
  name,
  index = 0,
  ...props
}: BrandMarkProps & { name: string; index?: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const bg = COMPETITOR_COLORS[index % COMPETITOR_COLORS.length]
  return <BrandMark letter={initials} bg={bg} {...props} />
}

// ─── Domain favicon marks ─────────────────────────────────────────────────────

const DOMAIN_CONFIG: Record<string, { initials: string; bg: string }> = {
  'reddit.com': { initials: 'r/', bg: '#FF5700' },
  'yelp.com': { initials: 'Yp', bg: '#D32323' },
  'wikipedia.org': { initials: 'W', bg: '#636466' },
  'competitor.com': { initials: 'Cp', bg: '#3370FF' },
  'techradar.com': { initials: 'TR', bg: '#0072CE' },
}

export function DomainFavicon({
  domain,
  size = 'md',
  className,
}: { domain: string; size?: LogoSize; className?: string }) {
  const config = DOMAIN_CONFIG[domain]
  const initials = config?.initials ?? domain[0].toUpperCase()
  const bg = config?.bg ?? '#94A3B8'
  return <BrandMark letter={initials} bg={bg} size={size} className={className} />
}
