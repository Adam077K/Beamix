'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import {
  FileText,
  BookOpen,
  Star,
  Code2,
  Share2,
  Search,
  MessageSquare,
  Bot,
  ArrowLeft,
  Send,
  Zap,
  Copy,
  Check,
  AlertCircle,
  BookmarkPlus,
  ChevronRight,
  Globe,
  Briefcase,
  Tag,
  Info,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { agentTypeToSlug } from '@/lib/agents/config'
import { formatDistanceToNow } from 'date-fns'

// ─── Agent metadata ────────────────────────────────────────────────────────

const AGENT_META: Record<
  string,
  {
    name: string
    description: string
    capabilities: string[]
    icon: React.ComponentType<{ className?: string }>
    credits: number
    color: string
    bgColor: string
    prompts: string[]
  }
> = {
  content_writer: {
    name: 'Content Writer',
    description: 'Generate AI-optimized website content',
    capabilities: [
      'Homepage and landing page copy',
      'Product and service descriptions',
      'About pages and company profiles',
      'Location-specific content',
    ],
    icon: FileText,
    credits: 1,
    color: 'text-[#FF3C00]',
    bgColor: 'bg-[#FFF5F2]',
    prompts: [
      'Write a homepage hero section',
      'Create an about page',
      'Write product descriptions',
    ],
  },
  blog_writer: {
    name: 'Blog Writer',
    description: 'Write AI-optimized blog posts',
    capabilities: [
      'How-to guides and tutorials',
      'Industry comparison articles',
      'FAQ and Q&A blog posts',
      'Thought leadership content',
    ],
    icon: BookOpen,
    credits: 1,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    prompts: [
      'Write a how-to guide for my industry',
      'Create a comparison article',
      'Write an FAQ blog post',
    ],
  },
  review_analyzer: {
    name: 'Review Analyzer',
    description: 'Analyze reviews and generate responses',
    capabilities: [
      'Google review analysis',
      'Sentiment trend identification',
      'Review response templates',
      'Customer feedback patterns',
    ],
    icon: Star,
    credits: 0,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    prompts: [
      'Analyze my Google reviews',
      'Generate review response templates',
      'Identify sentiment trends',
    ],
  },
  schema_optimizer: {
    name: 'Schema Optimizer',
    description: 'Generate JSON-LD structured data',
    capabilities: [
      'LocalBusiness schema markup',
      'FAQ schema generation',
      'Product and service schema',
      'Organization structured data',
    ],
    icon: Code2,
    credits: 0,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    prompts: [
      'Generate LocalBusiness schema',
      'Create FAQ schema markup',
      'Build product schema',
    ],
  },
  social_strategy: {
    name: 'Social Strategist',
    description: 'Build authority-building social strategy',
    capabilities: [
      'Content calendar planning',
      'LinkedIn post writing',
      'Authority-building strategy',
      'Platform-specific content',
    ],
    icon: Share2,
    credits: 1,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    prompts: [
      'Create a content calendar',
      'Write LinkedIn posts',
      'Plan authority-building strategy',
    ],
  },
  competitor_intelligence: {
    name: 'Competitor Intelligence',
    description: 'Analyze competitor AI visibility',
    capabilities: [
      'Competitor visibility analysis',
      'Content strategy comparison',
      'Share of voice measurement',
      'Gap opportunity identification',
    ],
    icon: Search,
    credits: 1,
    color: 'text-[#FF3C00]',
    bgColor: 'bg-[#FFF5F2]',
    prompts: [
      'Analyze my top 3 competitors',
      'Find their content strategy',
      'Compare visibility scores',
    ],
  },
  faq_agent: {
    name: 'FAQ Agent',
    description: 'Generate FAQ content that AI engines love to cite',
    capabilities: [
      'Industry query research',
      'Local search pattern discovery',
      'Gap opportunity identification',
      'AI-citation-optimized FAQs',
    ],
    icon: MessageSquare,
    credits: 0,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    prompts: [
      'Find popular queries in my industry',
      'Discover local search patterns',
      'Identify gap opportunities',
    ],
  },
}

