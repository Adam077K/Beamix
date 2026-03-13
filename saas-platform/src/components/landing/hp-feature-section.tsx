'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, BarChart2, ArrowUpRight } from 'lucide-react'

const agents = [
  { label: 'Content Writer', status: 'Complete', progress: 100, color: '#10B981' },
  { label: 'Schema Optimizer', status: 'Running', progress: 67, color: '#023c65' },
  { label: 'FAQ Agent', status: 'Running', progress: 34, color: '#023c65' },
  { label: 'Blog Writer', status: 'Queued', progress: 0, color: '#9C9C94' },
  { label: 'Competitor Intel', status: 'Complete', progress: 100, color: '#10B981' },
]

const weeklyData = [18, 24, 28, 31, 38, 45, 52, 61]

export function HpFeatureSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <section ref={ref} className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center text-sm text-[#78716C] mb-10"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          From invisible to ranked — without touching a word yourself
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-[#F9FAFB] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F4F2]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-[#141310]" style={{ fontFamily: 'var(--font-inter)' }}>AI Agent Workspace</span>
            </div>
            <span className="text-xs text-[#78716C]" style={{ fontFamily: 'var(--font-inter)' }}>yourbusiness.com · Live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0">

            {/* Left — agent list */}
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-5" style={{ fontFamily: 'var(--font-inter)' }}>
                Active Agents
              </p>
              <div className="space-y-4">
                {agents.map(({ label, status, progress, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {status === 'Complete' && <CheckCircle2 size={13} color={color} />}
                        {status === 'Running' && <Loader2 size={13} color={color} className="animate-spin" />}
                        {status === 'Queued' && <Clock size={13} color={color} />}
                        <span className="text-sm text-[#141310]" style={{ fontFamily: 'var(--font-inter)' }}>{label}</span>
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color, fontFamily: 'var(--font-inter)' }}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="h-1 bg-[#F5F4F2] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${progress}%` } : {}}
                        transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block bg-[#F5F4F2]" />

            {/* Right — visibility chart */}
            <div className="p-6 border-t border-[#F5F4F2] md:border-t-0">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                    Visibility Score
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-semibold text-[#141310]" style={{ fontFamily: 'var(--font-serif)' }}>61</span>
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowUpRight size={14} className="text-[#10B981]" />
                      <span className="text-xs font-medium text-[#10B981]" style={{ fontFamily: 'var(--font-inter)' }}>+34 pts</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[#f0f5fa] rounded-lg px-3 py-1.5">
                  <BarChart2 size={12} className="text-[#023c65]" />
                  <span className="text-xs text-[#023c65] font-medium" style={{ fontFamily: 'var(--font-inter)' }}>8 weeks</span>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end gap-2 h-28">
                {weeklyData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <motion.div
                      className="w-full rounded-t-md"
                      style={{ backgroundColor: i === weeklyData.length - 1 ? '#023c65' : '#E8EFF6' }}
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${(val / 70) * 100}%` } : {}}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.07, ease: 'easeOut' }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'var(--font-inter)' }}>Wk 1</span>
                <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'var(--font-inter)' }}>Wk 8</span>
              </div>

              {/* Engine breakdown */}
              <div className="mt-5 pt-5 border-t border-[#F5F4F2] grid grid-cols-3 gap-3">
                {[
                  { engine: 'ChatGPT', score: 71 },
                  { engine: 'Gemini', score: 58 },
                  { engine: 'Perplexity', score: 54 },
                ].map(({ engine, score }) => (
                  <div key={engine} className="bg-[#FAFAF9] rounded-xl p-3 text-center border border-[#F5F4F2]">
                    <p className="text-base font-semibold text-[#141310]" style={{ fontFamily: 'var(--font-serif)' }}>{score}</p>
                    <p className="text-[10px] text-[#78716C] mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>{engine}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
