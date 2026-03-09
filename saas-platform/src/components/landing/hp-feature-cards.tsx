'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FileText, HelpCircle, Code2, Link2 } from 'lucide-react'

const cards = [
  {
    icon: FileText,
    title: 'Content Writer',
    description:
      'Generates AI-optimized business descriptions that get you mentioned across ChatGPT, Gemini, and Perplexity.',
    gradient: 'from-amber-50 to-orange-50',
    iconColor: '#F59E0B',
    accent: '#FEF3C7',
  },
  {
    icon: HelpCircle,
    title: 'FAQ Generator',
    description:
      'Creates Q&A content structured to match how AI engines surface answers for your industry.',
    gradient: 'from-green-50 to-emerald-50',
    iconColor: '#4A7C59',
    accent: '#F0FDF4',
  },
  {
    icon: Code2,
    title: 'Schema Optimizer',
    description:
      'Injects structured data markup that helps AI search engines understand and rank your business.',
    gradient: 'from-blue-50 to-indigo-50',
    iconColor: '#3B82F6',
    accent: '#EFF6FF',
  },
  {
    icon: Link2,
    title: 'Citation Builder',
    description:
      'Identifies and builds the citation sources AI engines trust most to verify and recommend your business.',
    gradient: 'from-purple-50 to-violet-50',
    iconColor: '#8B5CF6',
    accent: '#F5F3FF',
  },
]

export function HpFeatureCards() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-semibold text-[#1A1A17] text-center mb-14 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Scan. Diagnose. Fix.
          <br />
          In that order.
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ icon: Icon, title, description, gradient, iconColor, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E8E6E1] overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card illustration header */}
              <div
                className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: accent }}
                >
                  <Icon size={28} color={iconColor} />
                </div>
              </div>
              <div className="p-5">
                <h3
                  className="text-base font-semibold text-[#1A1A17] mb-2"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm text-[#6B6B63] leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
