'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  BookOpen,
  Star,
  Code2,
  Share2,
  Search,
  MessageSquare,
  Sparkles,
  Zap,
  Bot,
  Clock,
} from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable } from '@/components/ui/data-table'
import { StatusDot, type StatusDotStatus } from '@/components/ui/status-dot'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { AgentModal, type AgentExecuteParams } from './agent-modal'
import { agentTypeToSlug } from '@/lib/agents/config'
import { cn } from '@/lib/utils'

// ─── Agent definitions ────────────────────────────────────────────────────────

interface AgentDef {
  type: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  credits: number
  isUnlimited: boolean
  colorIcon: string
  colorBg: string
}

const AGENTS: AgentDef[] = [
  {
    type: 'content_writer',
    name: 'Content Writer',
    description: 'Generate AI-optimized website content, landing pages, and product descriptions that rank in AI search.',
    icon: FileText,
    credits: 1,
    isUnlimited: false,
    colorIcon: 'text-[#FF3C00]',
    colorBg: 'bg-[#FF3C00]/10',
  },
  {
    type: 'blog_writer',
    name: 'Blog Writer',
    description: 'Write SEO and AI-optimized blog posts that establish your expertise and improve citations.',
    icon: BookOpen,
    credits: 1,
    isUnlimited: false,
    colorIcon: 'text-violet-600',
    colorBg: 'bg-violet-50',
  },
  {
    type: 'review_analyzer',
    name: 'Review Analyzer',
    description: 'Analyze your online reviews across platforms and generate response templates to boost sentiment.',
    icon: Star,
    credits: 0,
    isUnlimited: true,
    colorIcon: 'text-amber-600',
    colorBg: 'bg-amber-50',
  },
  {
    type: 'schema_optimizer',
    name: 'Schema Optimizer',
    description: 'Generate JSON-LD structured data markup for your website to help AI engines understand your business.',
    icon: Code2,
    credits: 0,
    isUnlimited: true,
    colorIcon: 'text-emerald-600',
    colorBg: 'bg-emerald-50',
  },
  {
    type: 'social_strategy',
    name: 'Social Strategist',
    description: 'Create a social media strategy designed to build the authority signals AI engines look for.',
    icon: Share2,
    credits: 1,
    isUnlimited: false,
    colorIcon: 'text-pink-600',
    colorBg: 'bg-pink-50',
  },
  {
    type: 'competitor_intelligence',
    name: 'Competitor Intelligence',
    description: 'Deep-dive analysis of how your competitors rank in AI search and what strategies they use.',
    icon: Search,
    credits: 1,
    isUnlimited: false,
    colorIcon: 'text-[#FF3C00]',
    colorBg: 'bg-[#FF3C00]/10',
  },
  {
    type: 'faq_agent',
    name: 'FAQ Agent',
    description: 'Generate FAQ content that AI engines love to cite — answers real customer questions.',
    icon: MessageSquare,
    credits: 0,
    isUnlimited: true,
    colorIcon: 'text-sky-600',
    colorBg: 'bg-sky-50',
  },
]

// ─── Execution row type ───────────────────────────────────────────────────────

