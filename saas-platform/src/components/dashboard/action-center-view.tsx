'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  BookOpen,
  Code2,
  MessageSquare,
  Search,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
  Zap,
  ChevronRight,
  Sparkles,
  Bot,
  TrendingUp,
  Info,
  CheckCheck,
  Clock,
  FileCode2,
  HelpCircle,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recommendation {
  id: string
  title: string
  description: string | null
  priority: string
  recommendation_type: string | null
  status: string
  suggested_agent: string | null
  credits_cost: number | null
  effort: string | null
  impact: string | null
  evidence: string | null
  created_at: string
}

interface RecentJob {
  id: string
  agent_type: string
  status: string
  created_at: string
  completed_at: string | null
}

export interface ActionCenterViewProps {
  recommendations: Recommendation[]
  recentJobs: RecentJob[]
  totalCredits: number
  usedCredits: number
  businessName: string
  industry: string | null
}

// ─── Agent config ─────────────────────────────────────────────────────────────

interface AgentConfig {
  type: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'content' | 'technical' | 'research'
  credits: number
  colorIcon: string
  colorBg: string
}

const AGENT_CONFIGS: AgentConfig[] = [
  {
    type: 'content_writer',
    name: 'Content Writer',
    description: 'Generate AI-optimized content for your website.',
    icon: FileText,
    category: 'content',
    credits: 1,
    colorIcon: 'text-[#FF3C00]',
    colorBg: 'bg-[#FF3C00]/10',
  },
  {
    type: 'seo_optimizer',
    name: 'SEO Optimizer',
    description: 'Optimize existing pages for AI search visibility.',
    icon: BookOpen,
    category: 'content',
    credits: 1,
    colorIcon: 'text-violet-600',
    colorBg: 'bg-violet-50',
  },
  {
    type: 'faq_agent',
    name: 'FAQ Agent',
    description: 'Generate FAQ content that AI engines love to cite.',
    icon: MessageSquare,
    category: 'content',
    credits: 0,
    colorIcon: 'text-sky-600',
    colorBg: 'bg-sky-50',
  },
  {
    type: 'schema_markup',
    name: 'Schema Markup',
    description: 'Generate JSON-LD structured data for your site.',
    icon: Code2,
    category: 'technical',
    credits: 0,
    colorIcon: 'text-emerald-600',
    colorBg: 'bg-emerald-50',
  },
  {
    type: 'llms_txt_generator',
    name: 'LLMS.txt Generator',
    description: 'Create an llms.txt file to guide AI crawlers.',
    icon: FileCode2,
    category: 'technical',
    credits: 0,
    colorIcon: 'text-amber-600',
    colorBg: 'bg-amber-50',
  },
  {
    type: 'competitor_intelligence',
    name: 'Competitor Intelligence',
    description: 'Analyze how competitors rank in AI search.',
    icon: Search,
    category: 'research',
    credits: 1,
    colorIcon: 'text-[#FF3C00]',
    colorBg: 'bg-[#FF3C00]/10',
  },
]

const AGENT_CATEGORY_LABELS: Record<string, string> = {
  content: 'Content',
  technical: 'Technical',
  research: 'Research',
}

// ─── Technical readiness items ────────────────────────────────────────────────

const READINESS_ITEMS = [
  {
    key: 'schema_markup',
    label: 'Schema Markup',
    description: 'JSON-LD structured data present on key pages.',
    icon: FileCode2,
    agentType: 'schema_markup',
  },
  {
    key: 'faq_page',
    label: 'FAQ Page',
    description: 'Dedicated FAQ page covering common customer questions.',
    icon: HelpCircle,
    agentType: 'faq_agent',
  },
  {
    key: 'content_quality',
    label: 'Content Quality',
    description: 'Website content is detailed, authoritative, and accurate.',
    icon: FileText,
    agentType: 'content_writer',
  },
  {
    key: 'llms_txt',
    label: 'LLMS.txt',
    description: 'llms.txt file present to guide AI crawlers.',
    icon: Globe,
    agentType: 'llms_txt_generator',
  },
]

// ─── Priority filter ──────────────────────────────────────────────────────────

type PriorityFilter = 'all' | 'high' | 'medium' | 'low'

