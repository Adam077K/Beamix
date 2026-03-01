import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'

const updateBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  website_url: z.string().url().optional().nullable(),
  industry: z.string().min(1).optional().nullable(),
  location: z.string().min(1).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  services: z.array(z.string().min(1).max(100)).max(20).optional(),
})

export async function PUT(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateBusinessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { name, website_url, industry, location, description, services } = parsed.data

  // Find the user's primary business
  const { data: business, error: findError } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  if (findError || !business) {
    return NextResponse.json(
      { error: 'Primary business not found' },
      { status: 404 }
    )
  }

  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      name,
      website_url: website_url ?? null,
      industry: industry ?? null,
      location: location ?? null,
      description: description ?? null,
      services: (services ?? []) as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', business.id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update business', details: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
