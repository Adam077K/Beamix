'use client'

import { useState, useRef, useEffect } from 'react'
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
  ArrowLeft,
  Zap,
  Send,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { agentTypeToSlug } from '@/lib/agents/config'

const AGENT_META: Record<
  string,
  {
    name: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    credits: number
    color: string
    prompts: string[]
  }
> = {
  content_writer: {
    name: 'Content Writer',
    description: 'Generate AI-optimized website content',
    icon: FileText,
    credits: 3,
    color: 'bg-cyan-100 text-cyan-700',
    prompts: [
      'Write a homepage hero section',
      'Create an about page',
      'Write product descriptions',
    ],
  },
  blog_writer: {
    name: 'Blog Writer',
    description: 'Write AI-optimized blog posts',
    icon: BookOpen,
    credits: 5,
    color: 'bg-blue-100 text-blue-700',
    prompts: [
      'Write a how-to guide for my industry',
      'Create a comparison article',
      'Write an FAQ blog post',
    ],
  },
  review_analyzer: {
    name: 'Review Analyzer',
    description: 'Analyze reviews and generate responses',
    icon: Star,
    credits: 2,
    color: 'bg-amber-100 text-amber-700',
    prompts: [
      'Analyze my Google reviews',
      'Generate review response templates',
      'Identify sentiment trends',
    ],
  },
  schema_optimizer: {
    name: 'Schema Optimizer',
    description: 'Generate JSON-LD structured data',
    icon: Code2,
    credits: 2,
    color: 'bg-purple-100 text-purple-700',
    prompts: [
      'Generate LocalBusiness schema',
      'Create FAQ schema markup',
      'Build product schema',
    ],
  },
  social_strategy: {
    name: 'Social Strategist',
    description: 'Build authority-building social strategy',
    icon: Share2,
    credits: 3,
    color: 'bg-pink-100 text-pink-700',
    prompts: [
      'Create a content calendar',
      'Write LinkedIn posts',
      'Plan authority-building strategy',
    ],
  },
  competitor_research: {
    name: 'Competitor Research',
    description: 'Analyze competitor AI visibility',
    icon: Search,
    credits: 4,
    color: 'bg-orange-100 text-orange-700',
    prompts: [
      'Analyze my top 3 competitors',
      'Find their content strategy',
      'Compare visibility scores',
    ],
  },
  query_researcher: {
    name: 'Query Researcher',
    description: 'Discover customer AI search queries',
    icon: MessageSquare,
    credits: 2,
    color: 'bg-green-100 text-green-700',
    prompts: [
      'Find popular queries in my industry',
      'Discover local search patterns',
      'Identify gap opportunities',
    ],
  },
}

interface ChatMessage {
  role: 'user' | 'agent'
  content: string
  outputType?: 'content' | 'structured'
  format?: string
  title?: string
  creditsCharged?: number
  error?: boolean
}

interface AgentChatViewProps {
  agentType: string
  businessName: string
  businessId: string
  totalCredits: number
}

export function AgentChatView({
  agentType,
  businessName,
  businessId,
  totalCredits: initialCredits,
}: AgentChatViewProps) {
  const meta = AGENT_META[agentType]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [remainingCredits, setRemainingCredits] = useState(initialCredits)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isRunning])

  if (!meta) return null

  const Icon = meta.icon
  const canAfford = remainingCredits >= meta.credits

  async function handleSend() {
    if (!input.trim() || isRunning || !canAfford) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsRunning(true)

    try {
      const res = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          prompt: userMessage,
          businessId,
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
          },
        ])
        setIsRunning(false)
        return
      }

      setRemainingCredits((prev) => prev - (data.creditsCharged ?? meta.credits))

      if (data.output.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: data.output.content,
            outputType: 'content',
            format: data.output.format,
            title: data.output.title,
            creditsCharged: data.creditsCharged,
          },
        ])
      } else if (data.output.summary) {
        const formattedOutput = formatStructuredOutput(
          data.output.title,
          data.output.summary,
          data.output.data
        )
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: formattedOutput,
            outputType: 'structured',
            title: data.output.title,
            creditsCharged: data.creditsCharged,
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
        },
      ])
    } finally {
      setIsRunning(false)
    }
  }

  function formatStructuredOutput(
    title: string,
    summary: string,
    data: Record<string, unknown>
  ): string {
    return `**${title}**\n\n${summary}\n\n---\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
  }

  async function handleCopy(content: string, index: number) {
    await navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Agent header */}
      <div className="flex items-center gap-4 border-b border-[var(--color-card-border)] pb-4">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-[var(--color-text)]">
            {meta.name}
          </h1>
          <p className="text-xs text-[var(--color-muted)]">
            {meta.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-bg)] px-3 py-1.5 border border-[var(--color-card-border)]">
            <Zap className="h-3 w-3 text-[var(--color-accent-warm)]" />
            <span className="text-xs font-semibold">
              {meta.credits} credits/run
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-bg)] px-3 py-1.5 border border-[var(--color-card-border)]">
            <span className="text-xs text-[var(--color-muted)]">Balance:</span>
            <span className="text-xs font-semibold text-[var(--color-text)]">
              {remainingCredits}
            </span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${meta.color} mb-4`}
            >
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)]">
              {meta.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)] max-w-sm">
              {meta.description}. Tell me what you need for {businessName} and
              I&apos;ll get to work.
            </p>
            {/* Suggested prompts */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {meta.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-[var(--color-card-border)] bg-white px-4 py-2 text-xs text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto px-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative group rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'max-w-[70%] bg-[var(--color-accent)] text-white'
                      : msg.error
                        ? 'max-w-[85%] bg-red-50 border border-red-200 text-red-700'
                        : 'max-w-[85%] bg-[var(--color-bg)] border border-[var(--color-card-border)] text-[var(--color-text)]'
                  }`}
                >
                  {msg.role === 'agent' && !msg.error && (
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-semibold">
                          {meta.name}
                        </span>
                        {msg.title && (
                          <span className="text-xs text-[var(--color-muted)]">
                            — {msg.title}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === i ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                        )}
                      </button>
                    </div>
                  )}
                  {msg.error && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs font-semibold">Error</span>
                    </div>
                  )}
                  <div
                    className={
                      msg.role === 'agent' && !msg.error
                        ? 'prose prose-sm max-w-none prose-headings:font-display prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-text)] prose-code:text-xs'
                        : ''
                    }
                  >
                    {msg.format === 'json-ld' ? (
                      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                        <code>{msg.content}</code>
                      </pre>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                  {msg.creditsCharged !== undefined && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-card-border)] flex items-center gap-1 text-xs text-[var(--color-muted)]">
                      <Zap className="h-3 w-3 text-[var(--color-accent-warm)]" />
                      {msg.creditsCharged} credits used
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isRunning && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-card-border)] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <div
                          key={dot}
                          className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse"
                          style={{ animationDelay: `${dot * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span>{meta.name} is working...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-card-border)] pt-4 px-4 pb-4">
        {!canAfford && (
          <p className="mb-2 text-xs text-red-500 text-center">
            Not enough credits. You need {meta.credits} credits to run this
            agent.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${meta.name} anything...`}
            disabled={isRunning || !canAfford}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isRunning || !canAfford}
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
