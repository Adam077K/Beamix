'use client'

import { useRef, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

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

interface BrandDot {
  name: string
  initials: string
  color: string
  x: number // 0-100 (left = 0, right = 100)
  y: number // 0-100 (top = 0 = high sentiment, bottom = low sentiment)
  isUser?: boolean
}

const BRAND_DOTS: BrandDot[] = [
  { name: 'Acme Coffee', initials: 'AC', color: '#3370FF', x: 70, y: 25, isUser: true },
  { name: 'Starbucks', initials: 'SB', color: '#2563EB', x: 82, y: 30 },
  { name: 'Blue Bottle', initials: 'BB', color: '#93B4FF', x: 50, y: 48 },
  { name: "Peet's Coffee", initials: 'PC', color: '#C5D7FF', x: 30, y: 72 },
  { name: 'Intelligentsia', initials: 'IN', color: '#5A8FFF', x: 18, y: 28 },
]

const AI_MODELS = [
  { name: 'ChatGPT', checked: true, plan: null },
  { name: 'Gemini', checked: true, plan: null },
  { name: 'Perplexity', checked: true, plan: null },
  { name: 'Claude', checked: false, plan: 'Pro' as const },
  { name: 'Google AI Overviews', checked: false, plan: 'Pro' as const },
  { name: 'Grok', checked: false, plan: 'Business' as const },
  { name: 'DeepSeek', checked: false, plan: 'Business' as const },
]

const RECENT_QUERIES = [
  {
    id: 1,
    color: '#3370FF',
    query: "What's the best coffee shop near downtown?",
    snippet: 'Acme Coffee is highly recommended for its specialty roasts and relaxed atmosphere...',
    engines: ['#3370FF', '#2563EB', '#5A8FFF'],
    score: 80,
    time: '1d ago',
  },
  {
    id: 2,
    color: '#5A8FFF',
    query: 'Which coffee shops have good AI search visibility?',
    snippet: 'Acme Coffee ranks top for AI mentions across ChatGPT and Perplexity...',
    engines: ['#3370FF', '#1E40AF', '#5A8FFF', '#60A5FA'],
    score: 74,
    time: '2d ago',
  },
  {
    id: 3,
    color: '#93B4FF',
    query: 'Best specialty coffee near me with organic options',
    snippet: 'Acme Coffee and Blue Bottle are frequently mentioned in AI answers about organic...',
    engines: ['#3370FF', '#2563EB'],
    score: 68,
    time: '3d ago',
  },
  {
    id: 4,
    color: '#60A5FA',
    query: 'Coffee shop open late night with good wifi?',
    snippet: 'Several users point to Acme Coffee as the go-to for late-night work sessions...',
    engines: ['#3370FF', '#5A8FFF', '#1E40AF'],
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
                  <span className="shrink-0 rounded-full bg-[#EEF3FF] text-[#3370FF] text-[9px] font-semibold px-1.5 py-0.5 leading-none">
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
              {/* Domain with avatar */}
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                >
                  {row.letter}
                </span>
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

// ─── Card 3: Brand Position Map ───────────────────────────────────────────────

function BrandPositionMapCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-1 pt-5 px-5">
        <div>
          <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">Brand Positioning</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Visibility vs Sentiment</p>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-2">
        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-muted-foreground tracking-wide whitespace-nowrap select-none" aria-hidden="true">
            Sentiment →
          </div>

          {/* Quadrant container */}
          <div className="ml-5 relative" style={{ paddingBottom: '20px' }}>
            <div
              className="relative w-full rounded-lg overflow-hidden"
              style={{ height: 180 }}
              role="img"
              aria-label="Brand positioning quadrant chart showing brands by visibility and sentiment"
            >
              {/* Quadrant backgrounds */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-border/30 bg-[#F8FAFF]/60" />
                <div className="border-b border-border/30 bg-[#EEF3FF]/40" />
                <div className="border-r border-border/30 bg-[#FAFAFA]/40" />
                <div className="bg-[#F5F8FF]/40" />
              </div>

              {/* Quadrant labels */}
              <span className="absolute top-2 left-3 text-[9px] font-medium text-[#93B4FF] select-none">Niche Players</span>
              <span className="absolute top-2 right-3 text-[9px] font-medium text-[#3370FF] select-none">Leaders</span>
              <span className="absolute bottom-2 left-3 text-[9px] font-medium text-muted-foreground select-none">Laggers</span>
              <span className="absolute bottom-2 right-3 text-[9px] font-medium text-muted-foreground select-none">Controversial</span>

              {/* Center crosshairs */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border/40" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border/40" />
              </div>

              {/* Brand dots */}
              {BRAND_DOTS.map((dot) => (
                <div
                  key={dot.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    zIndex: dot.isUser ? 10 : 5,
                  }}
                  title={dot.name}
                >
                  {dot.isUser && (
                    <span
                      className="absolute h-7 w-7 rounded-md opacity-20"
                      style={{ backgroundColor: dot.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      'h-5 w-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white',
                      dot.isUser && 'ring-2 ring-offset-1 ring-[#3370FF]'
                    )}
                    style={{ backgroundColor: dot.color }}
                  >
                    {dot.initials}
                  </span>
                </div>
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-1 text-[9px] text-muted-foreground tracking-wide select-none" aria-hidden="true">
              Visibility →
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-2">
          {BRAND_DOTS.map((dot) => (
            <span key={dot.name} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-sm shrink-0"
                style={{ backgroundColor: dot.color }}
                aria-hidden="true"
              />
              <span className={cn('text-[10px]', dot.isUser ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                {dot.name}
              </span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 4: AI Models Scanned ────────────────────────────────────────────────

function CheckIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="14" height="14" rx="4" fill="#3370FF" />
        <path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="14" height="14" rx="4" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

const PLAN_BADGE_STYLES: Record<'Pro' | 'Business', string> = {
  Pro: 'bg-[#EEF3FF] text-[#3370FF]',
  Business: 'bg-[#E8EEFB] text-[#1E40AF]',
}

function AIModelsScanCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <CardHeader className="pb-0 pt-5 px-5">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">AI Models Scanned</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <div className="space-y-2.5">
          {AI_MODELS.map((model) => (
            <div key={model.name} className="flex items-center gap-2.5">
              <CheckIcon checked={model.checked} />
              <span
                className={cn(
                  'flex-1 text-xs',
                  model.checked ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {model.name}
              </span>
              {model.plan && (
                <span
                  className={cn(
                    'rounded-full text-[9px] font-semibold px-1.5 py-0.5 leading-none shrink-0',
                    PLAN_BADGE_STYLES[model.plan]
                  )}
                >
                  {model.plan}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Upgrade to Pro to unlock 4 more AI engines.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Card 5: Recent AI Queries ────────────────────────────────────────────────

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
                    {/* Engine dots */}
                    <div className="flex items-center gap-0.5" aria-label="AI engines that answered">
                      {item.engines.map((eng, i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: eng }}
                          aria-hidden="true"
                        />
                      ))}
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

// ─── Card 6: Dark Donut (Traffic by AI Engine) ────────────────────────────────

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
  const CHART_HEIGHT = 200
  const DONUT_WIDTH = 160

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
                innerRadius={52}
                outerRadius={72}
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

// ─── Group New export ─────────────────────────────────────────────────────────

export function GroupNew() {
  return (
    <div className="flex flex-col gap-3">

      {/* Row 1: Trending Topics + Top AI Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <TrendingTopicsCard />
        <TopAISourcesCard />
      </div>

      {/* Row 2: Brand Position Map + AI Models Scanned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BrandPositionMapCard />
        <AIModelsScanCard />
      </div>

      {/* Row 3: Recent AI Queries + Dark Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentAIQueriesCard />
        <DarkDonutCard />
      </div>

    </div>
  )
}
