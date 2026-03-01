import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch execution
  const { data: execution, error: execErr } = await supabase
    .from('agent_executions')
    .select(
      'id, agent_type, status, credits_charged, output_data, error_message, started_at, completed_at, execution_duration_ms, created_at'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (execErr || !execution) {
    return NextResponse.json(
      { error: 'Execution not found' },
      { status: 404 }
    )
  }

  // If completed, fetch the output
  let content = null
  let structuredOutput = null

  if (execution.status === 'completed') {
    const [contentResult, outputResult] = await Promise.all([
      supabase
        .from('content_generations')
        .select(
          'id, content_type, title, generated_content, content_format, word_count, quality_score, llm_optimization_score, is_favorited, created_at'
        )
        .eq('execution_id', id),
      supabase
        .from('agent_outputs')
        .select(
          'id, output_type, title, structured_data, summary, is_favorited, created_at'
        )
        .eq('execution_id', id),
    ])

    if (contentResult.data && contentResult.data.length > 0) {
      content = contentResult.data[0]
    }
    if (outputResult.data && outputResult.data.length > 0) {
      structuredOutput = outputResult.data[0]
    }
  }

  return NextResponse.json({
    execution: {
      id: execution.id,
      agentType: execution.agent_type,
      status: execution.status,
      creditsCharged: execution.credits_charged,
      errorMessage: execution.error_message,
      startedAt: execution.started_at,
      completedAt: execution.completed_at,
      durationMs: execution.execution_duration_ms,
      createdAt: execution.created_at,
    },
    content,
    structuredOutput,
  })
}
