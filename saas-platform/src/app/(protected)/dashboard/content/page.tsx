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
      .from('content_generations')
      .select('id, content_type, title, content_format, word_count, quality_score, is_favorited, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('agent_outputs')
      .select('id, output_type, title, summary, is_favorited, created_at')
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
