import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Inbox } from 'lucide-react'
import InboxClient from '@/components/inbox/InboxClient'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { InboxItem } from '@/lib/types/shared'
import type { Database } from '@/lib/types/database.types'

type ContentItemRow = Database['public']['Tables']['content_items']['Row']

export default async function InboxPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: rows, error } = await supabase
    .from('content_items')
    .select(
      'id, agent_job_id, agent_type, title, content_body, status, created_at, updated_at, estimated_impact, evidence, trigger_reason, target_queries',
    )
    .eq('user_id', user.id)
    .in('status', ['draft', 'in_review', 'approved', 'rejected'])
    .order('created_at', { ascending: false })

  if (error) {
    // Non-fatal: render empty state with a fallback notice
    console.error('[inbox] failed to fetch content_items:', error.message)
  }

  // Map DB rows → InboxItem shape.
  // Key bridge: DB status 'in_review' → UI type 'awaiting_review'.
  const typedRows = (rows ?? []) as unknown as ContentItemRow[]
  const items: InboxItem[] = typedRows.map((row) => {
    const evidenceRaw =
      row.evidence && typeof row.evidence === 'object' && !Array.isArray(row.evidence)
        ? (row.evidence as Record<string, unknown>)
        : {}

    const targetQueries: string[] = Array.isArray(evidenceRaw['targetQueries'])
      ? (evidenceRaw['targetQueries'] as string[])
      : Array.isArray(row.target_queries)
        ? (row.target_queries as string[])
        : []

    const impactEstimate =
      typeof evidenceRaw['impactEstimate'] === 'string'
        ? evidenceRaw['impactEstimate']
        : (row.estimated_impact ?? 'Unknown')

    const triggerSource =
      typeof evidenceRaw['triggerSource'] === 'string'
        ? evidenceRaw['triggerSource']
        : (row.trigger_reason ?? 'Agent run')

    // Map DB status to UI status
    const uiStatus: InboxItem['status'] =
      row.status === 'in_review'
        ? 'awaiting_review'
        : (row.status as InboxItem['status'])

    return {
      id: row.id,
      userId: user.id,
      jobId: row.agent_job_id,
      agentType: row.agent_type as InboxItem['agentType'],
      actionLabel: row.title,
      title: row.title,
      previewMarkdown: (row.content_body ?? '').slice(0, 200),
      fullMarkdown: row.content_body ?? '',
      targetUrl: null,
      evidence: {
        triggerSource,
        targetQueries,
        citations: [],
        impactEstimate,
      },
      status: uiStatus,
      ymylFlagged: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })

  const unreadCount = items.filter((i) => i.status === 'awaiting_review').length

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Inbox size={48} className="mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">Your inbox is empty</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Agent outputs appear here for review. Accept a suggestion to run your first agent.
        </p>
        <Button asChild className="bg-[#3370FF] hover:bg-[#2860e8] text-white">
          <Link href="/home">View suggestions</Link>
        </Button>
      </div>
    )
  }

  return <InboxClient items={items} unreadCount={unreadCount} />
}
