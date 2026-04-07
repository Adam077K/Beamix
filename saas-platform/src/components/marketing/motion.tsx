'use client'

import { motion, type Variants, type Easing } from 'framer-motion'
import { type ReactNode } from 'react'

// Standard ease-out per ui-skills: NEVER introduce custom easing unless requested
const ease: Easing = 'easeOut'
const transition = { duration: 0.5, ease }

// ─── Fade up on scroll ───────────────────────────────────────────────────────

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...transition, delay },
  }),
}

export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger container ───────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      custom={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Scale in ────────────────────────────────────────────────────────────────

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease, delay },
  }),
}

export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Pulse — subtle scale loop ───────────────────────────────────────────────
// Only transform + opacity (compositor-only per ui-skills)

export function Pulse({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
