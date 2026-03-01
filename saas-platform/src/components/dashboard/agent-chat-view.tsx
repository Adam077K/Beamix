'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const AGENT_META: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }>; credits: number; color: string; prompts: string[] }> = {
  content_writer: {
    name: 'Content Writer',
    description: 'Generate AI-optimized website content',
    icon: FileText,
    credits: 3,
    color: 'bg-cyan-100 text-cyan-700',
    prompts: ['Write a homepage hero section', 'Create an about page', 'Write product descriptions'],
  },
  blog_writer: {
    name: 'Blog Writer',
    description: 'Write AI-optimized blog posts',
    icon: BookOpen,
    credits: 5,
    color: 'bg-blue-100 text-blue-700',
    prompts: ['Write a how-to guide for my industry', 'Create a comparison article', 'Write an FAQ blog post'],
  },
  review_analyzer: {
    name: 'Review Analyzer',
    description: 'Analyze reviews and generate responses',
    icon: Star,
    credits: 2,
    color: 'bg-amber-100 text-amber-700',
    prompts: ['Analyze my Google reviews', 'Generate review response templates', 'Identify sentiment trends'],
  },
  schema_optimizer: {
    name: 'Schema Optimizer',
    description: 'Generate JSON-LD structured data',
    icon: Code2,
    credits: 2,
    color: 'bg-purple-100 text-purple-700',
    prompts: ['Generate LocalBusiness schema', 'Create FAQ schema markup', 'Build product schema'],
  },
  social_strategy: {
    name: 'Social Strategist',
    description: 'Build authority-building social strategy',
    icon: Share2,
    credits: 3,
    color: 'bg-pink-100 text-pink-700',
    prompts: ['Create a content calendar', 'Write LinkedIn posts', 'Plan authority-building strategy'],
  },
  competitor_research: {
    name: 'Competitor Research',
    description: 'Analyze competitor AI visibility',
    icon: Search,
    credits: 4,
    color: 'bg-orange-100 text-orange-700',
    prompts: ['Analyze my top 3 competitors', 'Find their content strategy', 'Compare visibility scores'],
  },
  query_researcher: {
    name: 'Query Researcher',
    description: 'Discover customer AI search queries',
    icon: MessageSquare,
    credits: 2,
    color: 'bg-green-100 text-green-700',
    prompts: ['Find popular queries in my industry', 'Discover local search patterns', 'Identify gap opportunities'],
  },
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
  totalCredits,
}: AgentChatViewProps) {
  const meta = AGENT_META[agentType]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([])
  const [isRunning, setIsRunning] = useState(false)

  if (!meta) return null

  const Icon = meta.icon
  const canAfford = totalCredits >= meta.credits

  async function handleSend() {
    if (!input.trim() || isRunning || !canAfford) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsRunning(true)

    // Phase 6 will wire this to the real agent execution API
    // For now, show a coming soon message after a brief delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setMessages((prev) => [
      ...prev,
      {
        role: 'agent',
        content: `Agent execution will be wired in Phase 6. Your request: "${userMessage}" for ${businessName} (business: ${businessId}) would use ${meta.credits} credits.`,
      },
    ])
    setIsRunning(false)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Agent header */}
      <div className="flex items-center gap-4 border-b border-[var(--color-card-border)] pb-4">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-[var(--color-text)]">
            {meta.name}
          </h1>
          <p className="text-xs text-[var(--color-muted)]">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-bg)] px-3 py-1.5 border border-[var(--color-card-border)]">
          <Zap className="h-3 w-3 text-[var(--color-accent-warm)]" />
          <span className="text-xs font-semibold">{meta.credits} credits per run</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${meta.color} mb-4`}>
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)]">
              {meta.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)] max-w-sm">
              {meta.description}. Tell me what you need and I&apos;ll get to work.
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
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-bg)] border border-[var(--color-card-border)] text-[var(--color-text)]'
                  }`}
                >
                  {msg.role === 'agent' && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs font-semibold">{meta.name}</span>
                    </div>
                  )}
                  {msg.content}
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
                    <span>{meta.name} is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-card-border)] pt-4">
        {!canAfford && (
          <p className="mb-2 text-xs text-red-500 text-center">
            Not enough credits. You need {meta.credits} credits to run this agent.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
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
