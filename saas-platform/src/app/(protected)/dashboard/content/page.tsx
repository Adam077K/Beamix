import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentLibraryView } from '@/components/dashboard/content-library-view'

export default async function ContentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [contentResult, outputsResult] = await Promise.all([
    supabase
      .from('content_items')
      .select('id, agent_type, title, content_format, word_count, quality_score, is_favorited, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('agent_jobs')
      .select('id, agent_type, status, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <ContentLibraryView
      content={contentResult.data ?? []}
      outputs={outputsResult.data ?? []}
    />
  )
}
