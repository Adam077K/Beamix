import { inngest } from '../client'
import { createServiceClient } from '@/lib/supabase/service'

export const automationDispatcher = inngest.createFunction(
  { id: 'automation-dispatcher' },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const due = await step.run('fetch-due', async () => {
      const supabase = createServiceClient() as any
      const { data } = await supabase
        .from('automation_configs')
        .select('id, user_id, agent_type, cadence')
        .eq('is_paused', false)
        .lte('next_run_at', new Date().toISOString())
      return data ?? []
    })
    const fired = await Promise.all(
      due.map((cfg: any) =>
        step.sendEvent(`fire-${cfg.id}`, {
          name: 'agent.run.requested' as any,
          data: { jobId: crypto.randomUUID(), userId: cfg.user_id, businessId: null, agentType: cfg.agent_type, source: 'automation' },
        }),
      ),
    )
    return { fired: fired.length }
  },
)
