'use client'

import { useEffect, useRef, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { FadeUp, Stagger, StaggerItem } from '@/components/marketing/motion'
import { motion } from 'framer-motion'

// ─── Demo data ────────────────────────────────────────────────────────────────

const SCAN_HISTORY = [
  { date: '2026-01-05', score: 12 },
  { date: '2026-01-15', score: 18 },
  { date: '2026-02-01', score: 23 },
  { date: '2026-02-10', score: 31 },
  { date: '2026-02-20', score: 29 },
  { date: '2026-03-01', score: 40 },
  { date: '2026-03-10', score: 52 },
  { date: '2026-03-15', score: 48 },
  { date: '2026-03-20', score: 63 },
  { date: '2026-03-25', score: 70 },
  { date: '2026-03-30', score: 75 },
]

const KPI_STATS = [
  { label: 'Visibility Rate', value: 75, suffix: '%', delta: '+52%', glow: true },
  { label: 'Share of Voice', value: 8.2, suffix: '%', delta: '+3.1%', glow: false },
  { label: 'AI Engines', value: 5, suffix: '/7', delta: '+2', glow: false },
  { label: 'Impressions', value: 8280, suffix: '', delta: '+2,840', glow: false },
]

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 shadow-2xl text-xs">
      <p className="text-[10px] text-white/60 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3370FF]" />
        <span className="font-semibold text-white tabular-nums">{payload[0].value}%</span>
      </div>
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ label, value, suffix, delta, glow, animate }: {
  label: string; value: number; suffix: string; delta: string; glow: boolean; animate: boolean
}) {
  return (
    <div className="relative">
      {glow && (
        <div className="absolute -inset-1 rounded-2xl bg-[#3370FF]/10 blur-xl" aria-hidden="true" />
      )}
      <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="text-xs text-white/60 font-medium">{label}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <NumberFlow
            value={animate ? value : 0}
            suffix={suffix}
            format={{ notation: 'standard', minimumFractionDigits: suffix === '%' && value < 10 ? 1 : 0, maximumFractionDigits: 1 }}
            className="text-[32px] font-bold tracking-[-0.03em] tabular-nums text-white leading-none"
            style={glow ? { textShadow: '0 0 30px rgba(51,112,255,0.5)' } : undefined}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs font-medium text-[#5A8FFF]">{delta}</span>
          <span className="text-[10px] text-white/40">vs last period</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GroupDarkKPI() {
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
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const chartData = SCAN_HISTORY.map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    score: d.score,
  }))

  return (
    <div ref={ref} className="relative rounded-2xl bg-[#0A0A14] overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#3370FF]/[0.07] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full bg-[#5A8FFF]/[0.05] blur-[80px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <div>
            <h3 className="text-base font-semibold text-white">AI Visibility Command Center</h3>
            <p className="text-[11px] text-white/45 mt-1">Brew & Bean — Real-time AI search performance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#3370FF] animate-pulse" />
            <span className="text-[11px] text-white/60">Live</span>
          </div>
        </div>

        {/* KPI Row */}
        <div className="px-8 py-5">
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3" stagger={0.1}>
            {KPI_STATS.map((stat) => (
              <StaggerItem key={stat.label}>
                <KPICard {...stat} animate={animate} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Chart */}
        <div className="px-6 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[11px] text-white/60">Visibility trend</span>
                <span className="text-[11px] text-white/45">Last 90 days</span>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="darkKpiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3370FF" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3370FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }}
                      axisLine={false} tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<DarkTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3370FF"
                      strokeWidth={2}
                      fill="url(#darkKpiGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#3370FF', strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={2000}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
