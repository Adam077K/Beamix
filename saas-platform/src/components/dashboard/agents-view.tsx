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
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { formatDistanceToNow } from 'date-fns'
import { AgentModal, type AgentExecuteParams } from './agent-modal'
import { agentTypeToSlug } from '@/lib/agents/config'
import { cn } from '@/lib/utils'

interface AgentDef {
  type: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  credits: number
  color: string
}

const AGENTS: AgentDef[] = [
  {
    type: 'content_writer',
    name: 'Content Writer',
    description: 'Generate AI-optimized website content, landing pages, and product descriptions that rank in AI search.',
    icon: FileText,
    credits: 3,
    color: 'bg-[#FFF5F2] text-[#FF3C00]',
  },
  {
    type: 'blog_writer',
    name: 'Blog Writer',
    description: 'Write SEO and AI-optimized blog posts that establish your expertise and improve citations.',
    icon: BookOpen,
    credits: 5,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    type: 'review_analyzer',
    name: 'Review Analyzer',
    description: 'Analyze your online reviews across platforms and generate response templates to boost sentiment.',
    icon: Star,
    credits: 2,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    type: 'schema_optimizer',
    name: 'Schema Optimizer',
    description: 'Generate JSON-LD structured data markup for your website to help AI engines understand your business.',
    icon: Code2,
    credits: 2,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    type: 'social_strategy',
    name: 'Social Strategist',
    description: 'Create a social media strategy designed to build the authority signals AI engines look for.',
    icon: Share2,
    credits: 3,
    color: 'bg-pink-50 text-pink-600',
  },
  {
    type: 'competitor_intelligence',
    name: 'Competitor Research',
    description: 'Deep-dive analysis of how your competitors rank in AI search and what strategies they use.',
    icon: Search,
    credits: 4,
    color: 'bg-[#FFF5F2] text-[#FF3C00]',
  },
  {
    type: 'faq_agent',
    name: 'Query Researcher',
    description: 'Discover what questions potential customers ask AI engines about your industry and location.',
    icon: MessageSquare,
    credits: 2,
    color: 'bg-green-50 text-green-600',
  },
]

interface AgentsViewProps {
  totalCredits: number
  recentExecutions: Array<{
    id: string
    agent_type: string
    status: string
    credits_cost: number
    created_at: string
    completed_at: string | null
  }>
}

export function AgentsView({ totalCredits, recentExecutions }: AgentsViewProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  function openModal(agent: AgentDef) {
    setSelectedAgent(agent)
    setModalOpen(true)
  }

  async function handleExecute(params: AgentExecuteParams) {
    if (!selectedAgent) return
    setIsExecuting(true)
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
      }
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agents"
        description="Your team of AI agents ready to improve your visibility"
      >
        <div className="flex items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{totalCredits}</span>
          <span className="text-xs text-muted-foreground">credits</span>
        </div>
      </PageHeader>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => {
          const Icon = agent.icon
          const canAfford = totalCredits >= agent.credits
          return (
            <div
              key={agent.type}
              className={cn(
                'group relative rounded-[20px] border border-border bg-card p-5',
                'shadow-sm',
                'hover:shadow-md hover:-translate-y-1',
                'transition-all duration-200 ease-out cursor-pointer',
                'overflow-hidden',
              )}
            >
              {/* Agent icon + status row */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  agent.color,
                  'transition-all duration-200',
                  'group-hover:scale-105',
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-medium">
                  {agent.credits} credit{agent.credits !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Agent name + description */}
              <h3 className="text-sm font-semibold text-foreground mb-1">{agent.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {agent.description}
              </p>

              {/* Spacer to ensure run button doesn't overlap content */}
              <div className="h-8" aria-hidden="true" />

              {/* Hover-reveal run button — slides up from bottom */}
              <div className={cn(
                'absolute bottom-0 inset-x-0 px-5 py-4',
                'bg-gradient-to-t from-card via-card/95 to-transparent',
                'translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0',
                'transition-transform duration-200 ease-out',
              )}>
                <Button
                  size="sm"
                  className={cn(
                    'w-full rounded-lg text-xs',
                    canAfford
                      ? 'bg-primary text-primary-foreground hover:bg-[#e63600]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                  disabled={!canAfford}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openModal(agent)
                  }}
                  aria-label={canAfford ? `Run ${agent.name}` : `Not enough credits for ${agent.name}`}
                >
                  <Sparkles className="me-1.5 h-3 w-3 rtl:order-last" />
                  {canAfford ? 'Run Agent' : 'Not enough credits'}
                </Button>
              </div>

              {/* Card-level link for navigation — behind the button */}
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

      {/* Recent executions */}
      {recentExecutions.length > 0 && (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-medium text-foreground">
              Recent Runs
            </h2>
            <div className="space-y-3">
              {recentExecutions.map((exec) => {
                const agentDef = AGENTS.find((a) => a.type === exec.agent_type)
                return (
                  <div
                    key={exec.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors duration-150 hover:bg-muted"
                  >
                    {exec.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
                    )}
                    {exec.status === 'running' && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    )}
                    {exec.status === 'failed' && (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    {!['completed', 'running', 'failed'].includes(exec.status) && (
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {agentDef?.name ?? exec.agent_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exec.credits_cost} credits · {formatDistanceToNow(new Date(exec.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs capitalize">
                      {exec.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent launch modal */}
      {selectedAgent && (
        <AgentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          agentName={selectedAgent.name}
          agentSlug={agentTypeToSlug(selectedAgent.type) ?? selectedAgent.type.replace(/_/g, '-')}
          creditCost={selectedAgent.credits}
          totalCredits={totalCredits}
          onExecute={handleExecute}
          isLoading={isExecuting}
        />
      )}
    </div>
  )
}
