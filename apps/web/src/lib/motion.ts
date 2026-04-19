import type { Transition } from 'framer-motion'

export const spring: Record<'subtle' | 'bouncy' | 'snappy', Transition> = {
  subtle: { type: 'spring', stiffness: 260, damping: 30 },
  bouncy: { type: 'spring', stiffness: 400, damping: 22 },
  snappy: { type: 'spring', stiffness: 500, damping: 35 },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: spring.subtle,
}
