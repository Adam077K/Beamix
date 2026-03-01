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
import { Loader2, Globe, Building2, MapPin, Layers } from 'lucide-react'

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
      website_url: '',
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
      router.push(`/scan/${scan_id}`)
    } catch {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <span className="font-display text-3xl font-bold text-[var(--color-text)]">
            Beam<span className="text-[var(--color-accent)]">ix</span>
          </span>
        </Link>
        <p className="mt-2 text-[var(--color-muted)]">
          Free AI visibility scan — see how AI engines talk about your business
        </p>
      </div>

      <Card
        className="w-full max-w-lg border-[var(--color-card-border)]"
        style={{
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Scan your business
          </CardTitle>
          <CardDescription>
            We&apos;ll check how ChatGPT, Gemini, Perplexity, and Claude
            see your business. Takes about 60 seconds.
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
              <label htmlFor="website_url" className="text-sm font-medium">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://yourbusiness.com"
                  className="pl-10"
                  {...register('website_url')}
                />
              </div>
              {errors.website_url && (
                <p className="text-xs text-red-500">
                  {errors.website_url.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="business_name" className="text-sm font-medium">
                Business name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
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
                <Layers className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
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
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
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
              className="w-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
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

            <p className="text-center text-xs text-[var(--color-muted)]">
              No credit card required. Results in about 60 seconds.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
