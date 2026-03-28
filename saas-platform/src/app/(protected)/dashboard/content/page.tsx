import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentLibraryView } from '@/components/dashboard/content-library-view'

export default async function ContentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('content_items')
    .select('id, title, content, agent_type, status, quality_score, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <ContentLibraryView items={items ?? []} />
  )
}
