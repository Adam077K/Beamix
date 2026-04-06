'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  { rank: 2, name: 'Starbucks', score: 68, mentions: 142, position: 4.7, change: -2.6, visibility: 28.6 },
  { rank: 3, name: 'Blue Bottle', score: 52, mentions: 164, position: 5.8, change: 3.3, visibility: 18.5 },
  { rank: 4, name: "Peet's Coffee", score: 44, mentions: 139, position: 6.5, change: -1.4, visibility: 16.0 },
  { rank: 5, name: 'Intelligentsia', score: 38, mentions: 98, position: 7.5, change: 3.3, visibility: 13.4 },
]

const BRAND_COLORS = ['bg-[#3370FF]', 'bg-slate-800', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500']

// ─── Group C component ────────────────────────────────────────────────────────

export function GroupC() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* C1: Competitor bar chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Competitor Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">AI visibility scores vs. top competitors</p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <CompetitorBarChart data={DEMO_COMPETITORS} hasRealData />
        </CardContent>
      </Card>

      {/* C2: Industry leaderboard — exact dashboard pattern */}
      <Card className="overflow-hidden">
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Industry Ranking</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Coffee shops — AI search ranking</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">31.5%</span>
            <p className="text-[10px] text-slate-400">Average visibility score</p>
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[18px_1fr_52px_36px_44px_48px] gap-1 px-4 py-1.5 border-y border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">#</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Brand</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Mentions</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Pos</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Change</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Visibility</span>
        </div>

        {/* Table rows */}
        <div className="flex flex-col">
          {LEADERBOARD.map((row, idx) => (
            <div
              key={row.rank}
              className={cn(
                'grid grid-cols-[18px_1fr_52px_36px_44px_48px] gap-1 items-center px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0',
                row.isUser && 'bg-blue-50/30 dark:bg-blue-950/20'
              )}
            >
              <span className="text-[11px] text-slate-400 tabular-nums">{row.rank}</span>
              <span className="flex items-center gap-1.5 min-w-0">
                <span className={cn('h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0', BRAND_COLORS[idx % BRAND_COLORS.length])}>
                  {row.name.charAt(0)}
                </span>
                <span className={cn('text-[11px] truncate', row.isUser ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>
                  {row.name}
                </span>
                {row.isUser && (
                  <span className="shrink-0 rounded bg-slate-100 dark:bg-slate-800 px-1 py-0 text-[9px] font-semibold text-slate-500">You</span>
                )}
              </span>
              <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 text-right">{row.mentions}</span>
              <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 text-right">{row.position}</span>
              <span className={cn('text-[11px] tabular-nums text-right font-medium', row.change > 0 ? 'text-emerald-500' : 'text-red-500')}>
                {row.change > 0 ? '+' : ''}{row.change}%
              </span>
              <span className="text-[11px] tabular-nums text-slate-900 dark:text-white text-right font-medium">{row.visibility}%</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
