'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Building, Briefcase, MapPin, Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDUSTRIES } from '@/constants/industries'

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

const nameSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must be under 100 characters'),
})

const industrySchema = z.object({
  industry: z.string().min(1, 'Please select an industry'),
})

const locationSchema = z.object({
  location: z.string().min(2, 'Please enter your main market location'),
})

type UrlFormData = z.infer<typeof urlSchema>
type NameFormData = z.infer<typeof nameSchema>
type IndustryFormData = z.infer<typeof industrySchema>
type LocationFormData = z.infer<typeof locationSchema>

function extractNameFromDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.replace('www.', '').split('.')
    if (parts.length > 0) {
      const name = parts[0]
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  } catch {
    // Invalid URL, return empty
  }
  return ''
}

function DotIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: i === activeIndex ? 1.25 : 1,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`rounded-full transition-colors duration-300 ${
            i === activeIndex
              ? 'h-2.5 w-2.5 bg-primary'
              : i < activeIndex
              ? 'h-2 w-2 bg-primary/40'
              : 'h-2 w-2 bg-muted-foreground/25'
          }`}
        />
      ))}
    </div>
  )
}

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}

export function OnboardingFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<number | null>(null)
  const [url, setUrl] = useState('')
  const [scanId, setScanId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Runs ONCE on mount. searchParams is read from the closure at mount time —
    // using [] prevents this effect from re-running mid-flow and resetting the step.
    const rawPendingUrl = localStorage.getItem('beamix_pending_url')
    // Normalize URL — add https:// if the user typed a bare domain (e.g. "example.com")
    const pendingUrl = rawPendingUrl
      ? /^https?:\/\//i.test(rawPendingUrl)
        ? rawPendingUrl
        : `https://${rawPendingUrl}`
      : null
    const storedScanId = localStorage.getItem('beamix_last_scan_id')
    // Also check URL params — auth callback may pass scan_id as a query param
    const urlScanId = searchParams.get('scan_id')
    const pendingScanId = storedScanId || urlScanId

    // Restore any mid-flow progress saved by earlier steps
    const savedName = localStorage.getItem('beamix_onboarding_name') ?? ''
    const savedIndustry = localStorage.getItem('beamix_onboarding_industry') ?? ''
    const savedStep = parseInt(localStorage.getItem('beamix_onboarding_step') ?? '0', 10)

    if (pendingScanId) setScanId(pendingScanId)

    if (pendingUrl) {
      setUrl(pendingUrl)
      const extracted = extractNameFromDomain(pendingUrl)
      const nameToUse = savedName || extracted
      if (nameToUse) setBusinessName(nameToUse)
    } else if (savedName) {
      setBusinessName(savedName)
    }
    if (savedIndustry) setIndustry(savedIndustry)

    // Restore saved step if the user was mid-flow; otherwise derive from available data
    if (savedStep > 0 && (pendingUrl || pendingScanId)) {
      setStep(savedStep)
    } else if (pendingScanId || pendingUrl) {
      setStep(1)
    } else {
      setStep(savedStep > 0 ? savedStep : 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once — avoids resetting step mid-flow on re-renders

  const urlForm = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: '' },
  })

  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
  })

  const industryForm = useForm<IndustryFormData>({
    resolver: zodResolver(industrySchema),
  })

  const locationForm = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  })

  // Sync businessName into nameForm default when it changes
  useEffect(() => {
    if (businessName) {
      nameForm.setValue('business_name', businessName)
    }
  }, [businessName, nameForm])

  function handleUrlSubmit(data: UrlFormData) {
    setUrl(data.url)
    localStorage.setItem('beamix_pending_url', data.url)
    const extracted = extractNameFromDomain(data.url)
    if (extracted) setBusinessName(extracted)
    localStorage.setItem('beamix_onboarding_step', '1')
    setStep(1)
  }

  function handleNameSubmit(data: NameFormData) {
    setBusinessName(data.business_name)
    localStorage.setItem('beamix_onboarding_name', data.business_name)
    localStorage.setItem('beamix_onboarding_step', '2')
    setStep(2)
  }

  function handleIndustrySubmit(data: IndustryFormData) {
    setIndustry(data.industry)
    localStorage.setItem('beamix_onboarding_industry', data.industry)
    localStorage.setItem('beamix_onboarding_step', '3')
    setStep(3)
  }

  const handleLocationSubmit = useCallback(
    async (data: LocationFormData) => {
      setIsSubmitting(true)
      setError(null)

      // MED-2: validate all required fields before submitting
      if (!url) {
        setError('Missing website URL. Please go back and enter it.')
        setStep(0)
        setIsSubmitting(false)
        return
      }
      if (!industry) {
        setError('Missing industry. Please go back and select one.')
        setStep(2)
        setIsSubmitting(false)
        return
      }

      try {
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name: businessName,
            industry,
            location: data.location,
            url,
            // Omit scan_id entirely when null — z.string().optional() rejects null
            ...(scanId ? { scan_id: scanId } : {}),
          }),
        })

        if (!response.ok) {
          const body = await response.json()
          const msg = body.details
            ? `${body.error}: ${body.details}`
            : (body.error ?? 'Failed to complete onboarding')
          throw new Error(msg)
        }

        // Clean up all onboarding localStorage keys
        localStorage.removeItem('beamix_pending_url')
        localStorage.removeItem('beamix_last_scan_id')
        localStorage.removeItem('beamix_onboarding_name')
        localStorage.removeItem('beamix_onboarding_industry')
        localStorage.removeItem('beamix_onboarding_step')

        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsSubmitting(false)
      }
    },
    [businessName, industry, url, scanId, router]
  )

  // Compute which dot is active (steps 0 and 1 share dot 0)
  function getDotIndex(): number {
    if (step === null || step <= 1) return 0
    if (step === 2) return 1
    return 2
  }

  if (step === null) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  let displayedUrl = ''
  try {
    if (url) displayedUrl = new URL(url).hostname.replace('www.', '')
  } catch {
    displayedUrl = url
  }

  return (
    <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8 shadow-sm">
      {/* Step indicator */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <DotIndicator activeIndex={getDotIndex()} />
        <p className="text-xs text-muted-foreground">
          Step {getDotIndex() + 1} of 3
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — URL Input (only if no URL in localStorage) */}
        {step === 0 && (
          <motion.div
            key="step-0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-sans text-xl font-medium text-foreground">
                What&apos;s your business website?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll scan it across every major AI engine.
              </p>
            </div>

            <form onSubmit={urlForm.handleSubmit(handleUrlSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="https://yourbusiness.com"
                  {...urlForm.register('url')}
                />
                {urlForm.formState.errors.url && (
                  <p className="text-xs text-destructive">{urlForm.formState.errors.url.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
              >
                Continue
                <ArrowRight className="ms-1 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 1 — Business Name */}
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-sans text-xl font-medium text-foreground">
                What&apos;s the name of your business?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Exactly as customers search for it.
              </p>
            </div>

            {displayedUrl && (
              <div className="mb-4 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Globe className="h-3 w-3" />
                  We&apos;re scanning: {displayedUrl}
                </span>
              </div>
            )}

            <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Your Business Name"
                  defaultValue={businessName}
                  {...nameForm.register('business_name')}
                />
                {nameForm.formState.errors.business_name && (
                  <p className="text-xs text-destructive">{nameForm.formState.errors.business_name.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-none"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ms-1 h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2 — Industry */}
        {step === 2 && (
          <motion.div
            key="step-2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-sans text-xl font-medium text-foreground">
                What industry are you in?
              </h2>
            </div>

            <form
              onSubmit={industryForm.handleSubmit(handleIndustrySubmit)}
              className="space-y-4"
            >
              <Select
                onValueChange={(value) => {
                  setIndustry(value)
                  industryForm.setValue('industry', value, { shouldValidate: true })
                }}
                value={industry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {industryForm.formState.errors.industry && (
                <p className="text-xs text-destructive">{industryForm.formState.errors.industry.message}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-none"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ms-1 h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3 — Location */}
        {step === 3 && (
          <motion.div
            key="step-3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-sans text-xl font-medium text-foreground">
                Where is your main market?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                AI searches are highly local. This shapes every result.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={locationForm.handleSubmit(handleLocationSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Tel Aviv, Israel"
                  {...locationForm.register('location')}
                />
                {locationForm.formState.errors.location && (
                  <p className="text-xs text-destructive">{locationForm.formState.errors.location.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-none"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Start My Scan
                      <ArrowRight className="ms-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
