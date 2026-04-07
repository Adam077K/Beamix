'use client'

import { useRef, useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { BlueScoreRing } from '@/components/marketing/charts/blue-score-ring'
import { FadeUp, Stagger, StaggerItem, Pulse } from '@/components/marketing/motion'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_SCAN_HISTORY = [
  { created_at: '2026-03-01', overall_score: 23 },
  { created_at: '2026-03-05', overall_score: 31 },
  { created_at: '2026-03-10', overall_score: 40 },
  { created_at: '2026-03-15', overall_score: 38 },
  { created_at: '2026-03-20', overall_score: 52 },
  { created_at: '2026-03-25', overall_score: 63 },
  { created_at: '2026-03-28', overall_score: 70 },
  { created_at: '2026-03-30', overall_score: 75 },
]

const GLOSSY_STATS = [
  { label: 'Visibility', value: '75%', delta: '+52', sublabel: 'score' },
  { label: 'Mentions', value: '28', delta: '+20', sublabel: 'total' },
  { label: 'Position', value: '#2', delta: '+2', sublabel: 'rank' },
  { label: 'Engines', value: '5/7', delta: '', sublabel: 'covered' },
]

// ─── Glass card class (dark bg) ──────────────────────────────────────────────

const GLASS_CARD =
  'rounded-2xl border border-white/[0.1] bg-white/[0.07] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] p-6'

// ─── Glossy Before/After ──────────────────────────────────────────────────────

function GlossyBeforeAfter() {
  return (
    <FadeUp>
      <div className={GLASS_CARD}>
        <p className="text-sm font-medium text-white/90 mb-6">Before & After Beamix</p>
        <div className="flex items-center justify-center gap-6">
          {/* Before */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] text-white/60">Before</span>
            <div className="relative flex items-center justify-center">
              <div
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  background: 'radial-gradient(circle, rgba(51,112,255,0.08) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              <BlueScoreRing score={23} size="md" showLabel animate={false} />
            </div>
            <span className="text-sm font-medium text-white/60">Invisible</span>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1.5 pb-5">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-white/10" aria-hidden="true" />
              <Pulse>
                <span className="rounded-full bg-[#3370FF] text-white text-xs font-bold px-2.5 py-1 tabular-nums shadow-[0_2px_12px_rgba(51,112,255,0.5)]">
                  +52
                </span>
              </Pulse>
              <div className="h-px w-6 bg-white/10" aria-hidden="true" />
            </div>
            <span className="text-[10px] text-white/45">points gained</span>
          </div>

          {/* After */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] text-[#5A8FFF]">After</span>
            <div className="relative flex items-center justify-center">
              <div
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  background: 'radial-gradient(circle, rgba(51,112,255,0.25) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              <BlueScoreRing score={75} size="md" showLabel animate />
            </div>
            <span className="text-sm font-medium text-[#5A8FFF]">Visible</span>
          </div>
        </div>
      </div>
    </FadeUp>
  )
}

// ─── Glossy Stat Row — FIXED contrast ────────────────────────────────────────

function GlossyStatRow() {
  return (
    <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {GLOSSY_STATS.map((stat) => (
        <StaggerItem key={stat.label}>
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5">
            <p className="text-[11px] text-white/65">{stat.label}</p>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums text-white">
                {stat.value}
              </span>
              {stat.delta && (
                <span className="text-xs font-medium text-[#5A8FFF]">{stat.delta}</span>
              )}
            </div>
            <p className="text-[10px] text-white/45 mt-1">{stat.sublabel}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}

// ─── Dark trend tooltip ───────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-medium text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full shrink-0 bg-[#3370FF]" />
        <span className="text-gray-500">Visibility:</span>
        <span className="font-semibold text-white">{payload[0].value}</span>
      </div>
    </div>
  )
}

// ─── Glossy Dark Hero ─────────────────────────────────────────────────────────

function GlossyDarkHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const CHART_HEIGHT = 180

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const chartData = DEMO_SCAN_HISTORY.map((d) => ({
    date: format(new Date(d.created_at), 'MMM d'),
    Visibility: d.overall_score,
  }))

  return (
    <FadeUp delay={0.1}>
      <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white/90">AI Visibility Score</p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold tracking-[-0.03em] tabular-nums text-white"
              style={{ textShadow: '0 0 24px rgba(51,112,255,0.6)' }}
            >
              75
            </span>
            <span className="text-sm font-medium text-[#5A8FFF]">+52 pts</span>
          </div>
        </div>

        {/* Dark area chart */}
        <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }}>
          {chartWidth > 0 && chartData.length >= 2 && (
            <AreaChart
              width={chartWidth}
              height={CHART_HEIGHT}
              data={chartData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="darkBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3370FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3370FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="Visibility"
                stroke="#3370FF"
                strokeWidth={2.5}
                fill="url(#darkBlueGrad)"
                dot={{ r: 3, fill: '#3370FF', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#5A8FFF', strokeWidth: 0 }}
                connectNulls
                isAnimationActive
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          )}
        </div>
      </div>
    </FadeUp>
  )
}

// ─── GroupGlossy export ───────────────────────────────────────────────────────

export function GroupGlossy() {
  return (
    <div className="relative rounded-2xl bg-[#0F1629] p-8 -mx-2 overflow-hidden">
      {/* Background gradient blobs — subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-[#3370FF]/20 blur-[100px]" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-[#5A8FFF]/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#93B4FF]/15 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-4">
        <GlossyStatRow />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlossyBeforeAfter />
          <GlossyDarkHero />
        </div>
      </div>
    </div>
  )
}
