'use client'
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'What is an agent use?',
    a: "One execution. One deliverable. The Content Writer produces a full page. The Schema Optimizer produces a JSON-LD file. One credit per run, regardless of agent or time.",
  },
  {
    q: 'Do I need technical knowledge?',
    a: "No. You enter your URL. Beamix scans. Agents produce finished content. You review and publish. No code. No configuration.",
  },
  {
    q: "What if I publish and nothing changes?",
    a: "Beamix rescans within 48 hours of any agent run. You see exactly what moved. If something didn't work, the next recommendation adjusts.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts. No cancellation fees. Two clicks from your settings page.',
  },
  {
    q: 'Is there a Hebrew version?',
    a: 'Yes. Full Hebrew interface with RTL support. Toggle in the top navigation.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[#E8E6E1]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span
          className="text-base font-medium text-[#141310]"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {q}
        </span>
        {open ? (
          <Minus size={16} className="text-[#78716C] shrink-0" />
        ) : (
          <Plus size={16} className="text-[#78716C] shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p
              className="text-sm text-[#78716C] leading-relaxed pb-5"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function HpFaq() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-[#023c65] text-sm font-medium tracking-widest uppercase mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-normal text-[#141310] leading-tight mb-12"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Questions we hear a lot.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
