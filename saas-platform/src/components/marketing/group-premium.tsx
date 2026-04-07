'use client'

import { useEffect, useRef, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { ResponsiveBar } from '@nivo/bar'
import { NivoDonutChart } from '@/components/marketing/charts/nivo-donut-chart'
import { MultiBrandChart } from '@/components/marketing/charts/multi-brand-chart'
import { FadeUp, Stagger, StaggerItem } from '@/components/marketing/motion'

// ─── Demo data ────────────────────────────────────────────────────────────────

const ENGINE_DATA = [
  { engine: 'ChatGPT', mentions: 8 },
  { engine: 'Gemini', mentions: 5 },
  { engine: 'Perplexity', mentions: 7 },
  { engine: 'Google AI', mentions: 3 },
  { engine: 'Claude', mentions: 3 },
]

const BAR_DATA = [
  { brand: 'Brew & Bean', score: 75 },
  { brand: 'The Daily Grind', score: 68 },
  { brand: 'Morning Roast Co', score: 52 },
  { brand: 'Bean Scene', score: 44 },
  { brand: 'Espresso Lab', score: 38 },
]

const ANIMATED_STATS = [
  { label: 'Visibility Score', value: 75, suffix: '', prefix: '', sublabel: 'out of 100', delta: '+52' },
  { label: 'AI Mentions', value: 28, suffix: '', prefix: '', sublabel: 'across 7 engines', delta: '+20' },
  { label: 'Pages Cited', value: 14808, suffix: '', prefix: '', sublabel: 'in 30 days', delta: '+2,479' },
  { label: 'Market Share', value: 23, suffix: '%', prefix: '', sublabel: 'AI search results', delta: '+8%' },
]

import { AnimatedCard, CARD } from '@/components/marketing/card'

// ─── Animated stat card ──────────────────────────────────────────────────────

function AnimatedStatCard({
  label, value, suffix, prefix, sublabel, delta, animate,
}: {
  label: string; value: number; suffix: string; prefix: string
  sublabel: string; delta: string; animate: boolean
}) {
  return (
    <div className={`${CARD} p-6`}>
      <p className="text-[11px] text-gray-400">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <NumberFlow
          value={animate ? value : 0}
          prefix={prefix}
          suffix={suffix}
          format={{ notation: 'standard' }}
          className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-gray-900 leading-none"
        />
        <span className="bg-[#3370FF]/[0.08] text-[#3370FF] text-xs font-medium rounded-full px-2 py-0.5">{delta}</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">{sublabel}</p>
    </div>
  )
}

function AnimatedStatsRow() {
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-4" stagger={0.1}>
        {ANIMATED_STATS.map((stat) => (
          <StaggerItem key={stat.label}>
            <AnimatedStatCard {...stat} animate={animate} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}

// ─── Nivo Bar Chart ──────────────────────────────────────────────────────────

function NivoBarCard() {
  return (
    <FadeUp>
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-6 pt-6 pb-0">
          <p className="text-sm font-medium text-gray-900">Engine Visibility</p>
        </div>
        <div className="px-6 pb-6 pt-3">
          <div style={{ height: 220 }}>
            <ResponsiveBar
              data={BAR_DATA}
              keys={['score']}
              indexBy="brand"
              layout="horizontal"
              colors={(d) => d.data.brand === 'Brew & Bean' ? '#3370FF' : '#E5E7EB'}
              borderRadius={4}
              padding={0.3}
              animate
              motionConfig="gentle"
              enableGridX
              enableGridY={false}
              axisBottom={{
                tickSize: 0,
                tickPadding: 6,
                tickValues: [0, 25, 50, 75, 100],
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 8,
              }}
              labelSkipWidth={20}
              labelTextColor={(d) => d.data.data.brand === 'Brew & Bean' ? '#ffffff' : '#6B7280'}
              theme={{
                background: 'transparent',
                axis: {
                  ticks: {
                    text: { fill: '#9CA3AF', fontSize: 11 },
                  },
                },
                grid: {
                  line: { stroke: '#F3F4F6', strokeWidth: 1 },
                },
                labels: {
                  text: { fontSize: 11, fontWeight: 600 },
                },
              }}
            />
          </div>
        </div>
      </div>
    </FadeUp>
  )
}

// ─── Single Nivo Donut ───────────────────────────────────────────────────────

function DonutCard() {
  return (
    <FadeUp delay={0.1}>
      <div className={`${CARD} p-6`}>
        <p className="text-sm font-medium text-gray-900 mb-4">AI Model Coverage</p>
        <NivoDonutChart data={ENGINE_DATA} />
      </div>
    </FadeUp>
  )
}

// ─── GroupPremium export ──────────────────────────────────────────────────────

export function GroupPremium() {
  return (
    <div className="flex flex-col gap-4">
      <AnimatedStatsRow />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NivoBarCard />
        <DonutCard />
      </div>

      {/* Multi-brand chart */}
      <FadeUp>
        <div className={`${CARD} overflow-hidden`}>
          <div className="px-6 pt-6 pb-0">
            <p className="text-sm font-medium text-gray-900">Visibility Over Time</p>
            <p className="text-[11px] text-gray-400 mt-1">Compare your brand against competitors</p>
          </div>
          <div className="px-6 pb-6 pt-3">
            <MultiBrandChart />
          </div>
        </div>
      </FadeUp>
    </div>
  )
}
