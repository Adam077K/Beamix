'use client'

import { ResponsivePie } from '@nivo/pie'
import { ENGINE_LOGOS } from '@/components/marketing/logos'

// ─── Engine data ──────────────────────────────────────────────────────────────

interface EngineEntry {
  id: string
  value: number
  trend: number
  color: string
}

const TRAFFIC_DATA: EngineEntry[] = [
  { id: 'ChatGPT', value: 6514, trend: 5, color: '#10B981' },
  { id: 'Claude', value: 4560, trend: 8, color: '#D4A574' },
  { id: 'Gemini', value: 2100, trend: 3, color: '#4285F4' },
  { id: 'Google AI', value: 805, trend: 1, color: '#EA4335' },
  { id: 'Perplexity', value: 789, trend: 4, color: '#8B5CF6' },
  { id: 'Grok', value: 245, trend: 0, color: '#6B7280' },
]

const CONVERSIONS_DATA: EngineEntry[] = [
  { id: 'ChatGPT', value: 312, trend: 6, color: '#10B981' },
  { id: 'Claude', value: 228, trend: 11, color: '#D4A574' },
  { id: 'Gemini', value: 94, trend: 2, color: '#4285F4' },
  { id: 'Google AI', value: 41, trend: -1, color: '#EA4335' },
  { id: 'Perplexity', value: 38, trend: 3, color: '#8B5CF6' },
  { id: 'Grok', value: 9, trend: 0, color: '#6B7280' },
]

// ─── Single donut panel ───────────────────────────────────────────────────────

function DonutPanel({ label, engines }: { label: string; engines: EngineEntry[] }) {
  const total = engines.reduce((s, e) => s + e.value, 0)

  const nivoData = engines.map((e) => ({
    id: e.id,
    label: e.id,
    value: e.value,
    color: e.color,
  }))

  return (
    <div className="flex flex-col">
      <p className="text-xs font-medium text-white/60 mb-3">{label}</p>

      {/* Donut */}
      <div className="relative mx-auto" style={{ width: 160, height: 160 }}>
        <ResponsivePie
          data={nivoData}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          innerRadius={0.6}
          padAngle={3}
          cornerRadius={6}
          colors={{ datum: 'data.color' }}
          borderWidth={0}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          animate
          motionConfig="gentle"
          theme={{ background: 'transparent' }}
          tooltip={() => null}
        />
        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-semibold tracking-[-0.02em] tabular-nums text-white leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wide">{label}</span>
        </div>
      </div>

      {/* Legend rows */}
      <div className="mt-4 space-y-2">
        {engines.map((e) => {
          const Logo = ENGINE_LOGOS[e.id]
          const isUp = e.trend > 0
          return (
            <div key={e.id} className="flex items-center gap-2">
              {/* Engine logo or color dot */}
              {Logo ? (
                <div className="shrink-0">
                  <Logo size="sm" />
                </div>
              ) : (
                <div
                  className="h-5 w-5 rounded-full shrink-0"
                  style={{ backgroundColor: e.color }}
                  aria-label={e.id}
                />
              )}
              <span className="text-xs text-white/70 flex-1 truncate">{e.id}</span>
              {/* Trend */}
              <span
                className={`text-[10px] font-medium tabular-nums ${
                  isUp ? 'text-emerald-400' : e.trend < 0 ? 'text-red-400' : 'text-white/30'
                }`}
              >
                {isUp ? `↑${e.trend}%` : e.trend < 0 ? `↓${Math.abs(e.trend)}%` : '—'}
              </span>
              {/* Value */}
              <span className="text-xs font-medium text-white tabular-nums w-14 text-right">
                {e.value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Exported component ───────────────────────────────────────────────────────

export function PremiumDarkDonut() {
  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-white/5 overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-white">Traffic by AI Engine</p>
        <p className="text-[11px] text-white/40 mt-0.5">Visits and conversions from AI search</p>
      </div>
      <div className="px-5 pb-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <DonutPanel label="Traffic" engines={TRAFFIC_DATA} />
          <DonutPanel label="Conversions" engines={CONVERSIONS_DATA} />
        </div>
      </div>
    </div>
  )
}
