'use client'
import { useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'

const stats = [
  { value: 10, suffix: '+', label: 'AI engines scanned' },
  { value: 16, suffix: '', label: 'purpose-built agents' },
  { value: 60, suffix: 's', label: 'from URL to Visibility Score' },
]

function AnimatedNumber({
  value,
  suffix,
  inView,
}: {
  value: number
  suffix: string
  inView: boolean
}) {
  const motionVal = useMotionValue(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate(latest) {
        if (ref.current) ref.current.textContent = Math.round(latest) + suffix
      },
    })
    return controls.stop
  }, [inView, value, suffix, motionVal])

  return (
    <span
      ref={ref}
      className="text-5xl font-semibold text-[#141310]"
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      0{suffix}
    </span>
  )
}

export function HpStats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl font-normal text-[#141310] text-center mb-16 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Built for businesses that refuse to be invisible.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <AnimatedNumber value={value} suffix={suffix} inView={inView} />
              <p
                className="mt-2 text-sm text-[#78716C] leading-relaxed"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
