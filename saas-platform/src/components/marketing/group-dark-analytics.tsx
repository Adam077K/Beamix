'use client'

import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FadeUp, Stagger, StaggerItem } from '@/components/marketing/motion'

// ─── Demo data — multi-persona analytics ─────────────────────────────────────

const PERSONAS = [
  { name: 'Coffee Enthusiast', color: '#3370FF', pct: 89.2, delta: '+5%' },
  { name: 'Health Conscious', color: '#5A8FFF', pct: 73.4, delta: '+3%' },
  { name: 'Budget Seeker', color: '#93B4FF', pct: 61.8, delta: '+7%' },
  { name: 'Remote Worker', color: '#C5D7FF', pct: 55.1, delta: '+2%' },
]

const CHART_DATA = [
  { date: 'Apr 1', 'Coffee Enthusiast': 72, 'Health Conscious': 58, 'Budget Seeker': 45, 'Remote Worker': 40 },
  { date: 'Apr 5', 'Coffee Enthusiast': 78, 'Health Conscious': 62, 'Budget Seeker': 48, 'Remote Worker': 42 },
  { date: 'Apr 9', 'Coffee Enthusiast': 75, 'Health Conscious': 65, 'Budget Seeker': 52, 'Remote Worker': 45 },
  { date: 'Apr 13', 'Coffee Enthusiast': 82, 'Health Conscious': 68, 'Budget Seeker': 55, 'Remote Worker': 48 },
  { date: 'Apr 17', 'Coffee Enthusiast': 85, 'Health Conscious': 71, 'Budget Seeker': 58, 'Remote Worker': 52 },
  { date: 'Apr 21', 'Coffee Enthusiast': 88, 'Health Conscious': 74, 'Budget Seeker': 60, 'Remote Worker': 54 },
  { date: 'Apr 25', 'Coffee Enthusiast': 89, 'Health Conscious': 73, 'Budget Seeker': 62, 'Remote Worker': 55 },
]

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1A1A2E] px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-white/60 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[11px] text-white/60 flex-1">{p.name}</span>
            <span className="text-[11px] font-semibold text-white tabular-nums">{p.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GroupDarkAnalytics() {
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <FadeUp>
      <div ref={ref} className="rounded-2xl bg-[#0A0A14] overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-7 pb-2">
          <h3 className="text-base font-semibold text-white">Audience Persona Analytics</h3>
          <p className="text-[11px] text-white/50 mt-1">How different customer segments discover your business via AI</p>
        </div>

        {/* Persona KPIs */}
        <div className="px-8 py-4">
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3" stagger={0.08}>
            {PERSONAS.map((p) => (
              <StaggerItem key={p.name}>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[11px] text-white/65 font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <NumberFlow
                      value={animate ? p.pct : 0}
                      suffix="%"
                      format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                      className="text-2xl font-bold tracking-[-0.02em] tabular-nums text-white"
                    />
                    <span className="text-[11px] font-medium text-[#5A8FFF]">{p.delta}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Multi-line chart */}
        <div className="px-6 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={CHART_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                    {PERSONAS.map(p => (
                      <Line
                        key={p.name}
                        type="monotone"
                        dataKey={p.name}
                        stroke={p.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3.5, strokeWidth: 0 }}
                        isAnimationActive
                        animationDuration={2000}
                        animationEasing="ease-out"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Chart legend */}
              <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-white/[0.04]">
                {PERSONAS.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-[11px] text-white/50">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </FadeUp>
  )
}
