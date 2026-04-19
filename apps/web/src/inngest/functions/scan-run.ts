/**
 * scan-run.ts — Inngest function for executing a GEO scan.
 *
 * Listens on `scan/start.requested`. Runs query mapping, engine scanning,
 * and completion write-back as durable steps.
 *
 * This is a STUB version — real engine calls will be wired once
 * business_id query mapping is fully implemented.
 */

import { inngest } from '@/inngest/client'

export const scanRun = inngest.createFunction(
  { id: 'scan-run', retries: 2 },
  { event: 'scan/start.requested' as any },
  async ({ event, step }) => {
    const { scanId, userId, businessId } = event.data as {
      scanId: string
      userId: string
      businessId: string
    }

    // Step 1: Query Mapper (stubbed — 50 queries would come from real call)
    const queries = await step.run('generate-queries', async () => ({
      count: 50,
      note: 'stub — real Query Mapper call goes here once business_id wiring lands',
    }))

    // Step 2: Scan each engine (stubbed — parallel via step.parallel in real version)
    const engines = await step.run('scan-engines', async () => ({
      chatgpt: { mentioned: 2, total: 50 },
      gemini: { mentioned: 3, total: 50 },
      perplexity: { mentioned: 1, total: 50 },
    }))

    // Step 3: Write back to scans table
    await step.run('mark-complete', async () => {
      const { createServiceClient } = await import('@/lib/supabase/service')
      const supabase = createServiceClient() as any
      const { error } = await supabase
        .from('scans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: 30, // mock score from mentioned ratio
        })
        .eq('id', scanId)

      if (error) {
        throw new Error(`Failed to mark scan ${scanId} complete: ${error.message}`)
      }
    })

    // Step 4: Fan out suggestions
    await step.sendEvent('fan-out-suggestions', {
      name: 'scan.completed',
      data: {
        scanId,
        userId,
        businessId,
        overallScore: 30,
        previousScore: null,
        completedAt: new Date().toISOString(),
      },
    })

    return { scanId, engines, queries }
  },
)
