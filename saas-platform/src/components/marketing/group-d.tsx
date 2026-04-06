'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Bot, Globe, FileCode2, FileText, HelpCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Demo data ────────────────────────────────────────────────────────────────

const AGENT_RUNS = [
  { name: 'Content Writer', status: 'completed' as const, credits: 3, completedAt: 'Mar 30', agentType: 'content_writer' },
  { name: 'Schema Optimizer', status: 'completed' as const, credits: 2, completedAt: 'Mar 28', agentType: 'schema_optimizer' },
  { name: 'FAQ Agent', status: 'running' as const, credits: 2, completedAt: null, agentType: 'faq_agent' },
  { name: 'Blog Writer', status: 'completed' as const, credits: 3, completedAt: 'Mar 25', agentType: 'blog_writer' },
]

interface ReadinessItem {
  label: string
  icon: LucideIcon
  score: number
  color: string
}

const READINESS_ITEMS: ReadinessItem[] = [
  { label: 'Schema Markup', icon: FileCode2, score: 90, color: '#06B6D4' },
  { label: 'FAQ Coverage', icon: HelpCircle, score: 35, color: '#EF4444' },
  { label: 'Content Quality', icon: FileText, score: 61, color: '#F59E0B' },
  { label: 'Crawlability', icon: Globe, score: 88, color: '#06B6D4' },
  { label: 'llms.txt Present', icon: Bot, score: 0, color: '#EF4444' },
]

// ─── Running status dot ───────────────────────────────────────────────────────

function RunningDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3370FF] opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3370FF]" />
    </span>
  )
}

// ─── Group D component ────────────────────────────────────────────────────────

export function GroupD() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* D1: Agent activity — Bankio "Recent Activities" style */}
      <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <p className="text-sm font-medium text-foreground">Agent Activity</p>
          <p className="text-xs text-muted-foreground">AI agents working on your visibility</p>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-3">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_72px_48px_72px] gap-1 px-5 py-2 border-y border-border/40 bg-muted/30">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Agent</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Credits</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground text-right">Date</span>
          </div>

          {/* Agent rows */}
          <div className="divide-y divide-border/40">
            {AGENT_RUNS.map((run) => (
              <div
                key={run.agentType}
                className="grid grid-cols-[1fr_72px_48px_72px] gap-1 items-center px-5 py-3"
              >
                {/* Agent name + icon */}
                <span className="flex items-center gap-2 min-w-0">
                  <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground truncate">{run.name}</span>
                </span>

                {/* Status — small dot + plain text, no pill badges */}
                <span className="flex items-center gap-1.5">
                  {run.status === 'running' ? (
                    <>
                      <RunningDot />
                      <span className="text-xs font-medium text-[#3370FF]">Running</span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                      <span className="text-xs font-medium text-emerald-600">Done</span>
                    </>
                  )}
                </span>

                {/* Credits */}
                <span className="text-xs tabular-nums text-muted-foreground text-right">
                  {run.credits} cr
                </span>

                {/* Date */}
                <span className="text-xs text-muted-foreground text-right">
                  {run.completedAt ?? 'Active'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* D2: AI Readiness Score — clean list with thin progress bars */}
      <Card className="overflow-hidden border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-0 pt-5 px-5">
          <p className="text-sm font-medium text-foreground">AI Readiness Score</p>
          <p className="text-xs text-muted-foreground">How ready your site is for AI search engines</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3 space-y-3">
          {READINESS_ITEMS.map(({ label, icon: Icon, score, color }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="flex-1 text-xs text-foreground">{label}</span>
                <span
                  className="text-xs font-medium tabular-nums shrink-0"
                  style={{ color }}
                >
                  {score}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}
