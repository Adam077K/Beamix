'use client'

import { useRef, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DomainFavicon, ENGINE_LOGOS } from '@/components/marketing/logos'

// ─── Demo data ────────────────────────────────────────────────────────────────

const TRENDING_TOPICS = [
  { rank: 1, topic: 'Best Coffee Shops Near Me', trend: 3, volume: 89346, hot: false },
  { rank: 2, topic: 'Specialty Coffee Roasters 2026', trend: 5, volume: 87890, hot: true },
  { rank: 3, topic: 'How to Find Good Local Coffee', trend: 2, volume: 83456, hot: false },
  { rank: 4, topic: 'Coffee Shop AI Search Optimization', trend: -1, volume: 78901, hot: false },
  { rank: 5, topic: 'Organic Fair Trade Coffee Near Me', trend: 4, volume: 64567, hot: false },
]

const AI_SOURCES = [
  { domain: 'reddit.com', letter: 'R', color: '#3370FF', type: 'UGC', usedPct: 32, avgCitations: 3.2 },
  { domain: 'yelp.com', letter: 'Y', color: '#2563EB', type: 'UGC', usedPct: 28, avgCitations: 4.1 },
  { domain: 'wikipedia.org', letter: 'W', color: '#1E40AF', type: 'Reference', usedPct: 31, avgCitations: 1.4 },
  { domain: 'competitor.com', letter: 'C', color: '#5A8FFF', type: 'Competitor', usedPct: 39, avgCitations: 1.1 },
  { domain: 'techradar.com', letter: 'T', color: '#60A5FA', type: 'Editorial', usedPct: 45, avgCitations: 2.4 },
]

const TYPE_BADGE_STYLES: Record<string, string> = {
  UGC: 'bg-[#EEF3FF] text-[#3370FF]',
  Reference: 'bg-[#EDF2FB] text-[#2563EB]',
  Competitor: 'bg-[#E8EEFB] text-[#1E40AF]',
  Editorial: 'bg-[#EEF3FF] text-[#5A8FFF]',
}

const RECENT_QUERIES = [
  {
    id: 1,
    color: '#3370FF',
    query: "What's the best coffee shop near downtown?",
    snippet: 'Brew & Bean is highly recommended for its specialty roasts and relaxed atmosphere...',
    engines: ['ChatGPT', 'Gemini', 'Perplexity'],
    score: 80,
    time: '1d ago',
  },
  {
    id: 2,
    color: '#5A8FFF',
    query: 'Which coffee shops have good AI search visibility?',
    snippet: 'Brew & Bean ranks top for AI mentions across ChatGPT and Perplexity...',
    engines: ['ChatGPT', 'Claude', 'Perplexity'],
    score: 74,
    time: '2d ago',
  },
  {
    id: 3,
    color: '#93B4FF',
    query: 'Best specialty coffee near me with organic options',
    snippet: 'Brew & Bean and Morning Roast Co are frequently mentioned in AI answers about organic...',
    engines: ['ChatGPT', 'Gemini'],
    score: 68,
    time: '3d ago',
  },
  {
    id: 4,
    color: '#60A5FA',
    query: 'Coffee shop open late night with good wifi?',
    snippet: 'Several users point to Brew & Bean as the go-to for late-night work sessions...',
    engines: ['ChatGPT', 'Perplexity', 'Claude'],
    score: 61,
    time: '4d ago',
  },
]

const DARK_DONUT_DATA = [
  { engine: 'ChatGPT', mentions: 8 },
  { engine: 'Gemini', mentions: 5 },
  { engine: 'Perplexity', mentions: 7 },
  { engine: 'Google AI', mentions: 3 },
  { engine: 'Claude', mentions: 3 },
]

const BLUE_COLORS = ['#3370FF', '#5A8FFF', '#1E40AF', '#93B4FF', '#60A5FA', '#2563EB']

function getBlueColor(index: number): string {
  return BLUE_COLORS[index % BLUE_COLORS.length]
}

// ─── Card 1: Trending Topics ──────────────────────────────────────────────────

function TrendingTopicsCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
          Trending Topics in Your Category
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-3">
        {/* Table header */}
        <div className="grid grid-cols-[24px_1fr_64px_72px] gap-1 px-5 py-2 border-y border-border/40 bg-muted/30">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">#</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Topic</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Trend</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Volume</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/40">
          {TRENDING_TOPICS.map((row) => (
            <div
              key={row.rank}
              className="grid grid-cols-[24px_1fr_64px_72px] gap-1 items-center px-5 py-2.5"
            >
              <span className="text-xs text-muted-foreground tabular-nums">{row.rank}</span>

              {/* Topic + optional Hot badge */}
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-foreground truncate">{row.topic}</span>
                {row.hot && (
                  <span className="shrink-0 rounded-full bg-[#EEF3FF] text-[#3370FF] text-[10px] font-semibold px-1.5 py-0.5 leading-none">
                    Hot
                  </span>
                )}
              </span>

              {/* Trend */}
              <span
                className={cn(
                  'text-xs tabular-nums font-medium text-right',
                  row.trend > 0 ? 'text-[#3370FF]' : 'text-muted-foreground'
                )}
              >
                {row.trend > 0 ? '↑' : '↓'}{Math.abs(row.trend)}%
              </span>

              {/* Volume */}
              <span className="text-xs tabular-nums text-muted-foreground text-right">
                {row.volume.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 2: Top AI Sources ───────────────────────────────────────────────────

function TopAISourcesCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
          Top Websites AI Loves
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-3">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_76px_52px_60px] gap-1 px-5 py-2 border-y border-border/40 bg-muted/30">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Domain</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Type</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Used %</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Avg. Cit.</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/40">
          {AI_SOURCES.map((row) => (
            <div
              key={row.domain}
              className="grid grid-cols-[1fr_76px_52px_60px] gap-1 items-center px-5 py-2.5"
            >
              {/* Domain with favicon mark */}
              <span className="flex items-center gap-2 min-w-0">
                <DomainFavicon domain={row.domain} size="sm" />
                <span className="text-xs text-foreground truncate">{row.domain}</span>
              </span>

              {/* Type badge */}
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold w-fit',
                  TYPE_BADGE_STYLES[row.type] ?? 'bg-[#EEF3FF] text-[#3370FF]'
                )}
              >
                {row.type}
              </span>

              {/* Used % */}
              <span className="text-xs tabular-nums text-muted-foreground text-right">{row.usedPct}%</span>

              {/* Avg. Citations */}
              <span className="text-xs tabular-nums text-muted-foreground text-right">{row.avgCitations}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 3: Recent AI Queries ────────────────────────────────────────────────

function RecentAIQueriesCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Recent AI Queries</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <div className="divide-y divide-border/40">
          {RECENT_QUERIES.map((item) => (
            <div key={item.id} className="py-3 first:pt-0">
              <div className="flex items-start gap-2.5">
                {/* Colored dot */}
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  {/* Query text */}
                  <p className="text-xs font-medium text-foreground leading-snug truncate">
                    {item.query}
                  </p>
                  {/* Snippet */}
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug line-clamp-1">
                    {item.snippet}
                  </p>
                  {/* Footer row */}
                  <div className="mt-1.5 flex items-center gap-2">
                    {/* Engine logo marks */}
                    <div className="flex items-center gap-1">
                      {item.engines.map((name) => {
                        const Logo = ENGINE_LOGOS[name]
                        return Logo ? <Logo key={name} size="sm" /> : null
                      })}
                    </div>
                    <span className="text-[10px] text-muted-foreground">|</span>
                    <span className="text-[10px] font-medium tabular-nums text-foreground">{item.score}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 4: Dark Donut (Traffic by AI Engine) — full width ──────────────────

function DarkDonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-white">{item.name}</p>
      <p className="text-gray-400 mt-0.5">
        {item.value} mention{item.value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function DarkDonutCard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const CHART_HEIGHT = 240
  const DONUT_WIDTH = 180

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

  const totalMentions = DARK_DONUT_DATA.reduce((sum, d) => sum + d.mentions, 0)

  // suppress unused var warning — chartWidth used for layout reference
  void chartWidth

  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-white/5 overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-white">Traffic by AI Engine</p>
      </div>
      <div className="px-5 pb-5">
        <div ref={containerRef} className="flex items-center gap-4" style={{ height: CHART_HEIGHT }}>
          {/* Donut chart */}
          <div className="shrink-0 relative" style={{ width: DONUT_WIDTH, height: CHART_HEIGHT }}>
            <PieChart width={DONUT_WIDTH} height={CHART_HEIGHT}>
              <Pie
                data={DARK_DONUT_DATA}
                dataKey="mentions"
                nameKey="engine"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={82}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {DARK_DONUT_DATA.map((entry, index) => (
                  <Cell
                    key={entry.engine}
                    fill={getBlueColor(index)}
                  />
                ))}
              </Pie>
              <Tooltip content={<DarkDonutTooltip />} />
            </PieChart>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums text-white leading-none">
                {totalMentions}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">mentions</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {DARK_DONUT_DATA.map((entry, index) => (
              <div key={entry.engine} className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: getBlueColor(index) }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-400 truncate">{entry.engine}</span>
                </span>
                <span className="text-xs font-medium tabular-nums text-white shrink-0">
                  {entry.mentions}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 5: Invisibility Card ────────────────────────────────────────────────

function InvisibilityCard() {
  return (
    <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-6">
      <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground mb-4">What AI says when customers search for you</p>

      {/* Simulated AI response */}
      <div className="rounded-lg bg-[#F8F8F8] p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full bg-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
            <span className="text-[8px] text-white font-bold">AI</span>
          </div>
          <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
            <p>&quot;Here are the best coffee shops near downtown:&quot;</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">1. The Daily Grind</span>
                <span className="text-[10px] text-muted-foreground">— Highly rated for specialty lattes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">2. Morning Roast Co</span>
                <span className="text-[10px] text-muted-foreground">— Known for organic blends</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">3. Espresso Lab</span>
                <span className="text-[10px] text-muted-foreground">— Popular for cold brew</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs text-red-500/80 italic">Your business isn&apos;t mentioned.</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">This is what your customers see — without Beamix.</p>
    </div>
  )
}

// ─── Group New export ─────────────────────────────────────────────────────────

export function GroupNew() {
  return (
    <div className="flex flex-col gap-3">

      {/* Row 1: Trending Topics + Top AI Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <TrendingTopicsCard />
        <TopAISourcesCard />
      </div>

      {/* Row 2: Recent AI Queries + Invisibility Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentAIQueriesCard />
        <InvisibilityCard />
      </div>

      {/* Row 3: Dark Donut — full width */}
      <DarkDonutCard />

    </div>
  )
}
