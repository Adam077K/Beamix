'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Check, TrendingUp, ArrowRight, Zap, BarChart3, Eye, Users, Target, Bot } from 'lucide-react'
import { CARD } from '@/components/marketing/card'
import { FadeUp } from '@/components/marketing/motion'
import { ENGINE_LOGOS } from '@/components/marketing/logos'

// ═══════════════════════════════════════════════════════════════════════════════
// CARD 1: AI Visibility Score
// Shows how Beamix scores your business across AI engines
// ═══════════════════════════════════════════════════════════════════════════════

const SCORE_FACTORS = [
  { label: 'Brand mentions', score: 82, weight: 'High' },
  { label: 'Content quality', score: 91, weight: 'High' },
  { label: 'Schema markup', score: 64, weight: 'Medium' },
  { label: 'FAQ coverage', score: 45, weight: 'Medium' },
  { label: 'Source authority', score: 78, weight: 'Low' },
]

function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const r = 54
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r}
          fill="none" stroke="#3370FF" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={animate ? { strokeDashoffset: c - (score / 100) * c } : {}}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(51,112,255,0.3))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <NumberFlow
          value={animate ? score : 0}
          className="text-3xl font-bold text-gray-900 tabular-nums"
        />
        <span className="text-[10px] text-gray-400 font-medium mt-0.5">/100</span>
      </div>
    </div>
  )
}