// ─── Typing indicator ──────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF0FF] shrink-0">
        <Bot className="h-4 w-4 text-[#3370FF]" />
      </div>
      <div
        className="rounded-xl bg-white border border-[#E5E7EB] px-4 py-3 space-y-2"
        role="status"
        aria-label="Agent is thinking"
      >
        <div className="h-2 w-32 rounded-full bg-[#F3F4F6] animate-pulse" />
        <div className="h-2 w-48 rounded-full bg-[#F3F4F6] animate-pulse" />
        <div className="h-2 w-24 rounded-full bg-[#F3F4F6] animate-pulse" />
      </div>
    </div>
  )
}

// ─── Quality score badge ────────────────────────────────────────────────────

function QualityBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]'
      : score >= 50
        ? 'bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]'
        : 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', color)}>
      Quality {score}
    </span>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'agent'
  content: string
  outputType?: 'content' | 'structured'
  format?: string
  title?: string
  creditsCharged?: number
  qualityScore?: number
  error?: boolean
  timestamp: Date
}

export interface AgentChatViewProps {
  agentType: string
  agentId: string
  businessName: string
  businessUrl: string | null
  industry: string | null
  services: string[]
  existingJob: {
    id: string
    status: string
    agent_type: string
    created_at: string
  } | null
  /** @deprecated use agentId instead — kept for server page backwards compat */
  businessId?: string
  /** @deprecated kept for server page backwards compat */
  totalCredits?: number
}

// ─── Info Panel ────────────────────────────────────────────────────────────

interface InfoPanelProps {
  meta: (typeof AGENT_META)[string]
  businessName: string
  businessUrl: string | null
  industry: string | null
  services: string[]
  remainingCredits: number
  completedOutput: ChatMessage | null
  onSaveToLibrary: () => void
  isSaving: boolean
  isSaved: boolean
  onClose?: () => void
}

