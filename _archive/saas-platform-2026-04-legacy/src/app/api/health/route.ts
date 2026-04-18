import { NextResponse } from 'next/server'

export async function GET() {
  const required = ['OPENROUTER_SCAN_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    return NextResponse.json({ status: 'degraded', missing }, { status: 503 })
  }

  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
