'use client'

import { useState } from 'react'

interface CategoryScore {
  score: number
  description: string
}

interface AiReadinessData {
  id: string
  user_id: string
  overall_score: number
  crawlability: CategoryScore | null
  schema_markup: CategoryScore | null
  content_quality: CategoryScore | null
  faq_coverage: CategoryScore | null
  llms_txt: CategoryScore | null
  created_at: string
  [key: string]: unknown
}

interface AiReadinessViewProps {
  readiness: AiReadinessData | null
  websiteUrl: string | null
}

const CATEGORIES = [
  { key: 'crawlability', label: 'Crawlability', icon: '/' },
  { key: 'schema_markup', label: 'Schema Markup', icon: '{}' },
  { key: 'content_quality', label: 'Content Quality', icon: 'A' },
  { key: 'faq_coverage', label: 'FAQ Coverage', icon: '?' },
  { key: 'llms_txt', label: 'llms.txt', icon: 'T' },
] as const

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 50) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

export function AiReadinessView({ readiness, websiteUrl }: AiReadinessViewProps) {
  const [isRunning, setIsRunning] = useState(false)

  async function handleRunAudit() {
    setIsRunning(true)
    try {
      const res = await fetch('/api/ai-readiness', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      }
    } catch {
      // Silently fail
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#141310]">AI Readiness</h1>
          {websiteUrl && (
            <p className="text-stone-400 text-sm mt-1">{websiteUrl}</p>
          )}
        </div>
        <button
          onClick={handleRunAudit}
          disabled={isRunning}
          className="px-4 py-2 bg-[#141310] text-white text-sm rounded-lg hover:bg-stone-800 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run AI Readiness Audit'}
        </button>
      </div>

      {!readiness ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-stone-500 text-lg">No AI readiness audit yet.</p>
          <p className="text-stone-400 mt-2">
            Run an audit to see how ready your website is for AI search engines.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-6 text-center">
            <p className="text-stone-500 text-sm mb-2">Overall AI Readiness Score</p>
            <p className={`text-6xl font-bold ${getScoreColor(readiness.overall_score)}`}>
              {readiness.overall_score}
            </p>
            <p className="text-stone-400 text-sm mt-2">out of 100</p>
            <p className="text-stone-400 text-xs mt-4">
              Last audited: {new Date(readiness.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(({ key, label, icon }) => {
              const category = readiness[key] as CategoryScore | null
              const score = category?.score ?? 0
              const description = category?.description ?? 'No data available'

              return (
                <div
                  key={key}
                  className={`rounded-xl border p-5 ${getScoreBgColor(score)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-stone-500 font-mono text-sm border border-stone-200">
                        {icon}
                      </span>
                      <h3 className="font-semibold text-[#141310]">{label}</h3>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm">{description}</p>
                  <a
                    href="/dashboard/agents"
                    className="inline-block mt-3 text-sm text-[#141310] font-medium hover:underline"
                  >
                    Improve &rarr;
                  </a>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
