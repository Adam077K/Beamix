import type { AutomationStatus } from '@/lib/types/shared'
import { AutomationClient } from '@/components/automation/AutomationClient'

const mockStatus: AutomationStatus = {
  globalKillSwitch: false,
  creditsUsedThisMonth: 61,
  creditsCapThisMonth: 90,
  creditsUsedPercent: 68,
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
      actionLabel: 'Track weekly rankings',
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
      lastRunAt: '2026-04-05T09:00:00Z',
      isPaused: true,
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'a4',
      userId: 'u1',
      agentType: 'faq_builder',
      actionLabel: 'Build FAQ for /pricing',
      cadence: 'monthly',
      nextRunAt: '2026-05-19T09:00:00Z',
      lastRunAt: null,
      isPaused: false,
      createdAt: '2026-03-01T09:00:00Z',
    },
  ],
}

export default function AutomationPage() {
  return <AutomationClient status={mockStatus} />
}
