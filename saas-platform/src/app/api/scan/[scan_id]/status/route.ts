import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  const { scan_id } = await params

  if (!scan_id) {
    return NextResponse.json({ error: 'scan_id is required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: scan, error } = await supabase
    .from('free_scans')
    .select('scan_token, status, business_name, created_at')
    .eq('scan_token', scan_id)
    .single()

  if (error || !scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  return NextResponse.json({
    scan_id: scan.scan_token,
    status: scan.status,
    business_name: scan.business_name,
    created_at: scan.created_at,
  })
}
