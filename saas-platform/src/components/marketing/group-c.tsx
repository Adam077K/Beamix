'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CompetitorBarChart } from '@/components/dashboard/charts/competitor-bar-chart'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_COMPETITORS = [
  { name: 'Acme Coffee', score: 75, isUser: true },
  { name: 'Starbucks', score: 68, isUser: false },
  { name: 'Blue Bottle', score: 52, isUser: false },
  { name: "Peet's Coffee", score: 44, isUser: false },
  { name: 'Intelligentsia', score: 38, isUser: false },
]

const LEADERBOARD = [
  { rank: 1, name: 'Acme Coffee', isUser: true, mentions: 534, position: 3.5, change: -3.3, visibility: 31.5 },
  { rank: 2, name: 'Starbucks', mentions: 142, position: 4.7, change: -2.6, visibility: 28.6 },
  { rank: 3, name: 'Blue Bottle', mentions: 164, position: 5.8, change: 3.3, visibility: 18.5 },
  { rank: 4, name: "Peet's Coffee", mentions: 139, position: 6.5, change: -1.4, visibility: 16.0 },
  { rank: 5, name: 'Intelligentsia', mentions: 98, position: 7.5, change: 3.3, visibility: 13.4 },
]

const BRAND_COLORS = ['bg-[#3370FF]', 'bg-[#1E40AF]', 'bg-[#5A8FFF]', 'bg-[#93B4FF]', 'bg-[#2563EB]']

// ─── Group C component ────────────────────────────────────────────────────────

export function GroupC() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* C1: Competitor bar chart */}
      <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <p className="text-sm font-medium text-foreground">Competitor Comparison</p>
          <p className="text-xs text-muted-foreground">AI visibility scores vs. top competitors</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <CompetitorBarChart data={DEMO_COMPETITORS} hasRealData />
        </CardContent>
      </Card>

      {/* C2: Industry leaderboard — Wavespace "Industry Ranking" style */}
      <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {/* Card header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-sm font-medium text-foreground">Industry Ranking</p>
            <p className="text-xs text-muted-foreground mt-0.5">Coffee shops — AI search ranking</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold tabular-nums text-foreground">31.5%</span>
            <p className="text-xs text-muted-foreground mt-0.5">Average visibility score</p>
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[18px_1fr_52px_36px_44px_52px] gap-1 px-5 py-2 border-y border-border/40 bg-muted/30">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">#</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Brand</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Mentions</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Pos</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Change</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Score</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-border/40">
          {LEADERBOARD.map((row, idx) => (
            <div
              key={row.rank}
              className={cn(
                'grid grid-cols-[18px_1fr_52px_36px_44px_52px] gap-1 items-center px-5 py-2.5',
                row.isUser && 'bg-primary/5'
              )}
            >
              <span className="text-xs text-muted-foreground tabular-nums">{row.rank}</span>

              {/* Brand cell */}
              <span className="flex items-center gap-1.5 min-w-0">
                <span className={cn('h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0', BRAND_COLORS[idx % BRAND_COLORS.length])}>
                  {row.name.charAt(0)}
                </span>
                <span className={cn('text-xs truncate', row.isUser ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                  {row.name}
                </span>
                {row.isUser && (
                  <span className="shrink-0 rounded bg-muted px-1 py-0 text-[9px] font-medium text-muted-foreground">You</span>
                )}
              </span>

              <span className="text-xs tabular-nums text-muted-foreground text-right">{row.mentions}</span>
              <span className="text-xs tabular-nums text-muted-foreground text-right">{row.position}</span>

              {/* Change — colored text only, no badges */}
              <span className={cn('text-xs tabular-nums text-right font-medium', row.change > 0 ? 'text-[#3370FF]' : 'text-muted-foreground')}>
                {row.change > 0 ? '+' : ''}{row.change}%
              </span>

              <span className="text-xs tabular-nums text-foreground text-right font-medium">{row.visibility}%</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
