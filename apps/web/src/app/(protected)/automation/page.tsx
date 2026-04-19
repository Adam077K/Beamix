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
  schedules: [
    {
      id: 'a1',
      userId: 'u1',
      agentType: 'content_optimizer',
      actionLabel: 'Optimize your homepage',
      cadence: 'weekly',
      nextRunAt: '2026-04-26T09:00:00Z',
      lastRunAt: '2026-04-19T09:00:00Z',
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'a2',
      userId: 'u1',
      agentType: 'performance_tracker',
      actionLabel: 'Track weekly performance',
      cadence: 'weekly',
      nextRunAt: '2026-04-26T09:00:00Z',
      lastRunAt: '2026-04-19T09:00:00Z',
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'a3',
      userId: 'u1',
      agentType: 'freshness_agent',
      actionLabel: 'Refresh stale content',
      cadence: 'biweekly',
      nextRunAt: '2026-05-03T09:00:00Z',
      lastRunAt: '2026-04-19T09:00:00Z',
      isPaused: true,
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'a4',
      userId: 'u1',
      agentType: 'faq_builder',
      actionLabel: 'Generate FAQ pages',
      cadence: 'monthly',
      nextRunAt: '2026-05-19T09:00:00Z',
      lastRunAt: null,
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
    },
  ],
}

export default function AutomationPage() {
  if (mockStatus.schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Zap size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">Automation is ready</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Schedules you configure will appear here. Run your first agent from the Home page to get started.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/home">View suggestions</Link>
        </Button>
      </div>
    )
  }

  return <AutomationClient status={mockStatus} />
}
