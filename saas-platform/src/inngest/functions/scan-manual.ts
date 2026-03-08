import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const scanManual = inngest.createFunction(
  { id: 'scan-manual', name: 'Process Manual Scan' },
  { event: 'scan/manual.started' },
  async ({ event, step }) => {
    const { scanId, businessId, userId } = event.data

    await step.run('update-status', async () => {
      await supabase.from('scans').update({ status: 'processing' }).eq('id', scanId)
    })

    const business = await step.run('fetch-business', async () => {
      const { data } = await supabase.from('businesses').select('*').eq('id', businessId).single()
      return data
    })

    if (!business) throw new Error('Business not found')

    // TODO: Replace with real scan engine
    const engines = ['chatgpt', 'gemini', 'perplexity', 'claude']
    for (const engine of engines) {
      await step.run(`scan-${engine}`, async () => {
        await supabase.from('scan_engine_results').insert({
          scan_id: scanId,
          business_id: businessId,
          engine,
          is_mentioned: Math.random() > 0.3,
          rank_position: Math.floor(Math.random() * 5) + 1,
          sentiment_score: Math.floor(Math.random() * 40) + 50,
        })
      })
    }

    await step.run('complete-scan', async () => {
      await supabase.from('scans').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', scanId)
    })

    return { scanId }
  }
)
