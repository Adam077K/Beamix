import { createServiceClient } from '@/lib/supabase/service'

export type NotificationInsert = {
  userId: string
  type: 'item_ready' | 'scan_complete' | 'budget_75' | 'budget_100' | 'competitor_alert' | 'payment_failed'
  title: string
  body?: string
  actionUrl?: string
  payload?: Record<string, unknown>
}

export async function insertNotification(n: NotificationInsert): Promise<void> {
  const supabase = createServiceClient() as any
  const { error } = await supabase.from('notifications').insert({
    user_id: n.userId,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    action_url: n.actionUrl ?? null,
    payload: n.payload ?? {},
  })
  if (error) console.error('[notifications.insert] failed', error)
}
