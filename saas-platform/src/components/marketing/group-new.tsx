'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DomainFavicon, ENGINE_LOGOS } from '@/components/marketing/logos'
import { PremiumDarkDonut } from '@/components/marketing/charts/premium-dark-donut'
import { PremiumLightDonut } from '@/components/marketing/charts/premium-light-donut'
import { AnimatedCard } from '@/components/marketing/card'
import { FadeUp, Stagger, StaggerItem } from '@/components/marketing/motion'

// ─── Demo data ────────────────────────────────────────────────────────────────

const TRENDING_TOPICS = [
  { rank: 1, topic: 'Best Coffee Shops Near Me', trend: 3, volume: 89346, hot: false },
  { rank: 2, topic: 'Specialty Coffee Roasters 2026', trend: 5, volume: 87890, hot: true },
  { rank: 3, topic: 'How to Find Good Local Coffee', trend: 2, volume: 83456, hot: false },
  { rank: 4, topic: 'Coffee Shop AI Search Optimization', trend: -1, volume: 78901, hot: false },
  { rank: 5, topic: 'Organic Fair Trade Coffee Near Me', trend: 4, volume: 64567, hot: false },
]

const AI_SOURCES = [
  { domain: 'reddit.com', type: 'UGC', usedPct: 32, avgCitations: 3.2 },
  { domain: 'yelp.com', type: 'UGC', usedPct: 28, avgCitations: 4.1 },
  { domain: 'wikipedia.org', type: 'Reference', usedPct: 31, avgCitations: 1.4 },
  { domain: 'competitor.com', type: 'Competitor', usedPct: 39, avgCitations: 1.1 },
  { domain: 'techradar.com', type: 'Editorial', usedPct: 45, avgCitations: 2.4 },
]

const MAX_CIT = Math.max(...AI_SOURCES.map(s => s.avgCitations))

const TYPE_BADGE: Record<string, string> = {
  UGC: 'bg-[#3370FF]/[0.06] text-[#3370FF]',
  Reference: 'bg-[#2563EB]/[0.06] text-[#2563EB]',
  Competitor: 'bg-[#1E40AF]/[0.06] text-[#1E40AF]',
  Editorial: 'bg-[#5A8FFF]/[0.06] text-[#5A8FFF]',
}

const RECENT_QUERIES = [
  { id: 1, query: "What's the best coffee shop near downtown?", snippet: 'Brew & Bean is highly recommended for its specialty roasts and relaxed atmosphere...', engines: ['ChatGPT', 'Gemini', 'Perplexity'], score: 80, time: '1d ago' },
  { id: 2, query: 'Which coffee shops have good AI search visibility?', snippet: 'Brew & Bean ranks top for AI mentions across ChatGPT and Perplexity...', engines: ['ChatGPT', 'Claude', 'Perplexity'], score: 74, time: '2d ago' },
  { id: 3, query: 'Best specialty coffee near me with organic options', snippet: 'Brew & Bean and Morning Roast Co are frequently mentioned in AI answers about organic...', engines: ['ChatGPT', 'Gemini'], score: 68, time: '3d ago' },
  { id: 4, query: 'Coffee shop open late night with good wifi?', snippet: 'Several users point to Brew & Bean as the go-to for late-night work sessions...', engines: ['ChatGPT', 'Perplexity', 'Claude'], score: 61, time: '4d ago' },
]

// ─── Trending Topics ─────────────────────────────────────────────────────────

