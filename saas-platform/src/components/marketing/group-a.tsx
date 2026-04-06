'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { ScoreRing } from '@/components/ui/score-ring'

const DEMO_SCORE = 75

const ENGINE_RESULTS = [
  { engine: 'ChatGPT', mentioned: true, position: 2, sentiment: 'positive' as const, color: '#10B981' },
  { engine: 'Gemini', mentioned: false, position: null, sentiment: null, color: '#3370FF' },
  { engine: 'Perplexity', mentioned: true, position: 4, sentiment: 'neutral' as const, color: '#8B5CF6' },
]

function ScoreGradientBar({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="relative h-4 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981, #06B6D4)' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-md z-10"
          style={{ left: `calc(${score}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-400">Critical</span>
        <span className="text-[10px] text-gray-400">Fair</span>
        <span className="text-[10px] text-gray-400">Good</span>
        <span className="text-[10px] text-gray-400">Excellent</span>
      </div>
    </div>
  )
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 10)
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: i < filled ? '#3370FF' : '#E5E7EB' }}
        />
      ))}
    </div>
  )
}

function EngineResultCard({
  engine, mentioned, position, sentiment, color,
}: (typeof ENGINE_RESULTS)[0]) {
  return (
    <div className="bg-white border border-gray-100 rounded-[16px] shadow-md p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-gray-900">{engine}</span>
      </div>
      <div className="flex items-center gap-2">
        {mentioned ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        )}
        <span className={`text-sm font-medium ${mentioned ? 'text-emerald-700' : 'text-red-700'}`}>
          {mentioned ? 'Mentioned' : 'Not Found'}
        </span>
      </div>
      {mentioned && position && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Position</span>
            <span className="text-xs font-bold text-gray-900 tabular-nums">#{position}</span>
          </div>
          {sentiment && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Sentiment</span>
              <span className={`text-xs font-medium capitalize ${sentiment === 'positive' ? 'text-emerald-600' : 'text-gray-600'}`}>
                {sentiment}
              </span>
            </div>
          )}
        </div>
      )}
      {!mentioned && (
        <p className="text-xs text-gray-400">Your business was not found in this engine&apos;s responses.</p>
      )}
    </div>
  )
}

export function GroupA() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* A1: Score ring + dots */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8 flex flex-col items-center gap-5">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">Your AI Visibility Score</p>
        <ScoreRing score={DEMO_SCORE} size="lg" showLabel animate />
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Good</p>
          <p className="text-xs text-gray-400 mt-0.5">Above 67% of businesses in your category</p>
        </div>
        <ScoreDots score={DEMO_SCORE} />
      </div>

      {/* A2: Score breakdown gradient bar */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8 flex flex-col gap-6">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">Score Breakdown</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl font-bold tabular-nums" style={{ color: '#06B6D4' }}>{DEMO_SCORE}</span>
            <span className="text-sm text-gray-500">out of 100</span>
          </div>
          <ScoreGradientBar score={DEMO_SCORE} />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Schema Markup', score: 90, color: '#06B6D4' },
              { label: 'Content Quality', score: 61, color: '#F59E0B' },
              { label: 'FAQ Coverage', score: 35, color: '#EF4444' },
              { label: 'Crawlability', score: 88, color: '#06B6D4' },
            ].map(({ label, score, color }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-500">{label}</span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{score}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A3: Engine results grid */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8 flex flex-col gap-5">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">Engine Results</p>
        <div className="grid grid-cols-1 gap-3">
          {ENGINE_RESULTS.map((engine) => (
            <EngineResultCard key={engine.engine} {...engine} />
          ))}
        </div>
      </div>
    </div>
  )
}
