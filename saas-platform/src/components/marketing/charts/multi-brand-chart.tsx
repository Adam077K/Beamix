'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// ─── Brand definitions ────────────────────────────────────────────────────────

export const BRANDS = [
  { key: 'brewBean', name: 'Brew & Bean', color: '#3370FF' },
  { key: 'dailyGrind', name: 'The Daily Grind', color: '#EF4444' },
  { key: 'morningRoast', name: 'Morning Roast Co', color: '#F59E0B' },
  { key: 'beanScene', name: 'Bean Scene', color: '#10B981' },
  { key: 'espressoLab', name: 'Espresso Lab', color: '#8B5CF6' },
]

// ─── Chart data sets ──────────────────────────────────────────────────────────

const VISIBILITY_DATA = [
  { month: 'Jan', brewBean: 32, dailyGrind: 45, morningRoast: 38, beanScene: 28, espressoLab: 22 },
  { month: 'Feb', brewBean: 38, dailyGrind: 48, morningRoast: 40, beanScene: 30, espressoLab: 25 },
  { month: 'Mar', brewBean: 45, dailyGrind: 50, morningRoast: 42, beanScene: 32, espressoLab: 28 },
  { month: 'Apr', brewBean: 52, dailyGrind: 52, morningRoast: 44, beanScene: 35, espressoLab: 30 },
  { month: 'May', brewBean: 61, dailyGrind: 54, morningRoast: 43, beanScene: 33, espressoLab: 31 },
  { month: 'Jun', brewBean: 75, dailyGrind: 55, morningRoast: 45, beanScene: 36, espressoLab: 29 },
]

const SENTIMENT_DATA = [
  { month: 'Jan', brewBean: 62, dailyGrind: 70, morningRoast: 58, beanScene: 54, espressoLab: 48 },
  { month: 'Feb', brewBean: 65, dailyGrind: 72, morningRoast: 60, beanScene: 55, espressoLab: 50 },
  { month: 'Mar', brewBean: 70, dailyGrind: 71, morningRoast: 62, beanScene: 57, espressoLab: 52 },
  { month: 'Apr', brewBean: 74, dailyGrind: 73, morningRoast: 64, beanScene: 58, espressoLab: 54 },
  { month: 'May', brewBean: 79, dailyGrind: 74, morningRoast: 63, beanScene: 56, espressoLab: 53 },
  { month: 'Jun', brewBean: 85, dailyGrind: 75, morningRoast: 65, beanScene: 59, espressoLab: 51 },
]

const POSITION_DATA = [
  { month: 'Jan', brewBean: 4, dailyGrind: 2, morningRoast: 3, beanScene: 5, espressoLab: 6 },
  { month: 'Feb', brewBean: 4, dailyGrind: 2, morningRoast: 3, beanScene: 5, espressoLab: 7 },
  { month: 'Mar', brewBean: 3, dailyGrind: 2, morningRoast: 4, beanScene: 5, espressoLab: 6 },
  { month: 'Apr', brewBean: 3, dailyGrind: 2, morningRoast: 4, beanScene: 6, espressoLab: 7 },
  { month: 'May', brewBean: 2, dailyGrind: 2, morningRoast: 4, beanScene: 5, espressoLab: 6 },
  { month: 'Jun', brewBean: 1, dailyGrind: 2, morningRoast: 3, beanScene: 5, espressoLab: 7 },
]

type TabKey = 'Visibility' | 'Sentiment' | 'Position'

const TAB_DATA: Record<TabKey, typeof VISIBILITY_DATA> = {
  Visibility: VISIBILITY_DATA,
  Sentiment: SENTIMENT_DATA,
  Position: POSITION_DATA,
}

const TAB_SUFFIX: Record<TabKey, string> = {
  Visibility: '%',
  Sentiment: '%',
  Position: '',
}

const TAB_DOMAIN: Record<TabKey, [number, number]> = {
  Visibility: [0, 100],
  Sentiment: [0, 100],
  Position: [1, 8],
}

// ─── Dark tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip(props: Record<string, unknown>) {
  const active = props.active as boolean | undefined
  const payload = props.payload as Array<{ dataKey?: string; value?: number }> | undefined
  const label = props.label as string | undefined
  const suffix = (props.suffix as string) ?? ''
  if (!active || !payload?.length) return null

  const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return (
    <div className="rounded-xl bg-[#1a1a2e] border border-white/10 px-4 py-3 shadow-2xl min-w-[200px]">
      <p className="text-xs font-medium text-white/60 mb-2">{label} 2026</p>
      <div className="space-y-1.5">
        {sorted.map((entry) => {
          const brand = BRANDS.find((b) => b.key === entry.dataKey)
          if (!brand) return null
          return (
            <div key={brand.key} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: brand.color }}
              />
              <span className="text-xs text-white/80 flex-1">{brand.name}</span>
              <span className="text-xs font-semibold text-white tabular-nums">
                {entry.value}{suffix}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main chart ───────────────────────────────────────────────────────────────

export function MultiBrandChart() {
  const [activeTab, setActiveTab] = useState<TabKey>('Visibility')
  const data = TAB_DATA[activeTab]
  const suffix = TAB_SUFFIX[activeTab]
  const domain = TAB_DOMAIN[activeTab]

  return (
    <div>
      {/* Tab pills */}
      <div className="flex items-center gap-1 mb-4">
        {(['Visibility', 'Sentiment', 'Position'] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              domain={domain}
              tickFormatter={(v) => `${v}${suffix}`}
            />
            <Tooltip
              content={(props: Record<string, unknown>) => <CustomTooltip {...props} suffix={suffix} />}
              cursor={{ stroke: '#E5E7EB', strokeDasharray: '4 4' }}
            />
            {BRANDS.map((brand) => (
              <Line
                key={brand.key}
                type="monotone"
                dataKey={brand.key}
                stroke={brand.color}
                strokeWidth={brand.key === 'brewBean' ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: brand.color }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center flex-wrap">
        {BRANDS.map((b) => (
          <div key={b.key} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: b.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-muted-foreground">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
