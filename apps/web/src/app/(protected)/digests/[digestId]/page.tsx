import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { getDigestById } from '@/lib/demo/fixtures'
import { getStubDigestById } from '../_stub'
import { DigestDetailView } from '@/components/digests/DigestDetailView'
import { DigestDetailSkeleton } from '@/components/digests/DigestDetailSkeleton'

interface DigestDetailPageProps {
  params: Promise<{ digestId: string }>
}

/**
 * /digests/[digestId] — weekly digest detail view.
 *
 * Server Component. Mirrors the list page's auth re-read + isDemoUser gate.
 *
 * Resolution order:
 *  1. Demo user → getDigestById(id) from DEMO_DIGESTS
 *  2. Real user → getStubDigestById(id) from STUB_DIGESTS
 *  3. No match → notFound()
 *
 * Wave 2: replace stub lookup with `await fetchDigestById(user.id, id)`.
 */
export default async function DigestDetailPage({ params }: DigestDetailPageProps) {
  const { digestId } = await params

  // Lightweight auth re-read — middleware already verified auth.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Resolve digest from appropriate data source.
  const digest = isDemoUser(user?.email)
    ? getDigestById(digestId)
    : user
      ? getStubDigestById(digestId)
      : undefined

  if (!digest) {
    notFound()
  }

  return (
    <Suspense fallback={<DigestDetailSkeleton />}>
      <DigestDetailView digest={digest} />
    </Suspense>
  )
}
