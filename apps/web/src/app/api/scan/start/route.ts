/**
 * POST /api/scan/start
 *
 * Starts a new scan for a given business. Inserts a `scans` row,
 * fires an Inngest event, and returns 202 with the scanId.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/inngest/client'
import { ScanStartRequestSchema, ScanStartResponseSchema } from '@/lib/types/api'

export async function POST(request: Request) {
  try {
    // 1. Parse + validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 },
      )
    }

    const parsed = ScanStartRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body.',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      )
    }

    const { businessId, engines } = parsed.data

    // 2. Auth check
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 },
      )
    }

    // 3. Insert scan row
    const { data: scan, error: insertError } = await (supabase as any)
      .from('scans')
      .insert({
        user_id: user.id,
        business_id: businessId,
        status: 'running',
        started_at: new Date().toISOString(),
        engines: engines ?? null,
      })
      .select('id')
      .single()

    if (insertError || !scan) {
      console.error('[scan/start] DB insert error:', insertError)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to create scan record.' } },
        { status: 500 },
      )
    }

    const scanId: string = scan.id

    // 4. Fire Inngest event
    await inngest.send({
      name: 'scan/start.requested' as any,
      data: { scanId, userId: user.id, businessId },
    })

    // 5. Return 202 + response envelope
    const estimatedCompletionAt = new Date(Date.now() + 90_000).toISOString()
    const responsePayload = ScanStartResponseSchema.parse({
      scanId,
      status: 'queued',
      estimatedCompletionAt,
    })

    return NextResponse.json(responsePayload, { status: 202 })
  } catch (err) {
    console.error('[scan/start] Unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
