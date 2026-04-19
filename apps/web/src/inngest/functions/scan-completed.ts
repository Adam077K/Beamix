import { inngest } from '../client'
import { createServiceClient } from '@/lib/supabase/service'
import { writeSuggestions } from '@/lib/suggestions/write'

export const scanCompleted = inngest.createFunction(
  { id: 'scan-completed' },
  { event: 'scan.completed' },
  async ({ event, step }) => {
    const { scanId, userId, businessId, score } = event.data as any

    await step.run('write-suggestions', async () => {
      const supabase = createServiceClient() as any
      const { data: scan } = await supabase.from('scans').select('*').eq('id', scanId).maybeSingle()
      if (!scan) return { skipped: 'no scan row' }
      try {
        return await writeSuggestions({ scan, businessId, userId })
      } catch (err: any) {
        console.error('[scan-completed] writeSuggestions failed', err)
        return { error: String(err?.message ?? err) }
      }
    })

    return { scanId, score }
  },
)
