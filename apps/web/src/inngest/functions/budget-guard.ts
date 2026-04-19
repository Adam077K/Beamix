import { inngest } from '../client'
import { createServiceClient } from '@/lib/supabase/service'
import { insertNotification } from '@/lib/notifications/insert'
import { sendEmail } from '@/lib/resend/send'
import { budget75Html, budget75Text } from '@/lib/resend/templates/budget-75'
import { budget100Html, budget100Text } from '@/lib/resend/templates/budget-100'

export const budgetGuard = inngest.createFunction(
  { id: 'budget-guard' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    const hit75: string[] = []
    const hit100: string[] = []

    await step.run('scan-pools', async () => {
      const supabase = createServiceClient() as any
      const { data: pools } = await supabase
        .from('credit_pools')
        .select('user_id, used_amount, base_allocation, rollover_amount, topup_amount, alert_75_sent, alert_100_sent')

      const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.beamix.tech'

      for (const pool of pools ?? []) {
        const cap = (pool.base_allocation ?? 0) + (pool.rollover_amount ?? 0) + (pool.topup_amount ?? 0)
        if (cap === 0) continue
        const pct = pool.used_amount / cap

        // Fetch user profile for email personalization
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email, first_name')
          .eq('id', pool.user_id)
          .maybeSingle()
        const userEmail: string = profile?.email ?? ''
        const firstName: string = profile?.first_name ?? 'there'

        if (pct >= 1.0 && !pool.alert_100_sent) {
          await insertNotification({
            userId: pool.user_id,
            type: 'budget_100',
            title: "You've hit your monthly credit limit",
            body: 'All scheduled automation has been paused.',
            actionUrl: '/settings?tab=billing',
          })
          await supabase.from('automation_configs').update({ is_paused: true }).eq('user_id', pool.user_id)
          await supabase.from('credit_pools').update({ alert_100_sent: true }).eq('user_id', pool.user_id)

          // Send budget-100% email — failure must never throw
          if (userEmail) {
            try {
              await sendEmail({
                to: userEmail,
                subject: 'Agent credits exhausted — automation paused — Beamix',
                html: budget100Html({
                  firstName,
                  creditsTotal: cap,
                  automationUrl: `${baseUrl}/dashboard/automation`,
                  topupUrl: `${baseUrl}/settings?tab=billing`,
                }),
                text: budget100Text({
                  firstName,
                  creditsTotal: cap,
                  automationUrl: `${baseUrl}/dashboard/automation`,
                  topupUrl: `${baseUrl}/settings?tab=billing`,
                }),
              })
            } catch (err) {
              console.error('[budget-guard] Failed to send budget email:', err)
            }
          }

          hit100.push(pool.user_id)
        } else if (pct >= 0.75 && !pool.alert_75_sent) {
          await insertNotification({
            userId: pool.user_id,
            type: 'budget_75',
            title: '75% of your monthly credits used',
            body: `${pool.used_amount} of ${cap} runs consumed.`,
            actionUrl: '/settings?tab=billing',
          })
          await supabase.from('credit_pools').update({ alert_75_sent: true }).eq('user_id', pool.user_id)

          // Send budget-75% email — failure must never throw
          if (userEmail) {
            try {
              await sendEmail({
                to: userEmail,
                subject: '75% of your agent credits used — Beamix',
                html: budget75Html({
                  firstName,
                  creditsUsed: pool.used_amount,
                  creditsTotal: cap,
                  automationUrl: `${baseUrl}/dashboard/automation`,
                }),
                text: budget75Text({
                  firstName,
                  creditsUsed: pool.used_amount,
                  creditsTotal: cap,
                  automationUrl: `${baseUrl}/dashboard/automation`,
                }),
              })
            } catch (err) {
              console.error('[budget-guard] Failed to send budget email:', err)
            }
          }

          hit75.push(pool.user_id)
        }
      }
    })

    return { hit75: hit75.length, hit100: hit100.length }
  },
)
