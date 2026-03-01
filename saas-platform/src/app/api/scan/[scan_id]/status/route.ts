import { NextResponse } from 'next/server'
import { getScan } from '@/lib/scan/store'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  const { scan_id } = await params

  if (!scan_id) {
    return NextResponse.json({ error: 'scan_id is required' }, { status: 400 })
  }

  const scan = getScan(scan_id)

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  return NextResponse.json({
    scan_id: scan.scan_id,
    status: scan.status,
    business_name: scan.business_name,
    created_at: scan.created_at,
  })
}
