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
  ArrowRight,
  Zap,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { agentTypeToSlug } from '@/lib/agents/config'

// ─── Agent metadata ────────────────────────────────────────────────────────

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
    color: 'bg-[#FFF5F2] text-[#FF3C00]',
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
    color: 'bg-blue-50 text-blue-600',
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
    color: 'bg-amber-50 text-amber-600',
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
    color: 'bg-purple-50 text-purple-600',
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
    color: 'bg-pink-50 text-pink-600',
    prompts: [
      'Create a content calendar',
      'Write LinkedIn posts',
      'Plan authority-building strategy',
    ],
  },
  competitor_intelligence: {
    name: 'Competitor Research',
    description: 'Analyze competitor AI visibility',
    icon: Search,
    credits: 4,
    color: 'bg-[#FFF5F2] text-[#FF3C00]',
    prompts: [
      'Analyze my top 3 competitors',
      'Find their content strategy',
      'Compare visibility scores',
    ],
  },
  faq_agent: {
    name: 'Query Researcher',
    description: 'Discover customer AI search queries',
    icon: MessageSquare,
    credits: 2,
    color: 'bg-green-50 text-green-600',
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
    <div className="flex items-center gap-2 text-muted-foreground px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
          />
        ))}
      </div>
      <span className="text-xs">Agent is thinking...</span>
    </div>
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
  error?: boolean
}

interface AgentChatViewProps {
  agentType: string
  businessName: string
  businessId: string
  totalCredits: number
}

// ─── Component ────────────────────────────────────────────────────────────

export function AgentChatView({
  agentType,
  businessName,
  businessId: _businessId,
  totalCredits: initialCredits,
}: AgentChatViewProps) {
  const meta = AGENT_META[agentType]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [remainingCredits, setRemainingCredits] = useState(initialCredits)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
          },
        ])
      } else if (output.type === 'structured') {
        const formattedOutput = formatStructuredOutput(
          output.title,
          output.summary,
          output.data
        )
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            content: formattedOutput,
            outputType: 'structured',
            title: output.title,
            creditsCharged: data.credits_cost,
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Agent header */}
      <div className="bg-card border-b border-border p-4 flex items-center gap-4">
        <Link href="/dashboard/agents">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Back to agents"
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>

        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', meta.color)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-sans font-medium text-foreground truncate">
            {meta.name}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {meta.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Zap className="h-3 w-3 text-primary" />
            {meta.credits} credit{meta.credits !== 1 ? 's' : ''}
          </Badge>
          {isRunning && (
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              Running
            </Badge>
          )}
          {!isRunning && messages.some((m) => m.role === 'agent' && !m.error) && (
            <Badge className="bg-green-50 text-green-700 border-0 text-xs">
              Completed
            </Badge>
          )}
          <div className="flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 border border-border">
            <span className="text-xs text-muted-foreground">Balance:</span>
            <span className="text-xs font-semibold text-foreground">
              {remainingCredits}
            </span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl mb-4', meta.color)}>
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="font-sans font-medium text-xl text-foreground">
              {meta.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {meta.description}. Tell me what you need for {businessName} and
              I&apos;ll get to work.
            </p>
            {/* Quick prompts */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {meta.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt)
                    inputRef.current?.focus()
                  }}
                  className="rounded-full bg-muted text-foreground text-sm px-4 py-1.5 hover:bg-muted/80 transition-colors border border-border"
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
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'relative group text-sm',
                    msg.role === 'user'
                      ? [
                          'max-w-[75%] ms-auto',
                          'rounded-[16px] rounded-te-[4px]',
                          'bg-primary text-primary-foreground px-4 py-3',
                          'leading-relaxed',
                        ]
                      : msg.error
                        ? [
                            'max-w-[85%]',
                            'rounded-[16px] rounded-ts-[4px]',
                            'bg-red-50 border border-red-200 text-destructive px-4 py-3',
                            'leading-relaxed',
                          ]
                        : [
                            'max-w-[85%]',
                            'rounded-[16px] rounded-ts-[4px]',
                            'bg-muted/60 text-foreground px-4 py-3',
                            'border border-border/50',
                            'leading-relaxed',
                          ]
                  )}
                >
                  {/* Agent message header */}
                  {msg.role === 'agent' && !msg.error && (
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {meta.name}
                        </span>
                        {msg.title && (
                          <span className="text-xs text-muted-foreground">
                            — {msg.title}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => void handleCopy(msg.content, i)}
                        aria-label="Copy message"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedIndex === i ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Error message header */}
                  {msg.error && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3 text-destructive" />
                      <span className="text-xs font-semibold text-destructive">Error</span>
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    className={cn(
                      msg.role === 'agent' && !msg.error
                        ? 'prose prose-sm max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-code:text-xs'
                        : ''
                    )}
                  >
                    {msg.format === 'json-ld' ? (
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                        <code>{msg.content}</code>
                      </pre>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>

                  {/* Credits used footer */}
                  {msg.creditsCharged !== undefined && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 text-primary" />
                      {msg.creditsCharged} credits used
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isRunning && (
              <div className="flex justify-start">
                <div className="rounded-[16px] rounded-ts-[4px] bg-muted/60 border border-border/50">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-card border-t border-border p-4">
        {!canAfford && (
          <p className="mb-2 text-xs text-destructive text-center">
            Not enough credits. You need {meta.credits} credits to run this
            agent.
          </p>
        )}

        {/* Quick prompts (shown above input when conversation is in progress) */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 max-w-3xl mx-auto">
            {meta.prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt)
                  inputRef.current?.focus()
                }}
                className="rounded-full bg-muted text-foreground text-sm px-4 py-1.5 hover:bg-muted/80 transition-colors"
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
          className="flex gap-3 items-end max-w-3xl mx-auto"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${meta.name} anything... (Enter to send, Shift+Enter for new line)`}
            disabled={isRunning || !canAfford}
            rows={1}
            aria-label={`Message ${meta.name}`}
            className={cn(
              'input-enhanced',
              'flex-1 resize-none min-h-[44px] max-h-[120px]',
              'rounded-xl px-4 py-3',
              (isRunning || !canAfford) && 'opacity-50 cursor-not-allowed',
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isRunning || !canAfford}
            aria-label="Send message"
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex-shrink-0 hover:bg-[#e63600] hover:scale-105 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </form>
      </div>
    </div>
  )
}
