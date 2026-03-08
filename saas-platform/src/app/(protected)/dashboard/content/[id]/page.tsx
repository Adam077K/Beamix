import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ContentEditorView } from '@/components/dashboard/content-editor-view'

export default async function ContentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: item, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !item) {
    notFound()
  }

  return <ContentEditorView item={item} />
}
