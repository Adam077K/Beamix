'use client'

import { useEffect, useRef, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { ResponsiveBar } from '@nivo/bar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { NivoDonutChart } from '@/components/marketing/charts/nivo-donut-chart'
import { BlueDonutChart } from '@/components/marketing/charts/blue-donut-chart'

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

// ─── Animated stats using NumberFlow ─────────────────────────────────────────

function AnimatedStatCard({
  label,
  value,
  suffix,
  prefix,
  sublabel,
  delta,
  animate,
}: {
  label: string
  value: number
  suffix: string
  prefix: string
  sublabel: string
  delta: string
  animate: boolean
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <NumberFlow
          value={animate ? value : 0}
          prefix={prefix}
          suffix={suffix}
          format={{ notation: 'standard' }}
          className="text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground"
        />
        <span className="text-xs font-medium text-[#3370FF]">{delta}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{sublabel}</p>
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
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ANIMATED_STATS.map((stat) => (
        <AnimatedStatCard key={stat.label} {...stat} animate={animate} />
      ))}
    </div>
  )
}

// ─── Nivo Bar Chart — Competitor Comparison ───────────────────────────────────

function NivoBarCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div>
          <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
            Competitor Comparison
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Nivo bar — spring-animated arcs
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <div style={{ height: 220 }}>
          <ResponsiveBar
            data={BAR_DATA}
            keys={['score']}
            indexBy="brand"
            layout="horizontal"
            colors={['#3370FF']}
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
            labelTextColor="#ffffff"
            theme={{
              background: 'transparent',
              axis: {
                ticks: {
                  text: { fill: '#6B7280', fontSize: 11 },
                },
              },
              grid: {
                line: { stroke: '#f0f4ff', strokeWidth: 1 },
              },
              labels: {
                text: { fontSize: 11, fontWeight: 600 },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Donut Comparison Row ─────────────────────────────────────────────────────

function DonutComparisonRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Recharts original */}
      <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <div>
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Engine Mentions</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recharts (original)</p>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <BlueDonutChart data={ENGINE_DATA} />
        </CardContent>
      </Card>

      {/* Nivo donut */}
      <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <div>
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Engine Mentions</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">@nivo/pie — spring-animated arcs</p>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <NivoDonutChart data={ENGINE_DATA} />
        </CardContent>
      </Card>
    </div>
  )
}

// ─── GroupPremium export ──────────────────────────────────────────────────────

export function GroupPremium() {
  return (
    <div className="flex flex-col gap-3">
      {/* Animated stat cards using NumberFlow */}
      <AnimatedStatsRow />

      {/* Nivo bar chart */}
      <NivoBarCard />

      {/* Donut comparison: recharts vs nivo */}
      <DonutComparisonRow />
    </div>
  )
}
