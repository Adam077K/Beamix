'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Globe, ShieldCheck, FileCode2, FileText, HelpCircle, Bot } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { ScoreBadge, getScoreLevel } from '@/components/ui/score-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

interface CategoryScore {
  score: number
  description: string
}

interface AiReadinessData {
  id: string
  user_id: string
  overall_score: number
  crawlability: CategoryScore | null
  schema_markup: CategoryScore | null
  content_quality: CategoryScore | null
  faq_coverage: CategoryScore | null
  llms_txt: CategoryScore | null
  created_at: string
  [key: string]: unknown
}

interface AiReadinessViewProps {
  readiness: AiReadinessData | null
  websiteUrl: string | null
}

const CATEGORIES = [
  { key: 'crawlability', label: 'Crawlability', icon: Globe },
  { key: 'schema_markup', label: 'Schema Markup', icon: FileCode2 },
  { key: 'content_quality', label: 'Content Quality', icon: FileText },
  { key: 'faq_coverage', label: 'FAQ Coverage', icon: HelpCircle },
  { key: 'llms_txt', label: 'llms.txt', icon: Bot },
] as const

function getCategoryBorder(score: number): string {
  const { level } = getScoreLevel(score)
  if (level === 'excellent') return 'border-[#06B6D4]/30 bg-cyan-50/50 dark:bg-cyan-950/20'
  if (level === 'good') return 'border-[#10B981]/30 bg-green-50/50 dark:bg-green-950/20'
  if (level === 'fair') return 'border-[#F59E0B]/30 bg-amber-50/50 dark:bg-amber-950/20'
  return 'border-destructive/30 bg-red-50/50 dark:bg-red-950/20'
}

export function AiReadinessView({ readiness, websiteUrl }: AiReadinessViewProps) {
  const [isRunning, setIsRunning] = useState(false)

  async function handleRunAudit() {
    setIsRunning(true)
    try {
      const res = await fetch('/api/ai-readiness', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      }
    } catch {
      // Silently fail
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Readiness"
        description={websiteUrl ? `How prepared ${websiteUrl} is for AI search` : 'How prepared your website is for AI search'}
      >
        <Button
          onClick={handleRunAudit}
          disabled={isRunning}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2"
        >
          {isRunning ? 'Running audit...' : 'Run AI Readiness Audit'}
        </Button>
      </PageHeader>

      {!readiness ? (
        <Card className="bg-card rounded-[20px] border border-border shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={ShieldCheck}
              title="No AI readiness audit yet"
              description="Run an audit to see how ready your website is for AI search engines and where to improve."
              action={{
                label: 'Run Audit Now',
                onClick: handleRunAudit,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall score card */}
          <Card className="bg-card rounded-[20px] border border-border shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Overall AI Readiness Score</p>
              <ScoreBadge score={readiness.overall_score} size="lg" showLabel />
              <p className="text-xs text-muted-foreground mt-4">
                Last audited: {new Date(readiness.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ key, label, icon: CategoryIcon }) => {
              const category = readiness[key] as CategoryScore | null
              const score = category?.score ?? 0
              const description = category?.description ?? 'No data available'

              return (
                <Card
                  key={key}
                  className={cn(
                    'rounded-[20px] border shadow-sm transition-shadow duration-200 hover:shadow-md',
                    getCategoryBorder(score)
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground text-sm">{label}</h3>
                      </div>
                      <ScoreBadge score={score} size="sm" showLabel={false} />
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <Link
                      href="/dashboard/agents"
                      className={cn(
                        'mt-3 inline-block text-sm font-medium text-primary',
                        'hover:underline',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3C00] focus-visible:ring-offset-2 rounded'
                      )}
                    >
                      Improve &rarr;
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
