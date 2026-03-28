'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  BookOpen,
  Code2,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Sparkles,
  FileCode2,
  HelpCircle,
  Globe,
  RefreshCw,
  TriangleAlert,
  ChevronRight,
} from 'lucide-react'
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
    name: 'Schema Optimizer',
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

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'done'

const PRIORITY_TABS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'done', label: 'Done' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPriorityDotClass(priority: string): string {
  const p = priority.toLowerCase()
  if (p === 'critical') return 'bg-[#EF4444]'
  if (p === 'high') return 'bg-[#F59E0B]'
  if (p === 'medium') return 'bg-[#F59E0B]'
  return 'bg-[#10B981]'
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
  if (matching.length === 0) return false
  return matching.every((r) => r.status === 'completed' || r.status === 'done')
}

// ─── Recommendation row (Stitch list style) ───────────────────────────────────

function RecommendationRow({ rec }: { rec: Recommendation }) {
  const isCompleted = rec.status === 'completed' || rec.status === 'done'
  const agentName = getAgentDisplayName(rec.suggested_agent)
  const dotClass = isCompleted ? 'bg-[#10B981]' : getPriorityDotClass(rec.priority)

  if (isCompleted) {
    return (
      <div className="flex items-start py-4 px-5 gap-4 bg-[#F6F7F9]/30">
        <div className={cn('w-1 h-1 rounded-full mt-2 flex-shrink-0', dotClass)} />
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-medium text-[#9CA3AF] leading-tight">
            {rec.title}
            {rec.impact && (
              <span className="font-normal">
                {' '}— Done · Score improved {rec.impact}
              </span>
            )}
          </h3>
          {rec.description && (
            <p className="text-[11px] text-[#9CA3AF] font-medium mt-1">
              {rec.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[#9CA3AF] text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            COMPLETED
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start py-4 px-5 gap-4 group hover:bg-[#F6F7F9] transition-colors">
      <div className={cn('w-1 h-1 rounded-full mt-2 flex-shrink-0', dotClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-[13px] font-medium text-[#111827] leading-tight">
            {rec.title}
          </h3>
          {rec.impact && (
            <span className="text-[11px] text-[#10B981] tabular-nums font-medium">
              Impact: {rec.impact}
            </span>
          )}
        </div>
        {rec.description && (
          <p className="text-[12px] text-[#6B7280] mb-1">{rec.description}</p>
        )}
        {rec.evidence && (
          <p className="text-[11px] text-[#9CA3AF] font-medium">{rec.evidence}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {rec.suggested_agent && (
          <Link
            href={`/dashboard/agents/${rec.suggested_agent}`}
            className="text-[#3370FF] text-[12px] font-medium hover:underline flex items-center"
          >
            {agentName}
            <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
          </Link>
        )}
        {rec.effort && (
          <span className="text-[11px] text-[#6B7280] tabular-nums">
            {rec.effort}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Agent card (compact Stitch-style) ────────────────────────────────────────

function AgentCard({
  agent,
  totalCredits,
  recentJob,
}: {
  agent: AgentConfig
  totalCredits: number
  recentJob?: RecentJob
}) {
  const Icon = agent.icon
  const canAfford = agent.credits === 0 || totalCredits >= agent.credits

  return (
    <div className="relative flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 hover:border-[#3370FF]/30 hover:shadow-[0_1px_4px_rgba(51,112,255,0.06)] transition-all duration-150">
      {/* Icon + name row */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            agent.colorBg,
          )}
        >
          <Icon className={cn('size-[18px]', agent.colorIcon)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#111827] leading-none">
            {agent.name}
          </p>
          {recentJob ? (
            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
              Last run{' '}
              {new Date(recentJob.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          ) : null}
        </div>
        <div className="shrink-0">
          {agent.credits === 0 ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#10B981] bg-[#F0FDF4] border border-[#D1FAE5] rounded px-1.5 py-0.5">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              Free
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#6B7280] bg-[#F6F7F9] border border-[#E5E7EB] rounded px-1.5 py-0.5">
              <Zap className="h-2.5 w-2.5 text-[#FF3C00]" aria-hidden="true" />
              {agent.credits} credit
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#6B7280] leading-relaxed line-clamp-2">
        {agent.description}
      </p>

      {/* CTA */}
      {canAfford ? (
        <Link
          href={`/dashboard/agents/${agent.type}`}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg bg-[#3370FF] text-white text-[12px] font-medium hover:bg-[#2860E8] transition-colors"
          aria-label={`Launch ${agent.name}`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Launch Agent
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] text-[12px] font-medium cursor-not-allowed"
          aria-label={`Not enough credits for ${agent.name}`}
        >
          Not enough credits
        </button>
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

  const criticalCount = useMemo(
    () =>
      recommendations.filter((r) => r.priority.toLowerCase() === 'critical').length,
    [recommendations],
  )

  const totalCount = recommendations.length

  const progressPercent = useMemo(
    () => (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0),
    [completedCount, totalCount],
  )

  const filteredRecs = useMemo(() => {
    if (priorityFilter === 'all') return recommendations
    if (priorityFilter === 'done') {
      return recommendations.filter(
        (r) => r.status === 'completed' || r.status === 'done',
      )
    }
    return recommendations.filter(
      (r) =>
        r.priority.toLowerCase() === priorityFilter &&
        r.status !== 'completed' &&
        r.status !== 'done',
    )
  }, [recommendations, priorityFilter])

  const hasCritical = useMemo(
    () =>
      filteredRecs.some(
        (r) =>
          r.priority.toLowerCase() === 'critical' &&
          r.status !== 'completed' &&
          r.status !== 'done',
      ),
    [filteredRecs],
  )

  const readinessItems = useMemo(
    () =>
      READINESS_ITEMS.map((item) => ({
        ...item,
        isComplete: isReadinessItemComplete(recommendations, item.key),
      })),
    [recommendations],
  )

  const agentsByCategory = useMemo(() => {
    const grouped: Record<string, AgentConfig[]> = {}
    for (const agent of AGENT_CONFIGS) {
      if (!grouped[agent.category]) grouped[agent.category] = []
      grouped[agent.category].push(agent)
    }
    return grouped
  }, [])

  const handleFilterChange = useCallback(
    (val: PriorityFilter) => setPriorityFilter(val),
    [],
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">

      {/* ── Page header + stepper ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] tracking-tight leading-none mb-2">
              Recommendations
            </h1>
            {/* Stepper */}
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase">
              <span className="text-[#9CA3AF]">1. Scan</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="text-[#3370FF]">2. Diagnose</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="text-[#9CA3AF]">3. Fix</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="text-[#9CA3AF]">4. Measure</span>
            </div>
          </div>
          <button
            className="text-[#3370FF] text-[12px] font-medium hover:opacity-80 transition-opacity flex items-center gap-1.5"
            aria-label="Refresh recommendations"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Stats + progress */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#6B7280] tabular-nums">
            {totalCount} actions · {criticalCount} critical · {completedCount} completed
            {businessName && businessName !== 'My Business' && (
              <span className="text-[#9CA3AF]"> · {businessName}</span>
            )}
            {industry && (
              <span className="text-[#9CA3AF]"> · {industry}</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-32 h-[3px] bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3370FF] rounded-full"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${progressPercent}% complete`}
              />
            </div>
            <span className="text-[11px] text-[#6B7280] font-medium tabular-nums">
              {progressPercent}% complete
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div
        className="flex gap-8 border-b border-[#E5E7EB] pb-px"
        role="tablist"
        aria-label="Filter recommendations by priority"
      >
        {PRIORITY_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={priorityFilter === tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={cn(
              'text-[13px] pb-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/60',
              priorityFilter === tab.value
                ? 'font-medium text-[#111827] border-b-2 border-[#111827]'
                : 'font-normal text-[#6B7280] hover:text-[#111827]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Recommendation list ─────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Critical alert banner */}
        {hasCritical && (priorityFilter === 'all' || priorityFilter === 'critical') && (
          <p className="text-[12px] text-[#EF4444] font-medium flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
            These issues affect your visibility in 3+ engines
          </p>
        )}

        {/* Recommendation rows in card */}
        {filteredRecs.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-10 text-center">
            <CheckCircle2
              className="mx-auto h-10 w-10 text-[#D1D5DB] mb-3"
              aria-hidden="true"
            />
            <p className="text-[13px] font-medium text-[#111827]">
              {priorityFilter === 'all'
                ? 'No recommendations yet'
                : `No ${priorityFilter} recommendations`}
            </p>
            <p className="mt-1 text-[12px] text-[#6B7280]">
              {priorityFilter === 'all'
                ? 'Run a scan to generate personalized recommendations.'
                : 'Try changing the filter above.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {filteredRecs.map((rec, i) => (
              <div key={rec.id}>
                <RecommendationRow rec={rec} />
                {i < filteredRecs.length - 1 && (
                  <div className="h-px bg-[#E5E7EB] mx-5" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* What happens next */}
        {totalCount > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-[#111827] max-w-lg">
              After you fix these issues, run another scan to measure your improvement.
              Your next scan is included in your plan.
            </p>
            <Link
              href="/dashboard/scan"
              className="text-[#3370FF] text-[13px] font-semibold hover:underline flex-shrink-0"
            >
              Schedule Scan →
            </Link>
          </div>
        )}
      </div>

      {/* ── Technical Readiness ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Technical Readiness
          </h2>
          <span className="text-[12px] text-[#6B7280] tabular-nums">
            {readinessItems.filter((i) => i.isComplete).length} of {readinessItems.length} passing
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {readinessItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4"
              >
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
                        'text-[13px] font-medium',
                        item.isComplete ? 'text-[#111827]' : 'text-[#6B7280]',
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#6B7280] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {!item.isComplete && (
                  <Link
                    href={`/dashboard/agents/${item.agentType}`}
                    className="shrink-0 flex items-center gap-0.5 text-[11px] font-semibold text-[#3370FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/60 rounded"
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
      </div>

      {/* ── Agents Hub ──────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">All Agents</h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              Launch any agent to start improving your visibility.
            </p>
          </div>
          {/* Credits pill */}
          <div className="flex items-center gap-2 text-[12px]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF0FF]">
              <Zap className="h-3.5 w-3.5 text-[#3370FF]" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-[#111827] tabular-nums">
                {totalCredits}
              </span>
              <span className="text-[#9CA3AF] ml-1">credits left</span>
            </div>
          </div>
        </div>

        {(['content', 'technical', 'research'] as const).map((category) => {
          const agents = agentsByCategory[category] ?? []
          if (agents.length === 0) return null
          const categoryLabels: Record<string, string> = {
            content: 'Content',
            technical: 'Technical',
            research: 'Research',
          }
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  {categoryLabels[category]}
                </span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => {
                  const recentJob = recentJobs.find(
                    (j) => j.agent_type === agent.type,
                  )
                  return (
                    <AgentCard
                      key={agent.type}
                      agent={agent}
                      totalCredits={totalCredits}
                      recentJob={recentJob}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <p className="text-[11px] text-[#6B7280] italic font-light pt-4">
        Recommendations update after each scan
      </p>
    </div>
  )
}

export default ActionCenterView
