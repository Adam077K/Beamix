'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { CompetitorBarChart } from '@/components/dashboard/charts/competitor-bar-chart'

const DEMO_COMPETITORS = [
  { name: 'Acme Coffee', score: 75, isUser: true },
  { name: 'Starbucks', score: 68, isUser: false },
  { name: 'Blue Bottle', score: 52, isUser: false },
  { name: "Peet's Coffee", score: 44, isUser: false },
  { name: 'Intelligentsia', score: 38, isUser: false },
]

const LEADERBOARD = [
  { rank: 1, name: 'Acme Coffee', isUser: true, mentions: 28, position: 2.5, change: 12, visibility: 75 },
  { rank: 2, name: 'Starbucks', isUser: false, mentions: 24, position: 3.1, change: 3, visibility: 68 },
  { rank: 3, name: 'Blue Bottle', isUser: false, mentions: 18, position: 3.8, change: -2, visibility: 52 },
  { rank: 4, name: "Peet's Coffee", isUser: false, mentions: 12, position: 4.5, change: -5, visibility: 44 },
  { rank: 5, name: 'Intelligentsia', isUser: false, mentions: 9, position: 5.2, change: 1, visibility: 38 },
]

export function GroupC() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* C1: Competitor bar chart */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
          Competitor Comparison
        </p>
        <p className="text-sm text-gray-500 mb-6">AI visibility scores vs. top competitors</p>
        <CompetitorBarChart data={DEMO_COMPETITORS} hasRealData />
      </div>

      {/* C2: Industry leaderboard */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
          Industry Leaderboard
        </p>
        <p className="text-sm text-gray-500 mb-6">Coffee shops — AI search ranking</p>
        <div className="flex flex-col divide-y divide-gray-50">
          {/* Header row */}
          <div className="flex items-center gap-3 pb-2">
            <span className="w-6 text-[10px] font-medium text-gray-400 uppercase">#</span>
            <span className="flex-1 text-[10px] font-medium text-gray-400 uppercase">Business</span>
            <span className="w-16 text-right text-[10px] font-medium text-gray-400 uppercase">Mentions</span>
            <span className="w-16 text-right text-[10px] font-medium text-gray-400 uppercase">Position</span>
            <span className="w-14 text-right text-[10px] font-medium text-gray-400 uppercase">Change</span>
            <span className="w-16 text-right text-[10px] font-medium text-gray-400 uppercase">Score</span>
          </div>
          {LEADERBOARD.map((row) => (
            <div
              key={row.rank}
              className={`flex items-center gap-3 py-3 ${row.isUser ? 'bg-blue-50/60 -mx-2 px-2 rounded-xl' : ''}`}
            >
              <span className={`w-6 text-sm font-bold tabular-nums ${row.isUser ? 'text-[#3370FF]' : 'text-gray-400'}`}>
                {row.rank}
              </span>
              <span className={`flex-1 text-sm font-medium truncate ${row.isUser ? 'text-[#3370FF]' : 'text-gray-800'}`}>
                {row.name}
                {row.isUser && (
                  <span className="ml-1.5 text-[10px] bg-[#3370FF] text-white rounded-full px-1.5 py-0.5 font-semibold">You</span>
                )}
              </span>
              <span className="w-16 text-right text-sm tabular-nums text-gray-700">{row.mentions}</span>
              <span className="w-16 text-right text-sm tabular-nums text-gray-700">{row.position}</span>
              <span className="w-14 text-right">
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${row.change > 0 ? 'text-emerald-600' : row.change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {row.change > 0 ? <TrendingUp className="h-3 w-3" /> : row.change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                  {row.change > 0 ? '+' : ''}{row.change}%
                </span>
              </span>
              <span className="w-16 text-right text-sm font-bold tabular-nums" style={{ color: row.isUser ? '#3370FF' : '#6B7280' }}>
                {row.visibility}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
