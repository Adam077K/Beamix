'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

interface ScanLauncherProps {
  businessId: string
  businessName: string
  websiteUrl: string
  industry: string
  location: string
  userId: string
}

export function ScanLauncher({
  businessId,
  businessName,
  websiteUrl,
  industry,
  location,
  userId,
}: ScanLauncherProps) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStartScan() {
    setIsScanning(true)
    setError(null)

    try {
      const res = await fetch('/api/scan/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to start scan' }))
        setError(data.error ?? 'Failed to start scan')
        setIsScanning(false)
        return
      }

      // Redirect to rankings — scan will process in background via Inngest
      router.push('/dashboard/rankings')
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run New Scan"
        description="Scan your business across AI search engines to check your visibility"
      />

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Business Name</p>
              <p className="text-sm font-medium text-foreground">{businessName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Website</p>
              <p className="text-sm font-medium text-foreground">{websiteUrl}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Industry</p>
              <p className="text-sm font-medium text-foreground">{industry}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <p className="text-sm font-medium text-foreground">{location || 'Global'}</p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleStartScan}
            disabled={isScanning}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting scan...
              </>
            ) : (
              <>
                <Radar className="mr-2 h-4 w-4" />
                Start AI Visibility Scan
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            The scan will query multiple AI search engines and analyze how they mention your business.
            Results typically appear within 30-60 seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
