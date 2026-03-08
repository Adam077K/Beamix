import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const scanFree = inngest.createFunction(
  { id: 'scan-free', name: 'Process Free Scan' },
  { event: 'scan/free.started' },
  async ({ event, step }) => {
    const { scanId, businessName, websiteUrl, industry, location, language } = event.data

    await step.run('update-status-processing', async () => {
      await supabase.from('free_scans').update({ status: 'processing' }).eq('scan_id', scanId)
    })

    // TODO: Replace with real engine queries
    const results = await step.run('run-scan-engines', async () => {
      const engines = ['chatgpt', 'gemini', 'perplexity']
      const mockResults = engines.map(engine => ({
        engine,
        is_mentioned: Math.random() > 0.4,
        rank_position: Math.floor(Math.random() * 5) + 1,
        sentiment_score: Math.floor(Math.random() * 40) + 50,
        response_text: `Mock ${engine} response for ${businessName}`,
        citations: [],
        competitors_found: ['Competitor A', 'Competitor B'],
      }))
      return mockResults
    })

    const visibilityScore = Math.round(results.reduce((sum, r) => sum + (r.is_mentioned ? r.sentiment_score : 0), 0) / results.length)

    await step.run('save-results', async () => {
      await supabase.from('free_scans').update({
        status: 'completed',
        results_data: { engines: results, visibility_score: visibilityScore, business_name: businessName, website_url: websiteUrl },
        completed_at: new Date().toISOString(),
      }).eq('scan_id', scanId)
    })

    return { scanId, visibilityScore }
  }
)
