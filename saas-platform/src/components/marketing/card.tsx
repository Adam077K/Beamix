'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

// ─── Premium card system ─────────────────────────────────────────────────────
// Josh Comeau layered shadows + Vercel border opacity + Attio spacing
//
// Shadow: layered (tight structural + soft ambient)
// Border: near-invisible black/6%
// Hover: -translate-y-0.5 + blue-hinted enhanced shadow
// Radius: 12px (rounded-xl) consistently
// Padding: p-6 minimum (24px breathing room)

// Base card — the default for every white card on the page
export const CARD = [
  'bg-white rounded-xl',
  'border border-black/[0.06]',
  'shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]',
].join(' ')

// Interactive hover — lifts with blue-tinted shadow
export const CARD_HOVER = [
  CARD,
  'transition-all duration-200 ease-out',
  'hover:-translate-y-0.5',
  'hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_24px_hsl(220_80%_60%/0.08)]',
  'hover:border-black/[0.08]',
].join(' ')

// Accent card — blue-hinted shadow at rest
export const CARD_ACCENT = [
  'bg-white rounded-xl',
  'border border-[#3370FF]/[0.08]',
  'shadow-[0_1px_2px_hsl(220_80%_60%/0.04),0_4px_16px_hsl(220_80%_60%/0.06)]',
  'transition-all duration-200 ease-out',
  'hover:-translate-y-0.5',
  'hover:shadow-[0_2px_4px_hsl(220_80%_60%/0.06),0_8px_28px_hsl(220_80%_60%/0.10)]',
].join(' ')

// ─── Animated card wrapper ───────────────────────────────────────────────────

const ease = [0.25, 0.1, 0.25, 1.0] as const

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = false,
  accent = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  accent?: boolean
}) {
  const cardClass = accent ? CARD_ACCENT : hover ? CARD_HOVER : CARD

  return (
    <motion.div
      className={cn(cardClass, className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease, delay }}
    >
      {children}
    </motion.div>
  )
}
