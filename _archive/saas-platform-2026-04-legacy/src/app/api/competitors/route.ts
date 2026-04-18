import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const addCompetitorSchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().min(1).max(500),
  business_id: z.string().uuid(),
})

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('competitors')
    .select('id, name, domain, source, created_at, business_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch competitors', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
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

  const parsed = addCompetitorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Verify the business belongs to the user
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', parsed.data.business_id)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    user_id: user.id,
    business_id: parsed.data.business_id,
    name: parsed.data.name,
    domain: parsed.data.domain,
    website_url: parsed.data.domain.startsWith('http') ? parsed.data.domain : `https://${parsed.data.domain}`,
    source: 'manual',
  }

  const { data: competitor, error: insertError } = await supabase
    .from('competitors')
    .insert(insertData)
    .select('id, name, domain, source, created_at, business_id')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to add competitor', details: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json(competitor, { status: 201 })
}
