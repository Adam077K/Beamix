import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { AutomationStatus } from '@/lib/types/shared'
import { AutomationClient } from '@/components/automation/AutomationClient'
import { Button } from '@/components/ui/button'

const mockStatus: AutomationStatus = {
  globalKillSwitch: false,
  creditsUsedThisMonth: 28,
  creditsCapThisMonth: 90,
  creditsUsedPercent: 31,
  daysElapsed: 11,
  daysRemaining: 18,
  // Daily run counts last 14 days, oldest first
  dailyRunsLast14: [1, 0, 2, 1, 3, 2, 0, 1, 2, 3, 2, 1, 3, 4],
  contentFunnel: {
    draft: 5,
    in_review: 2,
    approved: 3,
    published: 1,
  },
  runHistoryRecent: [
    {
      agentType: 'content_optimizer',
      status: 'success',
      completedAt: new Date(Date.now() - 14 * 60_000).toISOString(),
    },
    {
      agentType: 'performance_tracker',
      status: 'success',
      completedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    },
    {
      agentType: 'faq_builder',
      status: 'skipped',
      completedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    },
    {
      agentType: 'freshness_agent',
      status: 'failed',
      completedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    },
    {
      agentType: 'competitor_intelligence',
      status: 'success',
      completedAt: new Date(Date.now() - 1.5 * 86_400_000).toISOString(),
    },
    {
      agentType: 'content_optimizer',
      status: 'success',
      completedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
    {
      agentType: 'performance_tracker',
      status: 'success',
      completedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
    {
      agentType: 'schema_optimizer',
      status: 'failed',
      completedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    },
    {
      agentType: 'blog_strategist',
      status: 'success',
      completedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
    {
      agentType: 'freshness_agent',
      status: 'success',
      completedAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    },
  ],
  schedules: [
    {
      id: 'a1',
      userId: 'u1',
      agentType: 'content_optimizer',
      actionLabel: 'Content Optimizer',
      cadence: 'weekly',
      nextRunAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      lastRunAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
      lastRunResult: {
        status: 'success',
        label: 'Content generated',
      },
      runHistory7: [true, true, null, true, true, true, true],
    },
    {
      id: 'a2',
      userId: 'u1',
      agentType: 'performance_tracker',
      actionLabel: 'Performance Tracker',
      cadence: 'weekly',
      nextRunAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      lastRunAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
      lastRunResult: {
        status: 'success',
        label: 'Report updated',
      },
      runHistory7: [true, true, true, null, true, true, true],
    },
    {
      id: 'a3',
      userId: 'u1',
      agentType: 'freshness_agent',
      actionLabel: 'Freshness Agent',
      cadence: 'biweekly',
      nextRunAt: new Date(Date.now() + 11 * 86_400_000).toISOString(),
      lastRunAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
      isPaused: true,
      createdAt: '2026-03-01T09:00:00Z',
      lastRunResult: {
        status: 'failed',
        label: 'Failed: LLM timeout',
      },
      runHistory7: [true, true, true, true, false, null, false],
    },
    {
      id: 'a4',
      userId: 'u1',
      agentType: 'faq_builder',
      actionLabel: 'FAQ Builder',
      cadence: 'monthly',
      nextRunAt: new Date(Date.now() + 19 * 86_400_000).toISOString(),
      lastRunAt: null,
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
      lastRunResult: null,
      runHistory7: [],
    },
  ],
}

export default function AutomationPage() {
  if (mockStatus.schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Zap size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">Auto-pilot is ready</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Schedules you configure will appear here. Accept a suggestion from your inbox to get
          started.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/home">View suggestions</Link>
        </Button>
      </div>
    )
  }

  return <AutomationClient status={mockStatus} />
}
