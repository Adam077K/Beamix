'use client'

import { ResponsivePie } from '@nivo/pie'
import { ENGINE_LOGOS } from '@/components/marketing/logos'
import { CARD } from '@/components/marketing/card'
import { FadeUp } from '@/components/marketing/motion'

// ─── Engine data (same as dark version) ──────────────────────────────────────

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

// ─── Light donut panel ───────────────────────────────────────────────────────

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
      <p className="text-xs font-medium text-gray-400 mb-3">{label}</p>

      <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tabular-nums text-gray-900 leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">{label}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2.5">
        {engines.map((e) => {
          const Logo = ENGINE_LOGOS[e.id]
          const isUp = e.trend > 0
          return (
            <div key={e.id} className="flex items-center gap-2">
              {Logo ? (
                <div className="shrink-0"><Logo size="sm" /></div>
              ) : (
                <div className="size-5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
              )}
              <span className="text-sm text-gray-600 flex-1 truncate">{e.id}</span>
              <span className={`text-[11px] font-medium tabular-nums ${isUp ? 'text-[#10B981]' : e.trend < 0 ? 'text-[#EA4335]' : 'text-gray-300'}`}>
                {isUp ? `+${e.trend}%` : e.trend < 0 ? `${e.trend}%` : '—'}
              </span>
              <span className="text-sm font-medium text-gray-900 tabular-nums w-14 text-right">
                {e.value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function PremiumLightDonut() {
  return (
    <FadeUp>
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-6 pt-6 pb-2">
          <p className="text-sm font-medium text-gray-900">Traffic by AI Engine</p>
          <p className="text-xs text-gray-400 mt-0.5 text-pretty">Visits and conversions from AI search</p>
        </div>
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <DonutPanel label="Traffic" engines={TRAFFIC_DATA} />
            <DonutPanel label="Conversions" engines={CONVERSIONS_DATA} />
          </div>
        </div>
      </div>
    </FadeUp>
  )
}
