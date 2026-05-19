import { inngest } from '../client'
import { createServiceClient } from '@/lib/supabase/service'

export const urlProbe = inngest.createFunction(
  { id: 'url-probe' },
  { event: 'archive/published' },
  async ({ event, step }) => {
    const { itemId, userId, url } = event.data as { itemId: string; userId: string; url: string }

    await step.sleep('wait-48h', '48h')

    const result = await step.run('probe', async () => {
      try {
        const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15_000) })
        const html = await res.text()
        const ok = res.status >= 200 && res.status < 400
        return { ok, status: res.status, length: html.length, snippet: html.slice(0, 500) }
      } catch (err: any) {
        return { ok: false, error: String(err?.message ?? err) }
      }
    })

    await step.run('write-probe', async () => {
      const supabase = createServiceClient() as any
      await supabase.from('url_probes').insert({
        user_id: userId,
        archive_item_id: itemId,
        url,
        status: result.ok ? 'verified' : 'unverified',
        probe_at: new Date().toISOString(),
        attempts: 1,
        result,
      })
      await supabase
        .from('content_items')
        .update({ verification_status: result.ok ? 'verified' : 'unverified' })
        .eq('id', itemId)
    })

    return { itemId, ok: result.ok }
  },
)
