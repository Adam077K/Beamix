/**
 * /workspace/[jobId] — Server Component
 *
 * Fetches agent_job + related content_items for a given jobId.
 * If the job is incomplete, renders a polling skeleton.
 * On 404 / no data, renders a clean not-found state.
 */

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WorkspaceClient from '@/components/workspace/WorkspaceClient'
import WorkspaceSkeleton from '@/components/workspace/WorkspaceSkeleton'

interface WorkspacePageProps {
  params: Promise<{ jobId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { jobId } = await params

  const supabase = (await createClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch agent job + associated content item
  const { data: job, error } = await supabase
    .from('agent_jobs')
    .select(`
      id,
      agent_type,
      status,
      created_at,
      completed_at,
      credits_cost,
      qa_score,
      trigger_source,
      target_query_ids,
      user_id,
      content_items (
        id,
        title,
        content,
        content_body,
        estimated_impact,
        evidence,
        target_queries,
        user_edited_content,
        status,
        metadata
      )
    `)
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (error || !job) {
    notFound()
  }

  // If job is still running, show a polling skeleton
  if (job.status !== 'completed') {
    return <WorkspaceSkeleton jobId={jobId} status={job.status as string} />
  }

  const contentItem = Array.isArray(job.content_items)
    ? job.content_items[0]
    : job.content_items

  return (
    <WorkspaceClient
      jobId={jobId}
      job={{
        id: job.id,
        agentType: job.agent_type as string,
        status: job.status as string,
        createdAt: job.created_at as string,
        completedAt: job.completed_at as string | null,
        creditsCost: (job.credits_cost as number) ?? 1,
        qaScore: job.qa_score as number | null,
        triggerSource: job.trigger_source as string | null,
        targetQueryIds: (job.target_query_ids as string[]) ?? [],
      }}
      contentItem={
        contentItem
          ? {
              id: contentItem.id as string,
              title: contentItem.title as string,
              content: (contentItem.content_body ?? contentItem.content) as string,
              estimatedImpact: contentItem.estimated_impact as string | null,
              evidence: contentItem.evidence as Record<string, unknown> | null,
              targetQueries: (contentItem.target_queries as string[]) ?? [],
              userEditedContent: contentItem.user_edited_content as string | null,
              status: contentItem.status as string,
            }
          : null
      }
    />
  )
}
