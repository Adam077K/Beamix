'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, FileText, Search, MessageSquare, Shield, TrendingUp } from 'lucide-react'
import { CARD } from '@/components/marketing/card'
import { FadeUp } from '@/components/marketing/motion'

// ─── Agent definitions — business-friendly language ──────────────────────────

interface Agent {
  name: string
  icon: typeof Sparkles
  color: string
  verb: string       // what it's doing right now (plain English)
  result: string     // the tangible outcome
  progress: number
  x: number          // cursor position %
  y: number
  delay: number
}

const AGENTS: Agent[] = [
  {
    name: 'Brand',
    icon: Sparkles,
    color: '#3370FF',
    verb: 'Getting you mentioned',
    result: 'Added to 3 AI answers',
    progress: 100,
    x: 72, y: 20,
    delay: 0.4,
  },
  {
    name: 'Writer',
    icon: FileText,
    color: '#10B981',
    verb: 'Writing your content',
    result: 'FAQ page ready to publish',
    progress: 82,
    x: 10, y: 34,
    delay: 0.7,
  },
  {
    name: 'Scanner',
    icon: Search,
    color: '#F59E0B',
    verb: 'Finding opportunities',
    result: '5 quick wins found',
    progress: 100,
    x: 50, y: 48,
    delay: 1.0,
  },
  {
    name: 'Q&A',
    icon: MessageSquare,
    color: '#8B5CF6',
    verb: 'Answering for you',
    result: '6 of 8 answers ready',
    progress: 75,
    x: 15, y: 68,
    delay: 1.3,
  },
  {
    name: 'Monitor',
    icon: Shield,
    color: '#EC4899',
    verb: 'Watching competitors',
    result: '4 competitors tracked',
    progress: 100,
    x: 60, y: 78,
    delay: 1.6,
  },
]

// ─── Cursor arrow SVG ────────────────────────────────────────────────────────

function CursorArrow({ color }: { color: string }) {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="shrink-0 drop-shadow-sm">
      <path
        d="M1 1L11 8.5L6 9.5L4 15L1 1Z"
        fill={color}
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Agent cursor with name pill ─────────────────────────────────────────────

function AgentCursor({ agent }: { agent: Agent }) {
  const Icon = agent.icon
  const isDone = agent.progress === 100

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
      initial={{ opacity: 0, scale: 0.5, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: agent.delay, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, -2.5, 0], x: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: agent.delay * 0.7 }}
      >
        {/* Arrow */}
        <CursorArrow color={agent.color} />

        {/* Name pill */}
        <div
          className="absolute left-2.5 top-3 flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 shadow-md"
          style={{ backgroundColor: agent.color }}
        >
          <div className="size-4 rounded-full bg-white/20 flex items-center justify-center">
            <Icon className="size-2.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-semibold text-white whitespace-nowrap">{agent.name}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Task cards that appear on the workspace ─────────────────────────────────

function TaskCard({ agent, side }: { agent: Agent; side: 'left' | 'right' }) {
  const isDone = agent.progress === 100

  return (
    <motion.div
      className={`flex items-start gap-3 ${side === 'right' ? 'justify-end' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: agent.delay + 0.5, ease: 'easeOut' }}
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-4 max-w-[260px]">
        {/* Status line */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="size-1.5 rounded-full"
            style={{ backgroundColor: isDone ? agent.color : agent.color }}
          />
          <span className="text-[11px] font-medium" style={{ color: agent.color }}>{agent.verb}</span>
        </div>

        {/* Result */}
        <p className="text-sm font-medium text-gray-900 text-pretty">{agent.result}</p>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: agent.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${agent.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: agent.delay + 0.7, ease: 'easeOut' }}
            />
          </div>
          {isDone ? (
            <div className="size-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
              <Check className="size-2.5" style={{ color: agent.color }} strokeWidth={3} />
            </div>
          ) : (
            <span className="text-[11px] font-medium tabular-nums text-gray-400">{agent.progress}%</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function GroupAgentLight() {
  return (
    <FadeUp>
      <div className={`${CARD} overflow-hidden`}>
        {/* Header — friendly, non-technical */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 text-balance">
                Your AI team is working right now
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-pretty leading-relaxed">
                5 agents are improving how AI search engines talk about your business. You don't need to do anything — they handle it.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <motion.div
                className="size-2 rounded-full bg-[#10B981]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-gray-500">Active now</span>
            </div>
          </div>
        </div>

        {/* Canvas area — white workspace with cursors and task cards */}
        <div className="relative mx-6 mb-6 rounded-xl border border-gray-100 bg-[#FAFBFC] overflow-hidden" style={{ minHeight: 420 }}>
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: 'radial-gradient(circle, #D1D5DB 0.5px, transparent 0.5px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          {/* Task cards — scattered layout for natural feel */}
          <div className="relative z-10 p-6" style={{ minHeight: 380 }}>
            {/* Top right: Brand */}
            <div className="absolute right-8 top-6">
              <TaskCard agent={AGENTS[0]} side="right" />
            </div>
            {/* Left: Writer */}
            <div className="absolute left-6 top-14">
              <TaskCard agent={AGENTS[1]} side="left" />
            </div>
            {/* Center: Scanner — moved toward middle */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[45%]">
              <TaskCard agent={AGENTS[2]} side="left" />
            </div>
            {/* Bottom left: Q&A */}
            <div className="absolute left-8 bottom-8">
              <TaskCard agent={AGENTS[3]} side="left" />
            </div>
            {/* Bottom right: Monitor */}
            <div className="absolute right-10 bottom-10">
              <TaskCard agent={AGENTS[4]} side="right" />
            </div>
          </div>

          {/* Floating cursor arrows — on top of everything */}
          {AGENTS.map(agent => (
            <AgentCursor key={agent.name} agent={agent} />
          ))}
        </div>

        {/* Bottom summary — friendly metrics */}
        <div className="border-t border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {[
                { label: 'Tasks done this week', value: '14' },
                { label: 'Content created', value: '3 pages' },
                { label: 'Visibility improvement', value: '+42%' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-[11px] text-gray-400">{stat.label}</p>
                  <p className="text-base font-semibold text-gray-900 tabular-nums mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Agent avatars */}
            <div className="flex items-center">
              {AGENTS.map((a, i) => (
                <div
                  key={a.name}
                  className="size-6 rounded-full border-2 border-white flex items-center justify-center -ml-1.5 first:ml-0"
                  style={{ backgroundColor: a.color, zIndex: AGENTS.length - i }}
                  title={a.name}
                >
                  <a.icon className="size-3 text-white" strokeWidth={2.5} />
                </div>
              ))}
              <span className="text-[11px] text-gray-400 ml-2.5">5 active</span>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  )
}
