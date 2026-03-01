import { NextResponse } from 'next/server'
import { scanStartSchema } from '@/lib/scan/validation'
import { setScan, updateScan } from '@/lib/scan/store'
import { generateMockScanResults } from '@/lib/scan/mock-engine'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = scanStartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { website_url, business_name, sector, location } = parsed.data
    const scanId = crypto.randomUUID()

    // Store the scan as processing
    setScan(scanId, {
      scan_id: scanId,
      website_url,
      business_name,
      sector,
      location,
      status: 'processing',
      results: null,
      created_at: new Date().toISOString(),
    })

    // In mock mode: generate results after a simulated delay
    // Use setTimeout to simulate async processing (60-90s in prod, 3-5s in mock)
    const mockDelay = 3000 + Math.random() * 2000
    setTimeout(() => {
      const results = generateMockScanResults(scanId, business_name, sector)
      updateScan(scanId, {
        status: 'completed',
        results,
      })
    }, mockDelay)

    return NextResponse.json(
      {
        scan_id: scanId,
        status: 'processing',
        estimated_time_seconds: Math.round(mockDelay / 1000),
      },
      { status: 202 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
