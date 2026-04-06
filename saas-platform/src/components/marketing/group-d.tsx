'use client'

import { CheckCircle2, XCircle, AlertTriangle, Loader2, Globe, FileCode2, FileText, HelpCircle, Bot } from 'lucide-react'

const AGENT_RUNS = [
  { name: 'Content Writer', status: 'completed', credits: 3, completedAt: '2026-03-30', agentType: 'content_writer' },
  { name: 'Schema Optimizer', status: 'completed', credits: 2, completedAt: '2026-03-28', agentType: 'schema_optimizer' },
  { name: 'FAQ Agent', status: 'running', credits: 2, completedAt: null, agentType: 'faq_agent' },
  { name: 'Blog Writer', status: 'completed', credits: 3, completedAt: '2026-03-25', agentType: 'blog_writer' },
]

const READINESS_CARDS = [
  { label: 'Schema Markup', icon: FileCode2, score: 90, color: '#06B6D4', status: 'pass' as const },
  { label: 'FAQ Coverage', icon: HelpCircle, score: 35, color: '#EF4444', status: 'fail' as const },
  { label: 'Content Quality', icon: FileText, score: 61, color: '#F59E0B', status: 'warning' as const },
  { label: 'Crawlability', icon: Globe, score: 88, color: '#06B6D4', status: 'pass' as const },
  { label: 'llms.txt', icon: Bot, score: 0, color: '#EF4444', status: 'fail' as const },
]

function StatusIcon({ status }: { status: 'pass' | 'fail' | 'warning' | 'running' | 'completed' }) {
  if (status === 'pass' || status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
  if (status === 'fail') return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
  if (status === 'running') return <Loader2 className="h-4 w-4 text-[#3370FF] shrink-0 animate-spin" />
  return null
}

export function GroupD() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* D1: Recent agent runs */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
          Recent Agent Runs
        </p>
        <p className="text-sm text-gray-500 mb-6">AI agents working on your visibility</p>
        <div className="flex flex-col divide-y divide-gray-50">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2">
            <span className="flex-1 text-[10px] font-medium text-gray-400 uppercase">Agent</span>
            <span className="w-20 text-center text-[10px] font-medium text-gray-400 uppercase">Status</span>
            <span className="w-16 text-right text-[10px] font-medium text-gray-400 uppercase">Credits</span>
            <span className="w-24 text-right text-[10px] font-medium text-gray-400 uppercase">Completed</span>
          </div>
          {AGENT_RUNS.map((run) => (
            <div key={run.agentType} className="flex items-center gap-3 py-3.5">
              <div className="flex-1 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-[#3370FF]" />
                </div>
                <span className="text-sm font-medium text-gray-900">{run.name}</span>
              </div>
              <div className="w-20 flex justify-center">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  run.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                  run.status === 'running' ? 'bg-blue-50 text-[#3370FF]' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {run.status === 'running' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                  {run.status === 'completed' ? 'Done' : 'Running'}
                </span>
              </div>
              <span className="w-16 text-right text-sm tabular-nums text-gray-600">{run.credits} cr</span>
              <span className="w-24 text-right text-xs text-gray-400">
                {run.completedAt ?? 'In progress...'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* D2: AI readiness cards */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-lg p-8">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
          AI Readiness Score
        </p>
        <p className="text-sm text-gray-500 mb-6">How ready your site is for AI search engines</p>
        <div className="grid grid-cols-1 gap-3">
          {READINESS_CARDS.map(({ label, icon: Icon, score, color, status }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60">
              <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={status} />
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>{score}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
