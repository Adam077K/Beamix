'use client'

import Link from 'next/link'
import {
  FileText,
  BookOpen,
  Star,
  Code2,
  Share2,
  Search,
  MessageSquare,
  Bot,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

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
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    type: 'blog_writer',
    name: 'Blog Writer',
    description: 'Write SEO and AI-optimized blog posts that establish your expertise and improve citations.',
    icon: BookOpen,
    credits: 5,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'review_analyzer',
    name: 'Review Analyzer',
    description: 'Analyze your online reviews across platforms and generate response templates to boost sentiment.',
    icon: Star,
    credits: 2,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    type: 'schema_optimizer',
    name: 'Schema Optimizer',
    description: 'Generate JSON-LD structured data markup for your website to help AI engines understand your business.',
    icon: Code2,
    credits: 2,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    type: 'social_strategy',
    name: 'Social Strategist',
    description: 'Create a social media strategy designed to build the authority signals AI engines look for.',
    icon: Share2,
    credits: 3,
    color: 'bg-pink-100 text-pink-700',
  },
  {
    type: 'competitor_research',
    name: 'Competitor Research',
    description: 'Deep-dive analysis of how your competitors rank in AI search and what strategies they use.',
    icon: Search,
    credits: 4,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    type: 'query_researcher',
    name: 'Query Researcher',
    description: 'Discover what questions potential customers ask AI engines about your industry and location.',
    icon: MessageSquare,
    credits: 2,
    color: 'bg-green-100 text-green-700',
  },
]

interface AgentsViewProps {
  totalCredits: number
  recentExecutions: Array<{
    id: string
    agent_type: string
    status: string
    credits_charged: number
    created_at: string
    completed_at: string | null
  }>
}

export function AgentsView({ totalCredits, recentExecutions }: AgentsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            AI Agents
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Run AI-powered agents to improve your visibility
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] px-4 py-2 border border-[var(--color-card-border)]">
          <Zap className="h-4 w-4 text-[var(--color-accent-warm)]" />
          <span className="text-sm font-semibold text-[var(--color-text)]">{totalCredits}</span>
          <span className="text-xs text-[var(--color-muted)]">credits</span>
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => {
          const Icon = agent.icon
          const canAfford = totalCredits >= agent.credits
          return (
            <Card
              key={agent.type}
              className="border-[var(--color-card-border)] transition-shadow hover:shadow-md"
              style={{ borderRadius: 'var(--card-radius)' }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${agent.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-[var(--color-text)]">
                      {agent.name}
                    </h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {agent.credits} credits
                    </Badge>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[var(--color-muted)] line-clamp-2">
                  {agent.description}
                </p>
                <Link href={`/dashboard/agents/${agent.type}`} className="mt-4 block">
                  <Button
                    size="sm"
                    className={`w-full ${
                      canAfford
                        ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90'
                        : 'bg-[var(--color-card-border)] text-[var(--color-muted)] cursor-not-allowed'
                    }`}
                    disabled={!canAfford}
                  >
                    <Bot className="mr-1 h-3 w-3" />
                    {canAfford ? 'Run Agent' : 'Not enough credits'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent executions */}
      {recentExecutions.length > 0 && (
        <Card className="border-[var(--color-card-border)]" style={{ borderRadius: 'var(--card-radius)' }}>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-text)]">
              Recent Runs
            </h2>
            <div className="space-y-3">
              {recentExecutions.map((exec) => {
                const agentDef = AGENTS.find((a) => a.type === exec.agent_type)
                return (
                  <div key={exec.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-bg)] p-3">
                    {exec.status === 'completed' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                    {exec.status === 'running' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-accent)]" />}
                    {exec.status === 'failed' && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                    {exec.status === 'pending' && <Clock className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />}
                    {!['completed', 'running', 'failed', 'pending'].includes(exec.status) && (
                      <Clock className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {agentDef?.name ?? exec.agent_type}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {exec.credits_charged} credits · {formatDistanceToNow(new Date(exec.created_at), { addSuffix: true })}
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
    </div>
  )
}
