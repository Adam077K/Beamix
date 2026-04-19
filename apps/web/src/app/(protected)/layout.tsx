import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/shell/DashboardShell'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = (await createClient()) as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = ((sub?.plan_id as string | undefined) ?? null) as
    | 'discover'
    | 'build'
    | 'scale'
    | null

  return (
    <DashboardShell user={{ email: user.email! }} plan={plan ?? undefined}>
      {children}
    </DashboardShell>
  )
}
