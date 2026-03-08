import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

export const agentExecute = inngest.createFunction(
  { id: 'agent-execute', name: 'Execute Agent Pipeline' },
  { event: 'agent/execute.requested' },
  async ({ event, step }) => {
    // Real LLM execution happens via the HTTP /api/agents/* routes.
    // This Inngest function is not yet wired to the real pipeline.
    // Throw immediately to make any accidental activation visible.
    throw new Error(
      '[agent-execute] This Inngest function is not yet implemented. ' +
      'Agent execution runs via the HTTP endpoint (src/lib/agents/execute.ts).'
    )

    // eslint-disable-next-line no-unreachable
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { jobId, agentType, businessId, userId, inputData, holdId } = event.data

    await step.run('mark-running', async () => {
      await supabase.from('agent_jobs').update({ status: 'running' }).eq('id', jobId)
    })

    try {
      // Dynamically load pipeline
      const pipeline = await step.run('run-pipeline', async () => {
        // TODO: Dynamic import based on agentType
        return {
          title: `${agentType} output for business`,
          content: `# Generated Content\n\nThis is mock output from the ${agentType} agent.`,
          contentType: 'article',
          format: 'markdown',
          wordCount: 200,
        }
      })

      await step.run('save-output', async () => {
        await supabase.from('agent_jobs').update({
          status: 'completed',
          output_data: pipeline,
          completed_at: new Date().toISOString(),
        }).eq('id', jobId)

        // Save to content library
        await supabase.from('content_items').insert({
          user_id: userId,
          business_id: businessId,
          agent_job_id: jobId,
          agent_type: agentType,
          title: pipeline.title,
          content: pipeline.content,
          content_format: pipeline.format,
          word_count: pipeline.wordCount,
        })
      })

      // Confirm credit hold — jobId is the hold reference
      if (holdId) {
        await step.run('confirm-credits', async () => {
          await supabase.rpc('confirm_credits', { p_job_id: holdId })
        })
      }

      return { jobId, status: 'completed' }
    } catch (error) {
      await step.run('handle-failure', async () => {
        await supabase.from('agent_jobs').update({
          status: 'failed',
          error_message: String(error),
        }).eq('id', jobId)

        // Release credit hold on failure — jobId is the hold reference
        if (holdId) {
          await supabase.rpc('release_credits', { p_job_id: holdId })
        }
      })
      throw error
    }
  }
)