export function VisibilityScoreCard() {
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <FadeUp>
      <div ref={ref} className={`${CARD} overflow-hidden`}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="size-4 text-[#3370FF]" />
            <p className="text-sm font-medium text-gray-900">AI Visibility Score</p>
          </div>
          <p className="text-xs text-gray-400 text-pretty">How well AI search engines know your business</p>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-start gap-8">
            {/* Score ring */}
            <div className="shrink-0">
              <ScoreRing score={75} animate={animate} />
              <p className="text-center text-xs text-gray-400 mt-2">Overall score</p>
            </div>

            {/* Score breakdown */}
            <div className="flex-1 space-y-3 pt-1">
              {SCORE_FACTORS.map((factor, i) => (
                <motion.div
                  key={factor.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={animate ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                >
                  <span className="text-sm text-gray-600 flex-1">{factor.label}</span>
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#3370FF]"
                      initial={{ width: 0 }}
                      animate={animate ? { width: `${factor.score}%` } : {}}
                      transition={{ duration: 0.7, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                      style={{ opacity: factor.score > 70 ? 1 : factor.score > 50 ? 0.7 : 0.4 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 tabular-nums w-8 text-right">{factor.score}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom insight */}
          <motion.div
            className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="size-3.5 text-[#3370FF]" />
              <span className="text-sm text-gray-600">
                Your score improved <span className="font-semibold text-[#3370FF]">+12 points</span> this month
              </span>
            </div>
            <button type="button" className="text-xs font-medium text-[#3370FF] hover:opacity-70 transition-opacity inline-flex items-center gap-1">
              Details
              <ArrowRight className="size-3" />
            </button>
          </motion.div>
        </div>
      </div>
    </FadeUp>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD 2: Performance Tracking & KPIs
// Clean metrics dashboard — the numbers that matter
// ═══════════════════════════════════════════════════════════════════════════════

const KPI_DATA = [
  { label: 'Visibility', value: 75, suffix: '%', delta: '+52%', icon: Eye, trend: [30, 35, 42, 48, 55, 63, 70, 75] },
  { label: 'Mentions', value: 534, suffix: '', delta: '+128', icon: Users, trend: [120, 180, 250, 310, 380, 430, 490, 534] },
  { label: 'Avg. Position', value: 3.2, suffix: '', prefix: '#', delta: '+2.1', icon: Target, trend: [8, 7, 6.5, 5.8, 5, 4.2, 3.8, 3.2] },
  { label: 'Click-through', value: 12.4, suffix: '%', delta: '+4.8%', icon: BarChart3, trend: [3, 4.5, 5.8, 7.2, 8.5, 10.1, 11.2, 12.4] },
]

function MiniSparkline({ data, color = '#3370FF' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 28
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PerformanceKPIsCard() {
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <FadeUp>
      <div ref={ref} className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="size-4 text-[#3370FF]" />
              <p className="text-sm font-medium text-gray-900">Performance</p>
            </div>
            <p className="text-xs text-gray-400 text-pretty">Your key metrics at a glance</p>
          </div>
          <span className="text-[11px] text-gray-400">Last 30 days</span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
          {KPI_DATA.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                className="px-6 py-5"
                initial={{ opacity: 0, y: 8 }}
                animate={animate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">{kpi.label}</span>
                  </div>
                  <MiniSparkline data={kpi.trend} />
                </div>
                <div className="flex items-baseline gap-2">
                  <NumberFlow
                    value={animate ? kpi.value : 0}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    format={{ minimumFractionDigits: kpi.value % 1 !== 0 ? 1 : 0, maximumFractionDigits: 1 }}
                    className="text-2xl font-semibold text-gray-900 tabular-nums"
                  />
                  <span className="text-xs font-medium text-[#3370FF]">{kpi.delta}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Engine breakdown footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {['ChatGPT', 'Gemini', 'Perplexity', 'Claude'].map(name => {
              const Logo = ENGINE_LOGOS[name]
              return Logo ? <Logo key={name} size="sm" /> : null
            })}
            <span className="text-[11px] text-gray-400">+3 more engines</span>
          </div>
          <button type="button" className="text-xs font-medium text-[#3370FF] hover:opacity-70 transition-opacity inline-flex items-center gap-1">
            Full report
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </FadeUp>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD 3: Agent Automation
// Shows agents working automatically — the "it does the work" message
// ═══════════════════════════════════════════════════════════════════════════════

const AGENT_TASKS = [
  {
    agent: 'Brand Agent',
    color: '#10B981',
    action: 'Got you mentioned in a ChatGPT answer about local coffee shops',
    time: '2 hours ago',
    done: true,
  },
  {
    agent: 'Content Writer',
    color: '#D4A574',
    action: 'Published an optimized FAQ page targeting 8 common AI queries',
    time: '5 hours ago',
    done: true,
  },
  {
    agent: 'SEO Scanner',
    color: '#4285F4',
    action: 'Added schema markup to your About page — AI engines can now read it',
    time: '1 day ago',
    done: true,
  },
  {
    agent: 'FAQ Agent',
    color: '#8B5CF6',
    action: 'Writing answers to "best organic coffee near me" — 3 of 5 done',
    time: 'Now',
    done: false,
  },
]

export function AgentAutomationCard() {
  return (
    <FadeUp>
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="size-4 text-[#3370FF]" />
                <p className="text-sm font-medium text-gray-900">Agent Automation</p>
              </div>
              <p className="text-xs text-gray-400 text-pretty">Your agents work 24/7 — here's what they did recently</p>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="size-1.5 rounded-full bg-[#10B981]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[11px] text-gray-500">4 agents active</span>
            </div>
          </div>
        </div>

        {/* Task feed */}
        <div className="border-t border-gray-100">
          {AGENT_TASKS.map((task, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 px-6 py-4 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12, ease: 'easeOut' }}
            >
              {/* Status indicator */}
              <div className="mt-1 shrink-0">
                {task.done ? (
                  <div className="size-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${task.color}15` }}>
                    <Check className="size-3" style={{ color: task.color }} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="size-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: task.color }}>
                    <motion.div
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: task.color }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-snug text-pretty">{task.action}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-medium" style={{ color: task.color }}>{task.agent}</span>
                  <span className="text-[11px] text-gray-300">·</span>
                  <span className="text-[11px] text-gray-400">{task.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-3.5 text-[#3370FF]" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">14 tasks</span> completed this week
            </span>
          </div>
          <button type="button" className="text-xs font-medium text-[#3370FF] hover:opacity-70 transition-opacity inline-flex items-center gap-1">
            View all activity
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </FadeUp>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Combined export — all 3 cards in a section
// ═══════════════════════════════════════════════════════════════════════════════

export function GroupMarketingCards() {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Score + KPIs side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VisibilityScoreCard />
        <PerformanceKPIsCard />
      </div>
      {/* Row 2: Agent Automation full width */}
      <AgentAutomationCard />
    </div>
  )
}
