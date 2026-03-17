'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scanStartSchema, type ScanStartInput } from '@/lib/scan/validation'
import { INDUSTRIES } from '@/constants/industries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Globe, Building2, MapPin, Layers, Shield, Clock, Sparkles } from 'lucide-react'

export default function ScanPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScanStartInput>({
    resolver: zodResolver(scanStartSchema),
    defaultValues: {
      url: '',
      business_name: '',
      sector: '',
      location: '',
    },
  })

  async function onSubmit(data: ScanStartInput) {
    setError(null)

    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error ?? 'Something went wrong')
        return
      }

      const { scan_id } = await res.json()

      // Save scan_id to localStorage so results can be retrieved later
      try {
        localStorage.setItem('beamix_last_scan_id', scan_id)
      } catch {
        // localStorage not available — ignore
      }

      router.push(`/scan/${scan_id}`)
    } catch {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/">
            <span className="font-sans font-medium text-xl font-bold text-foreground">
              Beam<span className="text-primary">ix</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="font-sans font-medium text-3xl font-bold text-foreground sm:text-4xl">
            Free AI Visibility Scan
          </h1>
          <p className="mt-3 max-w-md text-lg text-muted-foreground">
            See how ChatGPT, Gemini, Perplexity, and Claude talk about your business
          </p>
        </div>

        {/* Trust Pills */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            Results in ~60 seconds
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            Powered by 4 AI engines
          </span>
        </div>

        <Card
          className="w-full max-w-lg border-border shadow-sm"
        >
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Scan your business
            </CardTitle>
            <CardDescription>
              We&apos;ll check how AI search engines see your business and show
              you exactly where you stand vs. competitors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://yourbusiness.com"
                    className="pl-10"
                    {...register('url')}
                  />
                </div>
                {errors.url && (
                  <p className="text-xs text-red-500">
                    {errors.url.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="business_name" className="text-sm font-medium">
                  Business name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="business_name"
                    type="text"
                    placeholder="Your Business Name"
                    className="pl-10"
                    {...register('business_name')}
                  />
                </div>
                {errors.business_name && (
                  <p className="text-xs text-red-500">
                    {errors.business_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="sector" className="text-sm font-medium">
                  Industry
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select
                    onValueChange={(value) => setValue('sector', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.sector && (
                  <p className="text-xs text-red-500">{errors.sector.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Tel Aviv, Israel"
                    className="pl-10"
                    {...register('location')}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting scan...
                  </>
                ) : (
                  'Start free scan'
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                100% free. No signup needed. Your data stays private.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
