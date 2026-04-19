import { inngest } from '@/inngest/client'
import { createServiceClient } from '@/lib/supabase/service'
import { callLLM } from '@/lib/llm/router'
import { extractBrands } from '@/lib/scan/brand-extractor'

// Engines per tier (from board decisions).
const ENGINES_BY_TIER: Record<string, Array<{ key: string; model: string; displayName: string }>> = {
  discover: [
    { key: 'chatgpt',    model: 'gpt-4o',          displayName: 'ChatGPT' },
    { key: 'gemini',     model: 'gemini-2-0-flash', displayName: 'Gemini' },
    { key: 'perplexity', model: 'sonar-online',     displayName: 'Perplexity' },
  ],
  build: [
    { key: 'chatgpt',     model: 'gpt-4o',             displayName: 'ChatGPT' },
    { key: 'gemini',      model: 'gemini-2-0-flash',    displayName: 'Gemini' },
    { key: 'perplexity',  model: 'sonar-online',        displayName: 'Perplexity' },
    { key: 'claude',      model: 'claude-sonnet-4-6',   displayName: 'Claude' },
    { key: 'ai_overviews', model: 'gemini-2-5-pro',    displayName: 'Google AI Overviews' },
    { key: 'grok',        model: 'gpt-4o',              displayName: 'Grok (proxy)' }, // TODO: real Grok when API exists
    { key: 'you',         model: 'gpt-4o-mini',         displayName: 'You.com' },
  ],
  scale: [], // same as build for now — extend with 2 more engines when available
}

export const scanRun = inngest.createFunction(
  { id: 'scan-run', retries: 2 },
  { event: 'scan/start.requested' as any },
  async ({ event, step }) => {
    const { scanId, userId, businessId } = event.data as { scanId: string; userId: string; businessId: string }

    // Step 1: Load business context + tier
    const business = await step.run('load-business', async () => {
      const supabase = createServiceClient() as any
      const [{ data: biz }, { data: sub }] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', businessId).maybeSingle(),
        supabase.from('subscriptions').select('plan_id').eq('user_id', userId).maybeSingle(),
      ])
      return {
        biz,
        tier: (sub?.plan_id ?? 'discover') as 'discover' | 'build' | 'scale',
      }
    })

    const engines = ENGINES_BY_TIER[business.tier] ?? ENGINES_BY_TIER['discover']!
    const knownBrands = [business.biz?.name ?? 'YourBrand', ...(business.biz?.competitor_names ?? [])]

    // Step 2: Load tracked queries (fallback to a seed set if none exist yet)
    const queries = await step.run('load-queries', async () => {
      const supabase = createServiceClient() as any
      const { data } = await supabase
        .from('tracked_queries')
        .select('id, scan_text, target_text')
        .eq('business_id', businessId)
        .limit(30)
      if (data && data.length > 0) return data as Array<{ id: string; scan_text: string; target_text: string }>
      // Fallback seed queries — in real path Query Mapper would have populated these.
      return [
        { id: 'seed1', scan_text: `what are the best ${business.biz?.industry ?? 'software'} tools`, target_text: 'best tool for use case' },
        { id: 'seed2', scan_text: `${business.biz?.name ?? 'this'} vs competitors`, target_text: 'comparison' },
        { id: 'seed3', scan_text: `${business.biz?.name ?? 'this'} pricing`, target_text: 'pricing' },
      ]
    })

    // Step 3: Scan each engine × each query, parallel per engine but sequential per query to stay under rate limits.
    const engineResults = await Promise.all(
      engines.map(engine =>
        step.run(`scan-${engine.key}`, async () => {
          const supabase = createServiceClient() as any
          let mentioned = 0
          for (const q of queries) {
            try {
              const res = await callLLM({
                model: engine.model as any,
                messages: [{ role: 'user', content: q.scan_text }],
                maxTokens: 800,
              })
              const text = (res as any).content ?? (res as any).text ?? ''
              const brands = extractBrands(text, knownBrands)
              const isMentioned = brands.some(b => b.toLowerCase() === (business.biz?.name ?? '').toLowerCase())
              if (isMentioned) mentioned++

              await supabase.from('scan_engine_results').insert({
                scan_id: scanId,
                business_id: businessId,
                engine: engine.key,
                tracked_query_id: q.id.startsWith('seed') ? null : q.id,
                is_mentioned: isMentioned,
                brands_mentioned: brands,
                rank_position: null,
                snippet: text.slice(0, 500),
              })
            } catch (err) {
              // Continue on per-query failure — log once.
              console.error(`[scan-${engine.key}] query failed`, q.scan_text, err)
            }
          }
          return { engine: engine.key, mentioned, total: queries.length }
        }),
      ),
    )

    // Step 4: Aggregate score + mark scan complete
    const totalAnswers = engineResults.reduce((sum, r) => sum + r.mentioned, 0)
    const totalQueries = engineResults.reduce((sum, r) => sum + r.total, 0)
    const score = totalQueries === 0 ? 0 : Math.round((totalAnswers / totalQueries) * 100)

    await step.run('mark-complete', async () => {
      const supabase = createServiceClient() as any
      await supabase.from('scans').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score,
      }).eq('id', scanId)
    })

    // Step 5: Fan out to rules engine
    await step.sendEvent('fan-out-suggestions', {
      name: 'scan.completed' as any,
      data: { scanId, userId, businessId, score, engineResults },
    })

    return { scanId, score, engineResults }
  },
)
