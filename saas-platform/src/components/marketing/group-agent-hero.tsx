'use client'

import { motion } from 'framer-motion'
import { Sparkles, FileText, BarChart3, MessageSquare, Search, Shield } from 'lucide-react'
import { FadeUp } from '@/components/marketing/motion'

// ─── Agent types — structured left/right clusters ────────────────────────────

const LEFT_AGENTS = [
  { name: 'Brand Agent', icon: Sparkles, color: '#3370FF', delay: 0.4 },
  { name: 'Analytics Agent', icon: BarChart3, color: '#2563EB', delay: 0.6 },
  { name: 'SEO Scanner', icon: Search, color: '#93B4FF', delay: 0.8 },
]

const RIGHT_AGENTS = [
  { name: 'Content Writer', icon: FileText, color: '#5A8FFF', delay: 0.5 },
  { name: 'FAQ Agent', icon: MessageSquare, color: '#60A5FA', delay: 0.7 },
  { name: 'Competitor Intel', icon: Shield, color: '#1E40AF', delay: 0.9 },
]

// ─── Agent pill — professional style ─────────────────────────────────────────

function AgentPill({ agent, align }: { agent: typeof LEFT_AGENTS[0]; align: 'left' | 'right' }) {
  const Icon = agent.icon
  return (
    <motion.div
      className={`flex items-center gap-2.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, x: align === 'left' ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: agent.delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Icon circle */}
      <div
        className="size-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
      >
        <Icon className="h-4 w-4" style={{ color: agent.color }} />
      </div>

      {/* Label */}
      <div className={align === 'right' ? 'text-right' : ''}>
        <span className="text-sm font-medium text-white block">{agent.name}</span>
        <motion.div
          className="h-0.5 rounded-full mt-1"
          style={{ backgroundColor: `${agent.color}40` }}
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: agent.delay + 0.3 }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GroupAgentHero() {
  return (
    <FadeUp>
      <div className="relative rounded-2xl bg-[#0A0A14] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-[#3370FF]/[0.06] blur-[100px]" />
        </div>

        <div className="relative z-10 grid grid-cols-[180px_1fr_180px] items-center min-h-[380px] px-8 py-12">
          {/* Left column — agents */}
          <div className="flex flex-col gap-5">
            {LEFT_AGENTS.map(agent => (
              <AgentPill key={agent.name} agent={agent} align="left" />
            ))}
          </div>

          {/* Center — headline + CTA */}
          <div className="flex flex-col items-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-white tracking-[-0.02em] leading-tight">
                AI agents that<br />do the work
              </h3>
              <p className="text-sm text-white/50 mt-3 max-w-xs leading-relaxed">
                Six specialized agents analyze, write, and optimize your AI search presence automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-7"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 w-60">
                  <span className="text-sm text-white/25">Enter your business URL...</span>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-[#3370FF] text-white text-sm font-medium px-5 py-2.5 shadow-[0_4px_20px_rgba(51,112,255,0.4)] hover:shadow-[0_4px_28px_rgba(51,112,255,0.55)] transition-all duration-200"
                >
                  Try Free
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right column — agents */}
          <div className="flex flex-col gap-5">
            {RIGHT_AGENTS.map(agent => (
              <AgentPill key={agent.name} agent={agent} align="right" />
            ))}
          </div>
        </div>
      </div>
    </FadeUp>
  )
}
