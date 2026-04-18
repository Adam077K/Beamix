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
    .select('id, status, business_name, website_url, industry, location, overall_score, results_data, created_at')
    .eq('id', scan_id)
    .single()

  if (error || !scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status !== 'completed') {
    return NextResponse.json(
      {
        error: 'Scan not completed yet',
        status: scan.status,
      },
      { status: 202 }
    )
  }

  return NextResponse.json({
    scan_id: scan.id,
    business_name: scan.business_name,
    website_url: scan.website_url,
    sector: scan.industry,
    location: scan.location,
    status: scan.status,
    results: scan.results_data,
    created_at: scan.created_at,
  })
}
