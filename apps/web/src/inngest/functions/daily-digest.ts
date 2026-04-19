import { inngest } from '../client'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/resend/send'
import { dailyDigestHtml, dailyDigestText } from '@/lib/resend/templates/daily-digest'
import type { DigestItem } from '@/lib/resend/templates/daily-digest'

const APP_BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.beamix.tech'

export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 7 * * *' },
  async ({ step }) => {
    const sent = await step.run('send-digests', async () => {
      const supabase = createServiceClient() as any

      // Fetch content_items created in the last 24h that are still in draft (unreviewed)
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: items, error: itemsError } = await supabase
        .from('content_items')
        .select('id, user_id, agent_type, created_at')
        .eq('status', 'draft')
        .gte('created_at', since)
        .order('user_id')

      if (itemsError) {
        console.error('[daily-digest] Failed to fetch content_items:', itemsError)
        return { candidateCount: 0, sentCount: 0 }
      }

      if (!items || items.length === 0) {
        return { candidateCount: 0, sentCount: 0 }
      }

      // Deduplicate by user_id
      const uniqueUserIds = [...new Set((items as Array<{ user_id: string }>).map((u) => u.user_id))]

      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      let sentCount = 0

      for (const userId of uniqueUserIds) {
        const userItems = (items as Array<{ id: string; user_id: string; agent_type: string; created_at: string }>).filter(
          (u) => u.user_id === userId,
        )

        // Fetch user profile — need email + first_name + notification preferences
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email, first_name, notification_preferences')
          .eq('user_id', userId)
          .maybeSingle()

        if (!profile?.email) continue

        // Respect notification preference — skip if user has opted out
        if (profile.notification_preferences?.daily_digest === false) continue

        const inboxUrl = `${APP_BASE_URL}/dashboard/inbox`

        const digestItems: DigestItem[] = userItems.map((item) => ({
          title: agentTypeToTitle(item.agent_type),
          actionLabel: 'Ready for your review',
          url: `${APP_BASE_URL}/dashboard/inbox?item=${item.id}`,
        }))

        try {
          const props = {
            firstName: profile.first_name ?? '',
            inboxUrl,
            items: digestItems,
            date,
          }
          await sendEmail({
            to: profile.email,
            subject: `Your Beamix digest — ${date}`,
            html: dailyDigestHtml(props),
            text: dailyDigestText(props),
          })
          sentCount++
        } catch (err) {
          console.error('[daily-digest] Failed to send to', userId, err)
        }
      }

      return { candidateCount: uniqueUserIds.length, sentCount }
    })
    return sent
  },
)

/**
 * Maps an agent_type identifier to a human-readable title for the digest email.
 * Agent internal names are never shown directly to users (brand convention).
 */
function agentTypeToTitle(agentType: string): string {
  const labels: Record<string, string> = {
    query_mapper: 'Query visibility map updated',
    content_optimizer: 'Homepage content optimized',
    freshness_agent: 'Content freshness improvement ready',
    faq_builder: 'FAQ section draft ready',
    schema_generator: 'Structured data markup ready',
    offsite_presence_builder: 'Offsite presence plan ready',
    review_presence_planner: 'Review strategy ready',
    entity_builder: 'Entity profile draft ready',
    authority_blog_strategist: 'Blog strategy draft ready',
    performance_tracker: 'Performance report ready',
    reddit_presence_planner: 'Reddit presence plan ready',
    video_seo_agent: 'Video SEO strategy ready',
  }
  return labels[agentType] ?? 'New item ready for review'
}
