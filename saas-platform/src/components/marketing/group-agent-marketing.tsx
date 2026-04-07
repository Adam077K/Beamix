'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { FadeUp } from '@/components/marketing/motion'

// ─── Agent cursor definitions ────────────────────────────────────────────────

interface AgentCursor {
  name: string
  color: string
  // Position as % from top-left
  x: number
  y: number
  delay: number
  // What the agent is doing right now
  task: string
  progress: number // 0-100
}

const CURSORS: AgentCursor[] = [
  { name: 'Brand Agent', color: '#10B981', x: 62, y: 14, delay: 0.3, task: 'Optimizing brand mentions', progress: 100 },
  { name: 'Content Writer', color: '#D4A574', x: 18, y: 38, delay: 0.6, task: 'Writing FAQ page', progress: 78 },
  { name: 'SEO Scanner', color: '#4285F4', x: 72, y: 56, delay: 0.9, task: 'Fixing schema markup', progress: 100 },
  { name: 'FAQ Agent', color: '#8B5CF6', x: 28, y: 72, delay: 1.2, task: 'Generating Q&As', progress: 45 },
  { name: 'Competitor Intel', color: '#EA4335', x: 68, y: 82, delay: 1.5, task: 'Monitoring 4 competitors', progress: 62 },
]

// ─── Work items appearing in the "canvas" ────────────────────────────────────

const WORK_ITEMS = [
  {
    type: 'content' as const,
    agent: 'Content Writer',
    x: 8,
    y: 28,
    delay: 1.4,
    lines: [
      '## Why Choose Brew & Bean?',
      '',
      'Our single-origin beans are roasted',
      'in-house daily. Open until midnight.',
    ],
  },
  {
    type: 'fix' as const,
    agent: 'SEO Scanner',
    x: 56,
    y: 44,
    delay: 1.8,
    text: 'Added LocalBusiness schema to homepage',
  },
  {
    type: 'fix' as const,
    agent: 'Brand Agent',
    x: 48,
    y: 8,
    delay: 0.8,
    text: 'Mention added to ChatGPT response #3',
  },
  {
    type: 'metric' as const,
    agent: 'FAQ Agent',
    x: 14,
    y: 64,
    delay: 2.2,
    label: 'Q&As generated',
    value: '6/8',
  },
  {
    type: 'metric' as const,
    agent: 'Competitor Intel',
    x: 56,
    y: 74,
    delay: 2.6,
    label: 'Competitors tracked',
    value: '4',
  },
]

// ─── Cursor SVG — colored arrow ──────────────────────────────────────────────

function CursorArrow({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className="shrink-0">
      <path
        d="M1.5 1L12.5 9L7 10.5L5 17L1.5 1Z"
        fill={color}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Agent cursor pill (floating) ────────────────────────────────────────────

function AgentCursorPill({ cursor }: { cursor: AgentCursor }) {
  const isDone = cursor.progress === 100

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: cursor.delay, ease: 'easeOut' }}
    >
      {/* Cursor arrow — subtle float animation */}
      <motion.div
        className="relative"
        animate={{ y: [0, -3, 0], x: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: cursor.delay * 0.5 }}
      >
        <CursorArrow color={cursor.color} />

        {/* Name pill — positioned below-right of cursor tip */}
        <div
          className="absolute left-3 top-3.5 flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg whitespace-nowrap"
          style={{
            backgroundColor: cursor.color,
          }}
        >
          <span className="text-[11px] font-semibold text-white">{cursor.name}</span>

          {/* Progress or check */}
          {isDone ? (
            <div className="size-3.5 rounded-full bg-white/25 flex items-center justify-center">
              <Check className="size-2 text-white" strokeWidth={3} />
            </div>
          ) : (
            <span className="text-[10px] font-medium text-white/70 tabular-nums">{cursor.progress}%</span>
          )}
        </div>

        {/* Task label — smaller, below the pill */}
        <motion.div
          className="absolute left-3 top-10 mt-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: cursor.delay + 0.4 }}
        >
          <span
            className="text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap"
            style={{ color: cursor.color, backgroundColor: `${cursor.color}12` }}
          >
            {cursor.task}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── Work output card (appears on the canvas) ────────────────────────────────

function WorkCard({ item, index }: { item: typeof WORK_ITEMS[0]; index: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, maxWidth: item.type === 'content' ? 280 : 220 }}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: item.delay, ease: 'easeOut' }}
    >
      {item.type === 'content' && (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-3.5 shadow-xl">
          <div className="font-mono text-[11px] leading-relaxed text-white/60 space-y-0.5">
            {item.lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay + 0.15 * i }}
                className={line.startsWith('##') ? 'text-white/90 font-semibold text-xs' : ''}
              >
                {line || '\u00A0'}
              </motion.p>
            ))}
            {/* Blinking cursor */}
            <motion.span
              className="inline-block w-1.5 h-3 bg-white/40 rounded-sm"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>
      )}

      {item.type === 'fix' && (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-2 shadow-xl flex items-center gap-2">
          <div className="size-4 rounded-full bg-[#3370FF]/20 flex items-center justify-center shrink-0">
            <Check className="size-2.5 text-[#3370FF]" />
          </div>
          <span className="text-[11px] text-white/60">{item.text}</span>
        </div>
      )}

      {item.type === 'metric' && (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-3 py-2 shadow-xl">
          <p className="text-[10px] text-white/40">{item.label}</p>
          <p className="text-lg font-semibold text-white tabular-nums mt-0.5">{item.value}</p>
        </div>
      )}
    </motion.div>
  )
}

// ─── Impact footer ───────────────────────────────────────────────────────────

function ImpactFooter() {
  return (
    <motion.div
      className="flex items-center justify-between px-8 py-5 border-t border-white/[0.06]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 2.8 }}
    >
      <div className="flex items-center gap-6">
        {[
          { label: 'Tasks completed', value: '14' },
          { label: 'Content pieces', value: '3' },
          { label: 'Visibility gain', value: '+42%' },
        ].map(stat => (
          <div key={stat.label}>
            <p className="text-[10px] text-white/40">{stat.label}</p>
            <p className="text-base font-semibold text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {CURSORS.map(c => (
          <div
            key={c.name}
            className="size-2 rounded-full"
            style={{ backgroundColor: c.color }}
            title={c.name}
          />
        ))}
        <span className="text-[11px] text-white/40 ml-1">5 agents active</span>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GroupAgentMarketing() {
  return (
    <FadeUp>
      <div className="relative rounded-2xl bg-[#0A0A14] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[250px] rounded-full bg-[#3370FF]/[0.04] blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[200px] rounded-full bg-[#8B5CF6]/[0.03] blur-[80px]" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-7 pb-2">
          <div>
            <h3 className="text-base font-semibold text-white text-balance">AI Agents Working on Your Business</h3>
            <p className="text-[11px] text-white/40 mt-1 text-pretty">5 agents running simultaneously — writing content, fixing SEO, monitoring competitors</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="size-1.5 rounded-full bg-[#10B981]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[11px] text-white/50">Live</span>
          </div>
        </div>

        {/* Canvas — where agents work */}
        <div className="relative z-10 mx-6 my-4 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden" style={{ minHeight: 460 }}>
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
          />

          {/* Work output cards */}
          {WORK_ITEMS.map((item, i) => (
            <WorkCard key={i} item={item} index={i} />
          ))}

          {/* Agent cursors — on top of everything */}
          {CURSORS.map(cursor => (
            <AgentCursorPill key={cursor.name} cursor={cursor} />
          ))}
        </div>

        {/* Impact footer */}
        <ImpactFooter />
      </div>
    </FadeUp>
  )
}