function TrendingTopicsCard() {
  return (
    <AnimatedCard className="overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <p className="text-sm font-medium text-gray-500">Trending Topics in Your Category</p>
      </div>

      <div className="grid grid-cols-[24px_1fr_56px_80px] gap-2 px-6 py-3 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400">#</span>
        <span className="text-xs font-medium text-gray-400">Topic</span>
        <span className="text-xs font-medium text-gray-400 text-right">Trend</span>
        <span className="text-xs font-medium text-gray-400 text-right">Volume</span>
      </div>

      <Stagger>
        {TRENDING_TOPICS.map((row) => (
          <StaggerItem key={row.rank}>
            <div className="grid grid-cols-[24px_1fr_56px_80px] gap-2 items-center px-6 py-4 border-t border-gray-50 transition-colors duration-150 hover:bg-gray-50/50">
              <span className="text-sm tabular-nums text-gray-300">{row.rank}</span>
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-900 truncate font-medium">{row.topic}</span>
                {row.hot && (
                  <span className="shrink-0 bg-[#3370FF] text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full leading-none">Hot</span>
                )}
              </span>
              <span className={cn('text-sm tabular-nums font-medium text-right', row.trend > 0 ? 'text-[#3370FF]' : 'text-gray-400')}>
                {row.trend > 0 ? '+' : ''}{row.trend}%
              </span>
              <span className="text-sm tabular-nums text-gray-500 font-medium text-right">{row.volume.toLocaleString()}</span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </AnimatedCard>
  )
}

// ─── Top AI Sources ──────────────────────────────────────────────────────────

function TopAISourcesCard() {
  return (
    <AnimatedCard className="overflow-hidden" delay={0.1}>
      <div className="px-6 pt-6 pb-3">
        <p className="text-sm font-medium text-gray-500">Top Sources AI Trusts</p>
      </div>

      <div className="grid grid-cols-[1fr_72px_48px_72px] gap-2 px-6 py-3 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400">Domain</span>
        <span className="text-xs font-medium text-gray-400">Type</span>
        <span className="text-xs font-medium text-gray-400 text-right">Used</span>
        <span className="text-xs font-medium text-gray-400 text-right">Citations</span>
      </div>

      <Stagger>
        {AI_SOURCES.map((row) => (
          <StaggerItem key={row.domain}>
            <div className="grid grid-cols-[1fr_72px_48px_72px] gap-2 items-center px-6 py-4 border-t border-gray-50 transition-colors duration-150 hover:bg-gray-50/50">
              <span className="flex items-center gap-2.5 min-w-0">
                <DomainFavicon domain={row.domain} size="sm" />
                <span className="text-sm text-gray-900 truncate font-medium">{row.domain}</span>
              </span>
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full leading-none w-fit', TYPE_BADGE[row.type] ?? 'bg-gray-100 text-gray-500')}>
                {row.type}
              </span>
              <span className="text-sm tabular-nums text-gray-500 text-right">{row.usedPct}%</span>
              <div className="flex items-center justify-end gap-2">
                <div className="w-10 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#3370FF]/30" style={{ width: `${(row.avgCitations / MAX_CIT) * 100}%` }} />
                </div>
                <span className="text-sm tabular-nums text-gray-500 min-w-[24px] text-right">{row.avgCitations}</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </AnimatedCard>
  )
}

// ─── Recent AI Queries ───────────────────────────────────────────────────────

function RecentAIQueriesCard() {
  return (
    <AnimatedCard className="overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <p className="text-sm font-medium text-gray-500">Recent AI Queries</p>
      </div>

      <Stagger>
        {RECENT_QUERIES.map((item, i) => (
          <StaggerItem key={item.id}>
            <div className={cn(
              'px-6 py-4 transition-colors duration-150 hover:bg-gray-50/50',
              i < RECENT_QUERIES.length - 1 && 'border-b border-gray-50'
            )}>
              <p className="text-sm font-medium text-gray-900 leading-snug">{item.query}</p>
              <p className="mt-1 text-sm text-gray-400 leading-relaxed line-clamp-2">{item.snippet}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  {item.engines.map((name) => {
                    const Logo = ENGINE_LOGOS[name]
                    return Logo ? <Logo key={name} size="sm" /> : null
                  })}
                </div>
                <span className="text-xs text-gray-200">·</span>
                <span className="text-sm font-medium tabular-nums text-[#3370FF]">{item.score}</span>
                <span className="text-xs text-gray-400 ml-auto">{item.time}</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </AnimatedCard>
  )
}

// ─── Invisibility Card — with typewriter reveal ─────────────────────────────

const AI_LINES = [
  { text: '"Here are the best coffee shops near downtown:"', isHeader: true },
  { text: '1. The Daily Grind', sub: '— Highly rated for specialty lattes' },
  { text: '2. Morning Roast Co', sub: '— Known for organic blends' },
  { text: '3. Espresso Lab', sub: '— Popular for cold brew' },
]

function TypewriterLine({ text, sub, delay, isHeader }: { text: string; sub?: string; delay: number; isHeader?: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span className={cn('text-sm', isHeader ? 'text-gray-900 font-medium' : 'text-gray-900')}>{text}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </motion.div>
  )
}

function InvisibilityCard() {
  return (
    <AnimatedCard className="p-6 relative overflow-hidden" delay={0.1}>
      {/* Subtle dot grid background for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        <p className="text-sm font-medium text-gray-500 mb-5">What AI says when customers search for you</p>

        <div className="rounded-lg bg-gray-50/80 border border-gray-100 p-5 space-y-3">
          <div className="flex items-start gap-3">
            {/* AI avatar with subtle glow */}
            <div className="relative shrink-0 mt-0.5">
              <div className="absolute inset-0 rounded-full bg-gray-900/20 blur-[6px]" aria-hidden="true" />
              <div className="relative size-7 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            <div className="flex-1 space-y-2.5">
              {AI_LINES.map((line, i) => (
                <TypewriterLine key={i} {...line} delay={0.4 + i * 0.25} />
              ))}

              {/* Punchline — delayed reveal */}
              <motion.div
                className="pt-3 mt-1 border-t border-gray-200"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6, duration: 0.4 }}
              >
                <p className="text-sm font-semibold text-[#3370FF]">Your business isn&apos;t mentioned.</p>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.p
          className="text-xs text-gray-400 mt-4 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 2.0 }}
        >
          This is what customers see — <span className="text-[#3370FF] font-medium">Beamix fixes this</span>.
        </motion.p>
      </div>
    </AnimatedCard>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function GroupNew() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendingTopicsCard />
        <TopAISourcesCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentAIQueriesCard />
        <InvisibilityCard />
      </div>
      {/* Light version */}
      <PremiumLightDonut />
      {/* Dark version */}
      <FadeUp>
        <PremiumDarkDonut />
      </FadeUp>
    </div>
  )
}