const PRIORITY_TABS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPriorityBadgeClass(priority: string): string {
  const p = priority.toLowerCase()
  if (p === 'high' || p === 'critical') {
    return 'bg-red-50 text-red-600 border-red-200'
  }
  if (p === 'medium') {
    return 'bg-amber-50 text-amber-600 border-amber-200'
  }
  return 'bg-[#F6F7F9] text-[#6B7280] border-[#E5E7EB]'
}

function getAgentByType(type: string | null): AgentConfig | undefined {
  if (!type) return undefined
  return AGENT_CONFIGS.find((a) => a.type === type)
}

function getAgentDisplayName(type: string | null): string {
  if (!type) return 'AI Agent'
  const config = getAgentByType(type)
  if (config) return config.name
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function isReadinessItemComplete(
  recommendations: Recommendation[],
  key: string,
): boolean {
  // Derive readiness from recommendations: if there's a completed rec of that type, mark complete
  const mapped: Record<string, string[]> = {
    schema_markup: ['schema_markup', 'schema'],
    faq_page: ['faq', 'faq_agent'],
    content_quality: ['content', 'content_quality', 'content_writer'],
    llms_txt: ['llms_txt', 'llms.txt'],
  }
  const types = mapped[key] ?? [key]
  const matching = recommendations.filter((r) => {
    const t = (r.recommendation_type ?? '').toLowerCase()
    const a = (r.suggested_agent ?? '').toLowerCase()
    return types.some((x) => t.includes(x) || a.includes(x))
  })
  if (matching.length === 0) return false // no data yet — show as incomplete until scan confirms
  return matching.every((r) => r.status === 'completed' || r.status === 'done')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const isCompleted = rec.status === 'completed' || rec.status === 'done'
  const agentName = getAgentDisplayName(rec.suggested_agent)
  const agentConfig = getAgentByType(rec.suggested_agent)
  const AgentIcon = agentConfig?.icon ?? Bot

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-5 transition-all duration-150',
        isCompleted
          ? 'border-[#E5E7EB] opacity-75'
          : 'border-[#E5E7EB] hover:border-[#3370FF]/40 hover:shadow-[0_1px_4px_rgba(51,112,255,0.08)]',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Status circle */}
          <div className="mt-0.5 shrink-0">
            {isCompleted ? (
              <CheckCircle2
                className="h-5 w-5 text-[#10B981]"
                aria-label="Completed"
              />
            ) : (
              <Circle
                className="h-5 w-5 text-[#D1D5DB]"
                aria-label="Pending"
              />
            )}
          </div>

          <div className="min-w-0">
            <h3
              className={cn(
                'text-sm font-semibold leading-snug',
                isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#111827]',
              )}
            >
              {rec.title}
            </h3>
            {rec.description && (
              <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                {rec.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Confidence badge */}
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wide border',
              getPriorityBadgeClass(rec.priority),
            )}
          >
            {rec.priority.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Evidence line */}
      {rec.evidence && !isCompleted && (
        <div className="flex items-start gap-2 rounded-md bg-[#F6F7F9] px-3 py-2 mb-3">
          <Info
            className="h-3.5 w-3.5 text-[#6B7280] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-[11px] text-[#6B7280] leading-relaxed">{rec.evidence}</p>
        </div>
      )}

      {/* Completed proof */}
      {isCompleted && (
        <div className="flex items-center gap-2 rounded-md bg-[#F0FDF4] px-3 py-2 mb-3">
          <CheckCheck
            className="h-3.5 w-3.5 text-[#10B981] shrink-0"
            aria-hidden="true"
          />
          <p className="text-[11px] text-[#10B981] font-medium">Done</p>
        </div>
      )}

      {/* Footer row: impact + CTA */}
      {!isCompleted && (
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#F3F4F6]">
          <div className="flex items-center gap-3">
            {rec.impact && (
              <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                <span>{rec.impact}</span>
              </span>
            )}
            {rec.effort && (
              <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{rec.effort}</span>
              </span>
            )}
            {rec.credits_cost !== null && rec.credits_cost > 0 && (
              <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                <Zap className="h-3.5 w-3.5 text-[#FF3C00]" aria-hidden="true" />
                <span>{rec.credits_cost} credit{rec.credits_cost !== 1 ? 's' : ''}</span>
              </span>
            )}
          </div>

          {rec.suggested_agent && (
            <Button
              variant="dashboard-accent"
              size="sm"
              asChild
              aria-label={`Fix with ${agentName}`}
            >
              <Link href={`/dashboard/agents/${rec.suggested_agent}`}>
                <AgentIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Fix with {agentName}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActionCenterView({
  recommendations,
  recentJobs,
  totalCredits,
  usedCredits,
  businessName,
  industry,
}: ActionCenterViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')

  // ── Derived values ──────────────────────────────────────────────────────────

  const completedCount = useMemo(
    () =>
      recommendations.filter(
        (r) => r.status === 'completed' || r.status === 'done',
      ).length,
    [recommendations],
  )

  const totalCount = recommendations.length

  const progressPercent = useMemo(
    () => (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0),
    [completedCount, totalCount],
  )

  const filteredRecs = useMemo(() => {
    if (priorityFilter === 'all') return recommendations
    return recommendations.filter(
      (r) => r.priority.toLowerCase() === priorityFilter,
    )
  }, [recommendations, priorityFilter])

  const agentsByCategory = useMemo(() => {
    const grouped: Record<string, AgentConfig[]> = {}
    for (const agent of AGENT_CONFIGS) {
      if (!grouped[agent.category]) grouped[agent.category] = []
      grouped[agent.category].push(agent)
    }
    return grouped
  }, [])

  const readinessItems = useMemo(
    () =>
      READINESS_ITEMS.map((item) => ({
        ...item,
        isComplete: isReadinessItemComplete(recommendations, item.key),
      })),
    [recommendations],
  )

  const readinessComplete = useMemo(
    () => readinessItems.filter((i) => i.isComplete).length,
    [readinessItems],
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
          Action Center
        </h1>
        <p className="mt-0.5 text-sm text-[#6B7280]">
          {businessName
            ? `Everything ${businessName} needs to improve AI search visibility.`
            : 'Everything you need to improve AI search visibility.'}
          {industry && (
            <span className="ml-1 text-[#9CA3AF]">· {industry}</span>
          )}
        </p>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <Card className="animate-fade-up [animation-delay:60ms] py-5 gap-0">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#111827]">
                  {completedCount} of {totalCount} complete
                </span>
                <span className="text-xs text-[#6B7280] tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2 bg-[#F3F4F6] [&>div]:bg-[#3370FF]"
                aria-label={`${progressPercent}% of recommendations complete`}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF0FF]">
                <Zap className="h-4 w-4 text-[#3370FF]" aria-hidden="true" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-[#111827] tabular-nums">
                  {totalCredits} credits left
                </div>
                <div className="text-[#9CA3AF]">{usedCredits} used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recommendations section ─────────────────────────────────────────── */}
      <section aria-label="Recommendations" className="animate-fade-up [animation-delay:120ms]">

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-4 flex-wrap" role="tablist" aria-label="Filter recommendations by priority">
          {PRIORITY_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={priorityFilter === tab.value}
              onClick={() => setPriorityFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/60',
                priorityFilter === tab.value
                  ? 'bg-[#111827] text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
              )}
            >
              {tab.label}
              {tab.value === 'all' && totalCount > 0 && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                    priorityFilter === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280]',
                  )}
                >
                  {totalCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {filteredRecs.length === 0 ? (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-10 text-center">
            <CheckCircle2
              className="mx-auto h-10 w-10 text-[#D1D5DB] mb-3"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-[#111827]">
              {priorityFilter === 'all'
                ? 'No recommendations yet'
                : `No ${priorityFilter} priority recommendations`}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              {priorityFilter === 'all'
                ? 'Run a scan to generate personalized recommendations.'
                : 'Try changing the priority filter above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </section>

      {/* ── Technical Readiness ─────────────────────────────────────────────── */}
      <section aria-label="Technical Readiness" className="animate-fade-up [animation-delay:200ms]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-[#111827]">
                  Technical Readiness
                </CardTitle>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {readinessComplete} of {readinessItems.length} checks passing
                </p>
              </div>
              <div className="text-sm font-semibold text-[#111827] tabular-nums">
                {readinessItems.length > 0
                  ? `${Math.round((readinessComplete / readinessItems.length) * 100)}%`
                  : '—'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {readinessItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] p-4"
                  >
                    {/* Status icon */}
                    <div className="mt-0.5 shrink-0">
                      {item.isComplete ? (
                        <CheckCircle2
                          className="size-[18px] text-[#10B981]"
                          aria-label="Passing"
                        />
                      ) : (
                        <AlertCircle
                          className="size-[18px] text-[#F59E0B]"
                          aria-label="Needs attention"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon
                          className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0"
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            item.isComplete ? 'text-[#111827]' : 'text-[#6B7280]',
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {!item.isComplete && (
                      <Link
                        href={`/dashboard/agents/${item.agentType}`}
                        className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/60 rounded"
                        aria-label={`Fix ${item.label}`}
                      >
                        Fix
                        <ChevronRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Agents Grid ─────────────────────────────────────────────────────── */}
      <section aria-label="All Agents" className="animate-fade-up [animation-delay:280ms]">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#111827]">All Agents</h2>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Launch any agent to start improving your visibility.
          </p>
        </div>

        {(['content', 'technical', 'research'] as const).map((category) => {
          const agents = agentsByCategory[category] ?? []
          if (agents.length === 0) return null
          return (
            <div key={category} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  {AGENT_CATEGORY_LABELS[category]}
                </span>
                <div className="flex-1 h-px bg-[#F3F4F6]" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  const canAfford =
                    agent.credits === 0 || totalCredits >= agent.credits
                  const recentJob = recentJobs.find(
                    (j) => j.agent_type === agent.type,
                  )

                  return (
                    <div
                      key={agent.type}
                      className="relative flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 transition-all duration-150 hover:border-[#3370FF]/30 hover:shadow-[0_1px_4px_rgba(51,112,255,0.06)]"
                    >
                      {/* Icon + name row */}
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                            agent.colorBg,
                            agent.colorIcon,
                          )}
                        >
                          <Icon className="size-[18px]" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827] leading-none">
                            {agent.name}
                          </p>
                          {recentJob && (
                            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                              Last run{' '}
                              {new Date(recentJob.created_at).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' },
                              )}
                            </p>
                          )}
                        </div>
                        <div className="ml-auto shrink-0">
                          {agent.credits === 0 ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50"
                            >
                              <Sparkles
                                className="h-2.5 w-2.5 mr-0.5 text-emerald-500"
                                aria-hidden="true"
                              />
                              Free
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-[#6B7280] border-[#E5E7EB]"
                            >
                              <Zap
                                className="h-2.5 w-2.5 mr-0.5 text-[#FF3C00]"
                                aria-hidden="true"
                              />
                              {agent.credits} credit
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                        {agent.description}
                      </p>

                      {/* CTA */}
                      {canAfford ? (
                        <Button
                          variant="dashboard-accent"
                          size="sm"
                          asChild
                          className="w-full text-xs"
                          aria-label={`Launch ${agent.name}`}
                        >
                          <Link href={`/dashboard/agents/${agent.type}`}>
                            <Sparkles
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Launch Agent
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="dashboard-outline"
                          size="sm"
                          disabled
                          className="w-full text-xs cursor-not-allowed"
                          aria-label={`Not enough credits for ${agent.name}`}
                        >
                          Not enough credits
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      {/* ── "What happens next" card ────────────────────────────────────────── */}
      <div className="animate-fade-up [animation-delay:360ms]">
        <div className="rounded-lg border border-[#3370FF]/30 bg-[#F5F8FF] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3370FF]/10">
              <Bot className="h-5 w-5 text-[#3370FF]" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#111827] mb-1">
                What happens next?
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                Each agent produces ready-to-publish content or technical fixes
                tailored to your business. After running an agent, the output is
                saved to your Content Library and you can verify improvement in
                your next scan.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  {
                    step: '1',
                    text: 'Pick an agent from the list above',
                    icon: Zap,
                  },
                  {
                    step: '2',
                    text: 'Agent generates content or code',
                    icon: Sparkles,
                  },
                  {
                    step: '3',
                    text: 'Re-scan to see your score improve',
                    icon: TrendingUp,
                  },
                ].map(({ step, text, icon: StepIcon }) => (
                  <div
                    key={step}
                    className="flex items-start gap-2.5 rounded-md bg-white border border-[#E5E7EB] px-3 py-2.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3370FF] text-[10px] font-bold text-white">
                      {step}
                    </span>
                    <p className="text-xs text-[#374151] leading-snug">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionCenterView
