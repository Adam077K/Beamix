'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Globe, FileCode2, FileText, HelpCircle, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

// ─── Demo data ────────────────────────────────────────────────────────────────

const AGENT_RUNS = [
  { name: 'Content Writer', status: 'completed' as const, credits: 3, completedAt: 'Mar 30', agentType: 'content_writer' },
  { name: 'Schema Optimizer', status: 'completed' as const, credits: 2, completedAt: 'Mar 28', agentType: 'schema_optimizer' },
  { name: 'FAQ Agent', status: 'running' as const, credits: 2, completedAt: null, agentType: 'faq_agent' },
  { name: 'Blog Writer', status: 'completed' as const, credits: 3, completedAt: 'Mar 25', agentType: 'blog_writer' },
]

const READINESS_ITEMS = [
  { label: 'Schema Markup', icon: FileCode2, score: 90, color: '#06B6D4', status: 'pass' as const },
  { label: 'FAQ Coverage', icon: HelpCircle, score: 35, color: '#EF4444', status: 'fail' as const },
  { label: 'Content Quality', icon: FileText, score: 61, color: '#F59E0B', status: 'warning' as const },
  { label: 'Crawlability', icon: Globe, score: 88, color: '#06B6D4', status: 'pass' as const },
  { label: 'llms.txt Present', icon: Bot, score: 0, color: '#EF4444', status: 'fail' as const },
]

// ─── Status indicator ─────────────────────────────────────────────────────────

function AuditStatusIcon({ status }: { status: 'pass' | 'fail' | 'warning' }) {
  if (status === 'pass') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
  if (status === 'fail') return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
  return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
}

// ─── Group D component ────────────────────────────────────────────────────────

export function GroupD() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* D1: Agent activity — dashboard table style */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Agent Activity</CardTitle>
          <p className="text-xs text-muted-foreground">AI agents working on your visibility</p>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_72px_48px_72px] gap-1 px-4 py-1.5 border-y border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Agent</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-center">Status</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Credits</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 text-right">Date</span>
          </div>

          {/* Agent rows */}
          <div className="flex flex-col">
            {AGENT_RUNS.map((run) => (
              <div
                key={run.agentType}
                className="grid grid-cols-[1fr_72px_48px_72px] gap-1 items-center px-4 py-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
              >
                {/* Agent name + icon */}
                <span className="flex items-center gap-2 min-w-0">
                  <span className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-[#3370FF]" aria-hidden="true" />
                  </span>
                  <span className="text-[12px] font-medium text-slate-800 dark:text-white truncate">{run.name}</span>
                </span>

                {/* Status badge */}
                <div className="flex justify-center">
                  {run.status === 'running' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-[#3370FF]">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3370FF] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3370FF]" />
                      </span>
                      Running
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Done
                    </span>
                  )}
                </div>

                {/* Credits */}
                <span className="text-[11px] tabular-nums text-slate-600 dark:text-slate-400 text-right">
                  {run.credits} cr
                </span>

                {/* Date */}
                <span className="text-[10px] text-slate-400 text-right">
                  {run.completedAt ?? 'In progress'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* D2: AI Readiness audit card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">AI Readiness Score</CardTitle>
          <p className="text-xs text-muted-foreground">How ready your site is for AI search engines</p>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {READINESS_ITEMS.map(({ label, icon: Icon, score, color, status }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30"
            >
              {/* Icon */}
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              </div>

              {/* Label + bar */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-slate-800 dark:text-white">{label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <AuditStatusIcon status={status} />
                    <span
                      className="text-[11px] font-bold tabular-nums"
                      style={{ color }}
                    >
                      {score}
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}
