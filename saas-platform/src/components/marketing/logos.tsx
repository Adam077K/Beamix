'use client'

import type React from 'react'
import { cn } from '@/lib/utils'

// ─── Logo.dev API ────────────────────────────────────────────────────────────

const LOGO_DEV_KEY = 'pk_Zl-VsfExQ8Ou_bmqOwe1sA'

function logoDevUrl(name: string, size: number = 64): string {
  return `https://img.logo.dev/${name}?token=${LOGO_DEV_KEY}&size=${size}&format=png`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogoSize = 'sm' | 'md' | 'lg'

const SIZES: Record<LogoSize, number> = { sm: 20, md: 24, lg: 32 }

interface BrandMarkProps {
  size?: LogoSize
  className?: string
}

// ─── Logo image component ────────────────────────────────────────────────────

function LogoImg({
  domain,
  alt,
  size = 'md',
  className,
  rounded = 'rounded-md',
}: {
  domain: string
  alt: string
  size?: LogoSize
  className?: string
  rounded?: string
}) {
  const s = SIZES[size]
  return (
    <img
      src={logoDevUrl(domain, s * 2)}
      alt={alt}
      width={s}
      height={s}
      className={cn('shrink-0 object-contain', rounded, className)}
      loading="lazy"
    />
  )
}

// ─── Fallback letter mark ────────────────────────────────────────────────────

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

// ─── AI Engine logos (real logos via logo.dev) ────────────────────────────────

const ENGINE_DOMAINS: Record<string, string> = {
  ChatGPT: 'openai.com',
  Gemini: 'gemini.google.com',
  Perplexity: 'perplexity.ai',
  Claude: 'anthropic.com',
  'Google AI': 'google.com',
  'Google AI Overviews': 'google.com',
  Grok: 'x.com',
  DeepSeek: 'deepseek.com',
}

function EngineLogo({ engine, size = 'md', className }: BrandMarkProps & { engine: string }) {
  const domain = ENGINE_DOMAINS[engine]
  if (domain) {
    return <LogoImg domain={domain} alt={engine} size={size} className={className} rounded="rounded-full" />
  }
  return <BrandMark letter={engine[0]} bg="#94A3B8" size={size} className={className} />
}

// Wrapper components for backward compatibility
export function ChatGPTMark(props: BrandMarkProps) {
  return <EngineLogo engine="ChatGPT" {...props} />
}
export function GeminiMark(props: BrandMarkProps) {
  return <EngineLogo engine="Gemini" {...props} />
}
export function PerplexityMark(props: BrandMarkProps) {
  return <EngineLogo engine="Perplexity" {...props} />
}
export function ClaudeMark(props: BrandMarkProps) {
  return <EngineLogo engine="Claude" {...props} />
}
export function GoogleAIMark(props: BrandMarkProps) {
  return <EngineLogo engine="Google AI" {...props} />
}
export function GrokMark(props: BrandMarkProps) {
  return <EngineLogo engine="Grok" {...props} />
}
export function DeepSeekMark(props: BrandMarkProps) {
  return <EngineLogo engine="DeepSeek" {...props} />
}

// ─── Engine logo map ─────────────────────────────────────────────────────────

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

// ─── Coffee brand logos ──────────────────────────────────────────────────────

export function BrewBeanMark(props: BrandMarkProps) {
  return <BrandMark letter="BB" bg="#3370FF" {...props} />
}

const COMPETITOR_DOMAINS: Record<string, string> = {
  'The Daily Grind': 'thedailygrind.com',
  'Morning Roast Co': 'morningroast.com',
  'Bean Scene': 'beanscene.com.au',
  'Espresso Lab': 'espressolab.com',
  'Starbucks': 'starbucks.com',
  'Blue Bottle': 'bluebottlecoffee.com',
  "Peet's Coffee": 'peets.com',
}

export function CompetitorMark({
  name,
  index = 0,
  size = 'md',
  className,
}: BrandMarkProps & { name: string; index?: number }) {
  const domain = COMPETITOR_DOMAINS[name]
  if (domain) {
    return <LogoImg domain={domain} alt={name} size={size} className={className} rounded="rounded-full" />
  }
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#1E40AF', '#2563EB', '#5A8FFF', '#1D4ED8', '#3B82F6']
  return <BrandMark letter={initials} bg={colors[index % colors.length]} size={size} className={className} />
}

// ─── Domain favicon logos ────────────────────────────────────────────────────

export function DomainFavicon({
  domain,
  size = 'md',
  className,
}: { domain: string; size?: LogoSize; className?: string }) {
  return <LogoImg domain={domain} alt={domain} size={size} className={className} rounded="rounded-md" />
}