interface ExecutionRow {
  id: string
  agent_type: string
  status: string
  credits_cost: number
  created_at: string
  completed_at: string | null
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AgentsViewProps {
  totalCredits: number
  recentExecutions: ExecutionRow[]
  monthlyCredits?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(raw: string): StatusDotStatus {
  if (raw === 'completed') return 'completed'
  if (raw === 'running') return 'running'
  if (raw === 'failed') return 'failed'
  if (raw === 'pending') return 'pending'
  return 'idle'
}

function getDuration(exec: ExecutionRow): string {
  if (!exec.completed_at) return '—'
  const ms = new Date(exec.completed_at).getTime() - new Date(exec.created_at).getTime()
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.round(s / 60)}m`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AgentsView({ totalCredits, recentExecutions, monthlyCredits = 50 }: AgentsViewProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [execSearch, setExecSearch] = useState('')
  const [executeError, setExecuteError] = useState<string | null>(null)

  // ── KPI calculations ────────────────────────────────────────────────────────
  const totalRuns = recentExecutions.length
  const creditsUsed = monthlyCredits - totalCredits
  const creditsPercent = monthlyCredits > 0 ? Math.round((creditsUsed / monthlyCredits) * 100) : 0
  const completedCount = recentExecutions.filter((e) => e.status === 'completed').length
  const successRate = totalRuns > 0 ? Math.round((completedCount / totalRuns) * 100) : 0
  const activeAgentTypes = new Set(recentExecutions.map((e) => e.agent_type)).size

  // ── Last status per agent type ──────────────────────────────────────────────
  const lastStatusByType = recentExecutions.reduce<Record<string, StatusDotStatus>>((acc, exec) => {
    if (!acc[exec.agent_type]) {
      acc[exec.agent_type] = mapStatus(exec.status)
    }
    return acc
  }, {})

  // ── Modal handlers ──────────────────────────────────────────────────────────
  function openModal(agent: AgentDef) {
    setSelectedAgent(agent)
    setModalOpen(true)
  }

  async function handleExecute(params: AgentExecuteParams) {
    if (!selectedAgent) return
    setIsExecuting(true)
    setExecuteError(null)
    try {
      const slug = agentTypeToSlug(selectedAgent.type) ?? selectedAgent.type.replace(/_/g, '-')
      const res = await fetch(`/api/agents/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (res.ok) {
        const data = await res.json()
        setModalOpen(false)
        router.push(`/dashboard/agents/${selectedAgent.type}?execution=${data.execution_id}`)
      } else {
        setExecuteError('Failed to start agent. Please try again.')
      }
    } catch {
      setExecuteError('Network error. Please check your connection and try again.')
    } finally {
      setIsExecuting(false)
    }
  }

  // ── Execution table ─────────────────────────────────────────────────────────
  const filteredExecutions = execSearch
    ? recentExecutions
        .filter((e) => {
          const label = AGENTS.find((a) => a.type === e.agent_type)?.name ?? e.agent_type
          return label.toLowerCase().includes(execSearch.toLowerCase())
        })
        .slice(0, 50)
    : recentExecutions.slice(0, 10)

  const STATUS_LABELS: Record<StatusDotStatus, string> = {
    completed: 'Completed',
    running: 'Running',
    failed: 'Failed',
    pending: 'Pending',
    idle: 'Idle',
  }

  const executionColumns: ColumnDef<ExecutionRow>[] = [
    {
      header: 'Agent',
      accessorKey: 'agent_type',
      cell: ({ row }) => {
        const agentDef = AGENTS.find((a) => a.type === row.original.agent_type)
        const Icon = agentDef?.icon ?? Bot
        return (
          <span className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                agentDef?.colorBg ?? 'bg-muted',
                agentDef?.colorIcon ?? 'text-muted-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {agentDef?.name ?? row.original.agent_type}
            </span>
          </span>
        )
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const s = mapStatus(row.original.status)
        return (
          <span className="flex items-center gap-1.5">
            <StatusDot status={s} size="sm" />
            <span className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</span>
          </span>
        )
      },
    },
    {
      header: 'Cost',
      accessorKey: 'credits_cost',
      meta: { align: 'right' },
      cell: ({ row }) => {
        const cost = row.original.credits_cost
        return cost === 0 ? (
          <span className="text-xs text-emerald-600 font-medium">Free</span>
        ) : (
          <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
            <Zap className="h-3 w-3 text-[#FF3C00]" aria-hidden="true" />
            {cost} Run
          </span>
        )
      },
    },
    {
      header: 'Started',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {format(new Date(row.original.created_at), 'MMM d, HH:mm')}
        </span>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'completed_at',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {getDuration(row.original)}
        </span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <Link
          href={`/dashboard/agents/${row.original.agent_type}`}
          className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
        >
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Row 1: Page header ─────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI Agents</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your team of AI specialists ready to optimize your visibility.
        </p>
      </div>

      {/* ── Row 2: KPI strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-up [animation-delay:80ms]">
        <StatCard
          label="Total Runs"
          value={totalRuns}
          subtitle="all time executions"
          icon={<Bot />}
        />
        <Card className="card-hover gap-0 py-0">
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-muted-foreground [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
                <Zap />
              </span>
              <span className="section-eyebrow truncate">AI Runs Used</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="metric-value text-3xl">
                {creditsUsed}
                <span className="text-lg font-medium text-muted-foreground ml-1">/ {monthlyCredits}</span>
              </span>
              <div className="mt-2">
                <Progress
                  value={creditsPercent}
                  className="h-1.5 bg-primary/15 [&>div]:bg-primary"
                  aria-label={`${creditsPercent}% credits used`}
                />
              </div>
              <span className="text-sm text-muted-foreground leading-snug mt-1">{creditsPercent}% used</span>
            </div>
          </div>
        </Card>
        <StatCard
          label="Success Rate"
          value={totalRuns > 0 ? `${successRate}%` : '—'}
          subtitle={`${completedCount} of ${totalRuns} runs completed`}
          icon={<Sparkles />}
        />
        <StatCard
          label="Active Agents"
          value={activeAgentTypes}
          subtitle="unique agent types run"
          icon={<Clock />}
        />
      </div>

      {/* ── Row 3: Agent grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up [animation-delay:160ms]">
        {AGENTS.map((agent, i) => {
          const Icon = agent.icon
          const canAfford = agent.isUnlimited || totalCredits >= agent.credits
          const lastStatus = lastStatusByType[agent.type]
          return (
            <div
              key={agent.type}
              className={cn(
                'group relative rounded-[20px] border border-border bg-card p-5',
                'shadow-[var(--shadow-card)] card-hover',
                'transition-all duration-200 ease-out cursor-pointer overflow-hidden',
              )}
              style={{ animationDelay: `${160 + i * 40}ms` }}
            >
              {/* Icon + status row */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                    agent.colorBg,
                    agent.colorIcon,
                    'group-hover:scale-105 transition-transform duration-200',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  {lastStatus && lastStatus !== 'idle' && (
                    <StatusDot status={lastStatus} size="sm" />
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-medium border-border',
                      agent.isUnlimited
                        ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                        : 'text-muted-foreground',
                    )}
                  >
                    {agent.isUnlimited ? (
                      <>
                        <Sparkles className="h-2.5 w-2.5 mr-0.5 text-emerald-500" aria-hidden="true" />
                        Unlimited
                      </>
                    ) : (
                      <>
                        <Zap className="h-2.5 w-2.5 mr-0.5 text-[#FF3C00]" aria-hidden="true" />
                        1 AI Run
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Name + description */}
              <h3 className="text-sm font-semibold text-foreground mb-1">{agent.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                {agent.description}
              </p>

              {/* Run button */}
              <Button
                size="sm"
                className={cn(
                  'relative z-10 w-full rounded-lg text-xs',
                  canAfford
                    ? 'bg-foreground text-background hover:bg-foreground/90 btn-primary-lift'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
                disabled={!canAfford}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openModal(agent)
                }}
                aria-label={canAfford ? `Run ${agent.name}` : `Not enough AI Runs for ${agent.name}`}
              >
                <Sparkles className="me-1.5 h-3 w-3 rtl:order-last" aria-hidden="true" />
                {canAfford ? 'Run Agent' : 'Not enough AI Runs'}
              </Button>

              {/* Card-level link behind the button */}
              <Link
                href={`/dashboard/agents/${agent.type}`}
                className="absolute inset-0 z-0"
                aria-label={`Open ${agent.name} chat`}
                tabIndex={-1}
              >
                <span className="sr-only">Open {agent.name}</span>
              </Link>
            </div>
          )
        })}
      </div>

      {/* ── Row 4: Execution history ───────────────────────────────────────── */}
      <Card className="rounded-[20px] shadow-[var(--shadow-card)] animate-fade-up [animation-delay:320ms]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base font-semibold">Execution History</CardTitle>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search agents…"
                value={execSearch}
                onChange={(e) => setExecSearch(e.target.value)}
                className="h-8 rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 w-36"
                aria-label="Search executions"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-0">
          {recentExecutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <Bot className="h-9 w-9 text-muted-foreground/30 mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">No executions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Run your first agent to see execution history here.
              </p>
            </div>
          ) : (
            <DataTable
              columns={executionColumns}
              data={filteredExecutions}
              emptyMessage="No matching executions."
            />
          )}
        </CardContent>
      </Card>

      {/* ── Agent launch modal ─────────────────────────────────────────────── */}
      {selectedAgent && (
        <>
          <AgentModal
            open={modalOpen}
            onOpenChange={(open) => {
              setModalOpen(open)
              if (!open) setExecuteError(null)
            }}
            agentName={selectedAgent.name}
            agentSlug={agentTypeToSlug(selectedAgent.type) ?? selectedAgent.type.replace(/_/g, '-')}
            creditCost={selectedAgent.credits}
            totalCredits={totalCredits}
            onExecute={handleExecute}
            isLoading={isExecuting}
          />
          {executeError && !modalOpen && (
            <p className="text-sm text-red-500 mt-2">{executeError}</p>
          )}
        </>
      )}
    </div>
  )
}
