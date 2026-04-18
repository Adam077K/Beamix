export const spring = {
  subtle: { type: 'spring' as const, stiffness: 260, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 22 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 35 },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: spring.subtle,
}