function InfoPanel({
  meta,
  businessName,
  businessUrl,
  industry,
  services,
  remainingCredits,
  completedOutput,
  onSaveToLibrary,
  isSaving,
  isSaved,
  onClose,
}: InfoPanelProps) {
  return (
    <aside className="flex flex-col gap-4 p-5 overflow-y-auto">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-[#111827]">Info Panel</span>
          <button
            onClick={onClose}
            aria-label="Close info panel"
            className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Business context */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          Business Context
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <Briefcase className="h-3.5 w-3.5 text-[#6B7280] mt-0.5 shrink-0" />
            <span className="text-[13px] text-[#111827] font-medium leading-tight">{businessName}</span>
          </div>
          {businessUrl && (
            <div className="flex items-start gap-2">
              <Globe className="h-3.5 w-3.5 text-[#6B7280] mt-0.5 shrink-0" />
              <span className="text-[12px] text-[#6B7280] truncate">{businessUrl}</span>
            </div>
          )}
          {industry && (
            <div className="flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-[#6B7280] mt-0.5 shrink-0" />
              <span className="text-[12px] text-[#6B7280]">{industry}</span>
            </div>
          )}
          {services.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-3.5 w-3.5 text-[#6B7280] mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#6B7280]"
                  >
                    {s}
                  </span>
                ))}
                {services.length > 4 && (
                  <span className="text-[11px] text-[#9CA3AF]">+{services.length - 4} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent capabilities */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          What this agent can do
        </h3>
        <ul className="space-y-2">
          {meta.capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-[#3370FF] mt-0.5 shrink-0" />
              <span className="text-[12px] text-[#6B7280]">{cap}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Credits cost */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#3370FF]" />
            <span className="text-[13px] font-medium text-[#111827]">Credits</span>
          </div>
          <span className="text-[13px] font-semibold text-[#111827]">
            {meta.credits === 0 ? 'Free' : `${meta.credits} per run`}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-[#9CA3AF]">Your balance</span>
          <span className="text-[12px] font-medium text-[#6B7280]">{remainingCredits} credits</span>
        </div>
      </div>

      {/* Save to content library */}
      {completedOutput && (
        <div className="rounded-xl border border-[#3370FF]/20 bg-[#EBF0FF]/30 p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] text-[#6B7280]">
            This output is ready to save to your Content Library.
          </p>
          <Button
            onClick={onSaveToLibrary}
            disabled={isSaving || isSaved}
            className="w-full gap-2 rounded-lg bg-[#111827] text-white text-[13px] font-medium hover:bg-[#1f2937] disabled:opacity-60"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : isSaving ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" />
                Save to Content Library
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export function AgentChatView({
  agentType,
  businessName,
  businessUrl,
  industry,
  services,
  totalCredits: initialCredits = 0,
}: AgentChatViewProps) {
  const meta = AGENT_META[agentType]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [remainingCredits, setRemainingCredits] = useState(initialCredits)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isRunning])

  // Find the last completed agent output for "Save to Library"
  const lastCompletedOutput =
    messages.filter((m) => m.role === 'agent' && !m.error).slice(-1)[0] ?? null

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <h2 className="text-[22px] font-semibold text-[#111827] tracking-[-0.02em]">Agent not found</h2>
        <p className="text-[13px] text-[#9CA3AF]">This agent type is not available or has been removed.</p>
        <Link href="/dashboard/agents" className="text-[13px] font-medium text-[#3370FF] hover:underline">
          ← Back to Agents
        </Link>
      </div>
    )
  }

  const Icon = meta.icon
  const canAfford = remainingCredits >= meta.credits

  const handleSend = useCallback(async () => {
    if (!input.trim() || isRunning || !canAfford) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ])
    setIsRunning(true)
    setIsSaved(false)

    try {
      const slug = agentTypeToSlug(agentType) ?? agentType.replace(/_/g, '-')
      const res = await fetch(`/api/agents/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userMessage,
          tone: 'professional',
          targetLength: 'medium',
          language: 'en',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: data.error ?? 'Something went wrong. Please try again.',
            error: true,
            timestamp: new Date(),
          },
        ])
        setIsRunning(false)
        return
      }

      setRemainingCredits((prev) => prev - (data.credits_cost ?? meta.credits))

      const output = data.output
      if (output.type === 'content') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: output.content,
            outputType: 'content',
            format: output.format,
            title: output.title,
            creditsCharged: data.credits_cost,
            qualityScore: data.quality_score,
            timestamp: new Date(),
          },
        ])
      } else if (output.type === 'structured') {
        const formattedOutput = formatStructuredOutput(output.title, output.summary, output.data)
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: formattedOutput,
            outputType: 'structured',
            title: output.title,
            creditsCharged: data.credits_cost,
            qualityScore: data.quality_score,
            timestamp: new Date(),
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: 'Network error. Please check your connection and try again.',
          error: true,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsRunning(false)
    }
  }, [input, isRunning, canAfford, agentType, meta.credits])

  function formatStructuredOutput(
    title: string,
    summary: string,
    data: Record<string, unknown>
  ): string {
    return `**${title}**\n\n${summary}\n\n---\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
  }

  const handleCopy = useCallback(async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      window.prompt('Copy this content:', content.slice(0, 500))
    }
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleSaveToLibrary = useCallback(async () => {
    if (!lastCompletedOutput) return
    setIsSaving(true)
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_type: agentType,
          content: lastCompletedOutput.content,
          title: lastCompletedOutput.title,
          output_format: lastCompletedOutput.format ?? 'plain_text',
        }),
      })
      setIsSaved(true)
    } catch {
      // fail silently — user can retry
    } finally {
      setIsSaving(false)
    }
  }, [lastCompletedOutput, agentType])

  const statusLabel = isRunning
    ? 'Running'
    : messages.some((m) => m.role === 'agent' && !m.error)
      ? 'Completed'
      : 'Ready'

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#F6F7F9]">

      {/* ── Main chat column ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Chat header */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-3.5 flex items-center gap-3">
          <Link href="/dashboard/agents">
            <button
              aria-label="Back to agents"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>

          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl shrink-0',
              meta.bgColor,
            )}
          >
            <Icon className={cn('h-4 w-4', meta.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[13px] font-semibold text-[#111827] truncate">{meta.name}</h1>
              <Badge
                variant="secondary"
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0 bg-[#F3F4F6] text-[#9CA3AF] border-0 hidden sm:inline-flex rounded-full"
              >
                AI Agent
              </Badge>
              {/* Status pill */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  isRunning
                    ? 'bg-[#EBF0FF] text-[#3370FF]'
                    : statusLabel === 'Completed'
                      ? 'bg-[#ECFDF5] text-[#10B981]'
                      : 'bg-[#F3F4F6] text-[#6B7280]',
                )}
                aria-live="polite"
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isRunning
                      ? 'bg-[#3370FF] animate-pulse'
                      : statusLabel === 'Completed'
                        ? 'bg-[#10B981]'
                        : 'bg-[#9CA3AF]',
                  )}
                />
                {statusLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{meta.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Credits balance */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#F3F4F6] px-3 py-1.5 border border-[#E5E7EB]">
              <Zap className="h-3 w-3 text-[#3370FF]" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-[#111827]">{remainingCredits}</span>
              <span className="text-[11px] text-[#9CA3AF]">credits</span>
            </div>
            {/* Info panel toggle (mobile) */}
            <button
              onClick={() => setShowInfoPanel((v) => !v)}
              aria-label="Toggle info panel"
              className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile info panel overlay */}
        {showInfoPanel && (
          <div className="lg:hidden border-b border-[#E5E7EB] bg-[#F6F7F9]">
            <InfoPanel
              meta={meta}
              businessName={businessName}
              businessUrl={businessUrl}
              industry={industry}
              services={services}
              remainingCredits={remainingCredits}
              completedOutput={lastCompletedOutput}
              onSaveToLibrary={handleSaveToLibrary}
              isSaving={isSaving}
              isSaved={isSaved}
              onClose={() => setShowInfoPanel(false)}
            />
          </div>
        )}

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty / welcome state */
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl mb-5',
                  meta.bgColor,
                )}
              >
                <Icon className={cn('h-8 w-8', meta.color)} />
              </div>
              <h2 className="text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
                {meta.name}
              </h2>
              <p className="mt-2 text-[13px] text-[#9CA3AF] max-w-sm leading-relaxed">
                {meta.description}. Tell me what you need for {businessName} and I&apos;ll get to work.
              </p>

              {/* Suggested prompts */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {meta.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt)
                      inputRef.current?.focus()
                    }}
                    className="rounded-full border border-[#E5E7EB] bg-white text-[#111827] text-[13px] px-4 py-2 hover:bg-[#F3F4F6] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {meta.credits > 0 && (
                <p className="mt-5 text-[11px] text-[#9CA3AF]">
                  This agent uses {meta.credits} credit{meta.credits !== 1 ? 's' : ''} per run
                </p>
              )}
            </div>
          ) : (
            <div className="py-6 space-y-5 max-w-[720px] mx-auto px-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {/* Agent avatar */}
                  {msg.role === 'agent' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF0FF] shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-[#3370FF]" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'group relative text-sm',
                      msg.role === 'user'
                        ? 'max-w-[88%] sm:max-w-[75%]'
                        : 'max-w-[88%] flex-1',
                    )}
                  >
                    {/* User bubble */}
                    {msg.role === 'user' && (
                      <div className="rounded-2xl rounded-tr-sm bg-[#F3F4F6] text-[#111827] px-4 py-3 leading-relaxed">
                        <div className="text-[13px] whitespace-pre-wrap">{msg.content}</div>
                        <div className="mt-1 text-[10px] text-[#9CA3AF] text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    )}

                    {/* Error bubble */}
                    {msg.role === 'agent' && msg.error && (
                      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-[#EF4444]" />
                          <span className="text-[12px] font-semibold text-[#EF4444]">
                            Hit a snag — please retry
                          </span>
                        </div>
                        <div className="text-[13px] text-[#6B7280] whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    )}

                    {/* Agent output card */}
                    {msg.role === 'agent' && !msg.error && (
                      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] px-4 py-2.5 bg-gray-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-[#6B7280]">{meta.name}</span>
                            {msg.title && (
                              <span className="text-[12px] text-[#9CA3AF]">— {msg.title}</span>
                            )}
                            {msg.qualityScore !== undefined && (
                              <QualityBadge score={msg.qualityScore} />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                            </span>
                            <button
                              onClick={() => void handleCopy(msg.content, i)}
                              aria-label="Copy message"
                              className="rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F3F4F6]"
                            >
                              {copiedIndex === i ? (
                                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-[#9CA3AF] hover:text-[#6B7280]" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="px-5 py-4">
                          {msg.format === 'json-ld' ? (
                            <pre className="overflow-x-auto rounded-xl bg-[#F3F4F6] p-4 font-mono text-[12px]">
                              <code>{msg.content}</code>
                            </pre>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-[#111827] prose-p:text-[#374151] prose-p:text-[13px] prose-code:text-[12px] prose-pre:bg-[#F3F4F6] prose-pre:rounded-xl prose-a:text-[#3370FF]">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Card footer */}
                        {msg.creditsCharged !== undefined && (
                          <div className="flex items-center gap-1.5 border-t border-[#F3F4F6] px-4 py-2.5 text-[11px] text-[#9CA3AF]">
                            <Zap className="h-3 w-3 text-[#3370FF]" />
                            {msg.creditsCharged} AI Run{msg.creditsCharged !== 1 ? 's' : ''} used
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isRunning && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-[#E5E7EB] px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Insufficient credits warning */}
          {!canAfford && meta.credits > 0 && (
            <p className="mb-2 text-[12px] text-[#EF4444] text-center">
              Not enough credits. You need {meta.credits} credit
              {meta.credits !== 1 ? 's' : ''} to run this agent.
            </p>
          )}

          {/* Quick prompts (shown when conversation started) */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 max-w-[720px] mx-auto">
              {meta.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt)
                    inputRef.current?.focus()
                  }}
                  className="rounded-full border border-[#E5E7EB] bg-[#F6F7F9] text-[#6B7280] text-[12px] px-3 py-1 hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSend()
            }}
            className="flex gap-2 items-end max-w-[720px] mx-auto"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${meta.name} anything… (Enter to send, Shift+Enter for new line)`}
              disabled={isRunning || !canAfford}
              rows={1}
              aria-label={`Message ${meta.name}`}
              className={cn(
                'flex-1 resize-none min-h-[44px] max-h-[120px] rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] text-[#111827] placeholder:text-[#9CA3AF]',
                'focus:outline-none focus:ring-2 focus:ring-[#3370FF]/10 focus:border-[#3370FF] transition-all',
                (isRunning || !canAfford) && 'opacity-50 cursor-not-allowed',
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isRunning || !canAfford}
              aria-label="Send message"
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#111827] text-white shrink-0 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Right info panel (desktop only) ──────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:shrink-0 border-l border-[#E5E7EB] bg-white overflow-y-auto">
        <InfoPanel
          meta={meta}
          businessName={businessName}
          businessUrl={businessUrl}
          industry={industry}
          services={services}
          remainingCredits={remainingCredits}
          completedOutput={lastCompletedOutput}
          onSaveToLibrary={handleSaveToLibrary}
          isSaving={isSaving}
          isSaved={isSaved}
        />
      </aside>
    </div>
  )
}
