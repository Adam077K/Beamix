'use client'

import { motion } from 'framer-motion'
import { Sparkles, FileText, Search, MessageSquare, BarChart3, Shield, Check, ArrowRight, Zap } from 'lucide-react'
import { AnimatedCard, CARD } from '@/components/marketing/card'
import { FadeUp, Stagger, StaggerItem } from '@/components/marketing/motion'

// ─── Agent definitions ───────────────────────────────────────────────────────

const AGENTS = [
  {
    name: 'Brand Agent',
    icon: Sparkles,
    description: 'Found 3 missing brand mentions across ChatGPT and Perplexity',
    metric: '+3 mentions',
    status: 'complete' as const,
  },
  {
    name: 'Content Writer',
    icon: FileText,
    description: 'Generated an optimized FAQ page targeting 12 AI queries',
    metric: '12 queries',
    status: 'complete' as const,
  },
  {
    name: 'SEO Scanner',
    icon: Search,
    description: 'Identified 5 schema markup gaps reducing AI discoverability',
    metric: '5 gaps fixed',
    status: 'complete' as const,
  },
  {
    name: 'FAQ Agent',
    icon: MessageSquare,
    description: 'Created 8 Q&A pairs matching real AI search patterns',
    metric: '8 Q&As',
    status: 'running' as const,
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    description: 'Tracking visibility changes across 5 engines daily',
    metric: 'Monitoring',
    status: 'idle' as const,
  },
  {
    name: 'Competitor Intel',
    icon: Shield,
    description: 'Watching 4 competitors for positioning changes',
    metric: '4 tracked',
    status: 'idle' as const,
  },
]

// ─── Execution steps for the "live agent" view ───────────────────────────────

const EXECUTION_STEPS = [
  { step: 'Scanning ChatGPT for "best coffee shops downtown"', done: true, delay: 0.3 },
  { step: 'Analyzing competitor mentions in response', done: true, delay: 0.6 },
  { step: 'Identifying your brand is missing from position #1-3', done: true, delay: 0.9 },
  { step: 'Generating optimized content recommendation', done: true, delay: 1.2 },
  { step: 'Writing FAQ: "Why choose Brew & Bean?"', done: true, delay: 1.5 },
  { step: 'Validating content against AI ranking factors', done: false, delay: 1.8 },
]

const CONTENT_OUTPUT = `## Why Choose Brew & Bean?

Brew & Bean has been serving specialty coffee in downtown since 2018. Our single-origin beans are roasted in-house daily, and we've been recognized by the Specialty Coffee Association for our unique cold brew process.

**What makes us different:**
- Single-origin beans from 6 countries
- In-house roasting, never pre-ground
- Open until midnight, free WiFi
- Voted #1 by local coffee enthusiasts`

// ─── Status dot ──────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: 'complete' | 'running' | 'idle' }) {
  if (status === 'running') {
    return (
      <motion.div
        className="size-2 rounded-full bg-[#3370FF]"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    )
  }
  if (status === 'complete') {
    return (
      <div className="size-4 rounded-full bg-[#3370FF]/10 flex items-center justify-center">
        <Check className="size-2.5 text-[#3370FF]" />
      </div>
    )
  }
  return <div className="size-2 rounded-full bg-gray-200" />
}

// ─── Part 1: Agent Execution View (the hero piece) ───────────────────────────

