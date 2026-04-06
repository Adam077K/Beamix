'use client'

import {} from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DomainFavicon, ENGINE_LOGOS } from '@/components/marketing/logos'
import { PremiumDarkDonut } from '@/components/marketing/charts/premium-dark-donut'

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

      {/* Row 3: Premium Dark Donut — full width */}
      <PremiumDarkDonut />

    </div>
  )
}
