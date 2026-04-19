import { inngest } from '../client'
import { createServiceClient } from '@/lib/supabase/service'

export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 7 * * *' },
  async ({ step }) => {
    const sent = await step.run('send-digests', async () => {
      const supabase = createServiceClient() as any
      // TODO: wire Resend send once env is green
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, email, notification_preferences')
        .filter('notification_preferences->>daily_digest', 'eq', 'true')
      return { candidateCount: users?.length ?? 0, sentCount: 0 }
    })
    return sent
  },
)
