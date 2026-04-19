/**
 * POST /api/scan/start
 *
 * Starts a new scan for a given business. Inserts a `scans` row,
 * fires an Inngest event, and returns 202 with the scanId.
 *
 * Requires Cloudflare Turnstile verification in non-development environments.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/inngest/client'
import { ScanStartRequestSchema, ScanStartResponseSchema } from '@/lib/types/api'

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true // skip in dev
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? '',
        response: token,
      }),
    })
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    // 1. Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
        { status: 400 },
      )
    }

    // 2. Cloudflare Turnstile verification (skipped in development)
    const rawBody = body as Record<string, unknown>
    const { cfTurnstileResponse, ...restOfBody } = rawBody

    if (!(await verifyTurnstile(cfTurnstileResponse as string | undefined))) {
      return NextResponse.json(
        { error: { code: 'TURNSTILE_FAILED', message: 'Bot verification failed. Please try again.' } },
        { status: 403 },
      )
    }

    // 3. Validate structured fields
    const parsed = ScanStartRequestSchema.safeParse(restOfBody)
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

    // 4. Auth check
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

    // 5. Insert scan row
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

    // 6. Fire Inngest event
    await inngest.send({
      name: 'scan/start.requested' as any,
      data: { scanId, userId: user.id, businessId },
    })

    // 7. Return 202 + response envelope
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
