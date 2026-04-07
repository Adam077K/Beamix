'use client'

import { motion } from 'framer-motion'
import { ENGINE_LOGOS } from '@/components/marketing/logos'
import { FadeUp } from '@/components/marketing/motion'

// ─── 3 agents with diagonal stagger layout ───────────────────────────────────

const AGENTS = [
  { name: 'Brand Agent', engine: 'ChatGPT', color: '#10B981', x: 38, y: 14, delay: 0.4, flip: false },
  { name: 'Content Writer', engine: 'Claude', color: '#D4A574', x: 30, y: 44, delay: 0.7, flip: true },
  { name: 'SEO Scanner', engine: 'Gemini', color: '#4285F4', x: 48, y: 74, delay: 1.0, flip: false },
]

// ─── Cursor arrow ────────────────────────────────────────────────────────────

function CursorArrow({ color }: { color: string }) {
  return (
    <svg width="22" height="28" viewBox="0 0 16 20" fill="none">
      <path
        d="M1.5 1L14 10.5L7.5 12L5.5 19L1.5 1Z"
        fill={color}
        stroke="white"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Single floating cursor + glass pill ─────────────────────────────────────

function AgentCursorGlass({ agent }: { agent: typeof AGENTS[0] }) {
  const Logo = ENGINE_LOGOS[agent.engine]

  return (
    <motion.div
      className="absolute"
      style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
      initial={{ opacity: 0, scale: 0.5, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: agent.delay, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, -4, 0], x: [0, 2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: agent.delay }}
      >
        {/* Cursor arrow — flipped for right-side agents */}
        <div className={agent.flip ? 'flex justify-end' : ''}>
          <div style={agent.flip ? { transform: 'scaleX(-1)' } : undefined}>
            <CursorArrow color={agent.color} />
          </div>
        </div>

        {/* Glass pill */}
        <div className={agent.flip ? 'absolute right-4 top-5' : 'absolute left-4 top-5'}>
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 backdrop-blur-md border shadow-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              borderColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Engine logo in colored rounded square */}
            {Logo && (
              <div
                className="size-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${agent.color}18`, border: `1px solid ${agent.color}25` }}
              >
                <Logo size="sm" />
              </div>
            )}
            {/* Agent name */}
            <span className="text-[14px] font-semibold text-gray-800 whitespace-nowrap pr-1">
              {agent.name}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function GroupAgentCursors() {
  return (
    <FadeUp>
      <div className="relative rounded-2xl bg-[#F5F6F8] border border-gray-200/60 overflow-hidden" style={{ minHeight: 400 }}>
        {/* Subtle radial glow behind center */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-white/60 blur-[80px]" />
        </div>

        {/* Floating cursors */}
        {AGENTS.map(agent => (
          <AgentCursorGlass key={agent.name} agent={agent} />
        ))}
      </div>
    </FadeUp>
  )
}
