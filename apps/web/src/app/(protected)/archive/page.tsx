import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArchiveClient } from '@/components/archive/ArchiveClient'

export default async function ArchivePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('content_items')
    .select('id, title, agent_type, status, published_url, published_at, updated_at, content_body')
    .eq('user_id', user.id)
    .in('status', ['approved', 'published', 'archived'])
    .order('updated_at', { ascending: false })

  return <ArchiveClient items={items ?? []} />
}
