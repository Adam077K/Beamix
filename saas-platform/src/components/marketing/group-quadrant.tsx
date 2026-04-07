'use client'

import { motion } from 'framer-motion'
import { BrewBeanMark, CompetitorMark } from '@/components/marketing/logos'
import { FadeUp } from '@/components/marketing/motion'

// ─── Demo data — positions on 0-100 scale ────────────────────────────────────

const BRANDS = [
  { name: 'Brew & Bean', x: 75, y: 82, isUser: true },
  { name: 'The Daily Grind', x: 68, y: 45, isUser: false, index: 0 },
  { name: 'Morning Roast Co', x: 52, y: 71, isUser: false, index: 1 },
  { name: 'Bean Scene', x: 35, y: 55, isUser: false, index: 2 },
  { name: 'Espresso Lab', x: 28, y: 30, isUser: false, index: 3 },
]

const QUADRANT_LABELS = [
  { label: 'Laggers', x: 8, y: 90, color: 'text-gray-400' },
  { label: 'Leaders', x: 72, y: 90, color: 'text-[#3370FF]' },
  { label: 'Invisible', x: 8, y: 8, color: 'text-gray-400' },
  { label: 'Controversial', x: 72, y: 8, color: 'text-gray-400' },
]

import { CARD } from '@/components/marketing/card'

// ─── Brand dot on chart ──────────────────────────────────────────────────────

function BrandDot({ brand, index }: { brand: typeof BRANDS[0]; index: number }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1"
      style={{
        left: `${brand.x}%`,
        bottom: `${brand.y}%`,
        transform: 'translate(-50%, 50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Logo */}
      <div className={`rounded-full p-0.5 ${brand.isUser ? 'ring-2 ring-[#3370FF]/60 ring-offset-[3px] ring-offset-white' : ''}`}>
        {brand.isUser ? (
          <BrewBeanMark size="lg" />
        ) : (
          <CompetitorMark name={brand.name} index={brand.index ?? 0} size="lg" />
        )}
      </div>
      {/* Label */}
      <span className={`text-[11px] font-medium whitespace-nowrap ${brand.isUser ? 'text-[#3370FF]' : 'text-gray-500'}`}>
        {brand.name}
      </span>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GroupQuadrant() {
  return (
    <FadeUp>
      <div className={`${CARD} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-900">Competitive Landscape</p>
            <p className="text-[11px] text-gray-400 mt-1">Visibility vs Sentiment across AI engines</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4">
            {BRANDS.slice(0, 3).map((b, i) => (
              <div key={b.name} className="flex items-center gap-1.5">
                {b.isUser ? <BrewBeanMark size="sm" /> : <CompetitorMark name={b.name} index={i} size="sm" />}
                <span className="text-[10px] text-gray-400">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart area */}
        <div className="relative w-full aspect-[2/1] min-h-[300px]">
          {/* Grid background */}
          <div className="absolute inset-0 rounded-lg border border-gray-100 overflow-hidden">
            {/* Horizontal gridlines */}
            {[25, 50, 75].map(pct => (
              <div key={`h-${pct}`} className="absolute w-full border-t border-gray-50" style={{ bottom: `${pct}%` }} />
            ))}
            {/* Vertical gridlines */}
            {[25, 50, 75].map(pct => (
              <div key={`v-${pct}`} className="absolute h-full border-l border-gray-50" style={{ left: `${pct}%` }} />
            ))}
            {/* Crosshair at 50/50 */}
            <div className="absolute w-full border-t border-dashed border-gray-200" style={{ bottom: '50%' }} />
            <div className="absolute h-full border-l border-dashed border-gray-200" style={{ left: '50%' }} />

            {/* Quadrant labels */}
            {QUADRANT_LABELS.map(q => (
              <div
                key={q.label}
                className={`absolute text-xs font-semibold ${q.color}`}
                style={{ left: `${q.x}%`, bottom: `${q.y}%` }}
              >
                {q.label}
              </div>
            ))}

            {/* "Leaders" quadrant subtle highlight */}
            <div
              className="absolute bg-[#3370FF]/[0.05] rounded-sm"
              style={{ left: '50%', bottom: '50%', width: '50%', height: '50%' }}
            />

            {/* Brand dots */}
            {BRANDS.map((brand, i) => (
              <BrandDot key={brand.name} brand={brand} index={i} />
            ))}
          </div>

          {/* Axis labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2">
            <span className="text-[10px] text-gray-300">0%</span>
            <span className="text-[10px] text-gray-400 font-medium">Visibility →</span>
            <span className="text-[10px] text-gray-300">100%</span>
          </div>
          <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between py-2">
            <span className="text-[10px] text-gray-300 -rotate-90 origin-center">100%</span>
            <span className="text-[10px] text-gray-400 font-medium -rotate-90 origin-center whitespace-nowrap">Sentiment →</span>
            <span className="text-[10px] text-gray-300 -rotate-90 origin-center">0%</span>
          </div>
        </div>
      </div>
    </FadeUp>
  )
}