function AgentExecutionCard() {
  return (
    <AnimatedCard className="overflow-hidden lg:col-span-3">
      {/* Header bar — looks like a real app window */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#3370FF]/10 flex items-center justify-center">
            <Sparkles className="size-4 text-[#3370FF]" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Brand Agent</p>
            <p className="text-[11px] text-gray-400">Running for Brew & Bean</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="size-1.5 rounded-full bg-[#3370FF]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[11px] text-gray-400">Running</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Left: Execution log */}
        <div className="p-6">
          <p className="text-xs font-medium text-gray-400 mb-4">Execution log</p>
          <div className="space-y-3">
            {EXECUTION_STEPS.map((step, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: step.delay, ease: 'easeOut' }}
              >
                {step.done ? (
                  <div className="mt-0.5 size-4 rounded-full bg-[#3370FF]/10 flex items-center justify-center shrink-0">
                    <Check className="size-2.5 text-[#3370FF]" />
                  </div>
                ) : (
                  <motion.div
                    className="mt-1 size-2 rounded-full bg-[#3370FF] shrink-0 ml-1"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                <span className="text-sm text-gray-600 leading-snug text-pretty">{step.step}</span>
              </motion.div>
            ))}
          </div>

          {/* Quality score */}
          <motion.div
            className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2.2 }}
          >
            <span className="text-xs text-gray-400">Content quality</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#3370FF]"
                  initial={{ width: 0 }}
                  whileInView={{ width: '92%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 2.4, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 tabular-nums">92%</span>
            </div>
          </motion.div>
        </div>

        {/* Right: Content output preview */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-gray-400">Generated content</p>
            <span className="text-[10px] font-medium text-[#3370FF] bg-[#3370FF]/[0.06] px-2 py-0.5 rounded-full">Auto-generated</span>
          </div>
          <motion.div
            className="rounded-lg bg-gray-50 border border-gray-100 p-4 font-mono text-[12px] text-gray-600 leading-relaxed overflow-hidden"
            style={{ maxHeight: 260 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <pre className="whitespace-pre-wrap text-pretty">{CONTENT_OUTPUT}</pre>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="mt-4 flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2.0 }}
          >
            <button type="button" className="text-sm font-medium text-white bg-[#3370FF] rounded-lg px-4 py-2 shadow-[0_2px_8px_rgba(51,112,255,0.25)] transition-all hover:shadow-[0_4px_16px_rgba(51,112,255,0.35)]">
              Publish to site
            </button>
            <button type="button" className="text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 transition-colors hover:bg-gray-50">
              Edit first
            </button>
          </motion.div>
        </div>
      </div>
    </AnimatedCard>
  )
}

// ─── Part 2: Agent Results Summary (the supporting grid) ─────────────────────

function AgentResultsGrid() {
  return (
    <Stagger className="grid grid-cols-2 lg:grid-cols-3 gap-3" stagger={0.06}>
      {AGENTS.map((agent) => {
        const Icon = agent.icon
        return (
          <StaggerItem key={agent.name}>
            <div className={`${CARD} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_24px_hsl(220_80%_60%/0.08)]`}>
              <div className="flex items-start justify-between mb-3">
                <div className="size-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Icon className="size-4 text-gray-500" />
                </div>
                <StatusDot status={agent.status} />
              </div>
              <p className="text-sm font-medium text-gray-900">{agent.name}</p>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2 text-pretty">{agent.description}</p>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-[#3370FF]">{agent.metric}</span>
                {agent.status === 'complete' && (
                  <button type="button" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-0.5">
                    View
                    <ArrowRight className="size-3" />
                  </button>
                )}
              </div>
            </div>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}

// ─── Part 3: Impact summary bar ──────────────────────────────────────────────

function ImpactBar() {
  return (
    <FadeUp delay={0.2}>
      <div className={`${CARD} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-[#3370FF]/10 flex items-center justify-center">
              <Zap className="size-4 text-[#3370FF]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 text-balance">Agents completed 14 tasks this week</p>
              <p className="text-[11px] text-gray-400 text-pretty">3 content pieces written, 5 schema fixes applied, 6 monitoring checks</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 tabular-nums">+42%</p>
              <p className="text-[11px] text-gray-400">visibility gain</p>
            </div>
            <button type="button" className="text-sm font-medium text-[#3370FF] hover:opacity-70 transition-opacity inline-flex items-center gap-1">
              View all
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </FadeUp>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function GroupAgentMarketing() {
  return (
    <div className="flex flex-col gap-4">
      {/* Hero: Agent in action — the main marketing visual */}
      <AgentExecutionCard />

      {/* Grid: All 6 agents with their results */}
      <AgentResultsGrid />

      {/* Summary: Total impact bar */}
      <ImpactBar />
    </div>
  )
}
