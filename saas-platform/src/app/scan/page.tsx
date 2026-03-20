'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Mail, Building2, MapPin, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// --- Per-step schemas ---

const urlSchema = z.object({
  url: z.string().min(1, 'Website URL is required').transform((val) => {
    // Add https:// if no protocol
    if (!/^https?:\/\//i.test(val)) {
      return `https://${val}`
    }
    return val
  }).pipe(z.string().url('Please enter a valid URL')),
})

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
})

const businessNameSchema = z.object({
  business_name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name is too long'),
})

const locationSchema = z.object({
  location: z
    .string()
    .min(2, 'Please enter your location')
    .max(200, 'Location is too long'),
})

type UrlFormData = z.infer<typeof urlSchema>
type EmailFormData = z.infer<typeof emailSchema>
type BusinessNameFormData = z.infer<typeof businessNameSchema>
type LocationFormData = z.infer<typeof locationSchema>

// --- Helpers ---

function extractNameFromDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.replace('www.', '').split('.')
    if (parts.length > 0) {
      const name = parts[0]
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  } catch {
    // Invalid URL
  }
  return ''
}

// --- Animation variants ---

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}

// --- Progress dots ---

function ProgressDots({
  total,
  active,
}: {
  total: number
  active: number
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{ scale: i === active ? 1.25 : 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`rounded-full transition-colors duration-300 ${
            i === active
              ? 'h-2.5 w-2.5 bg-[#FF3C00]'
              : i < active
              ? 'h-2 w-2 bg-[#FF3C00]/40'
              : 'h-2 w-2 bg-black/15'
          }`}
        />
      ))}
    </div>
  )
}

// --- Wizard step type ---
// Steps: 'url' | 'email' | 'business_name' | 'location'
// When URL is pre-filled from searchParams, we skip the url step.

type WizardStep = 'url' | 'email' | 'business_name' | 'location'

const STEPS_WITH_URL: WizardStep[] = ['url', 'email', 'business_name', 'location']
const STEPS_WITHOUT_URL: WizardStep[] = ['email', 'business_name', 'location']

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ScanWizard />
    </Suspense>
  )
}

function ScanWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')

  // Wizard state
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [steps, setSteps] = useState<WizardStep[]>(STEPS_WITH_URL)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // React Hook Forms — one per step
  const urlForm = useForm<UrlFormData>({ resolver: zodResolver(urlSchema) })
  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) })
  const businessNameForm = useForm<BusinessNameFormData>({ resolver: zodResolver(businessNameSchema) })
  const locationForm = useForm<LocationFormData>({ resolver: zodResolver(locationSchema) })

  // Initialise on mount — read ?url= from searchParams (Framer passes this)
  useEffect(() => {
    const paramUrl = searchParams.get('url')
    if (paramUrl) {
      // Normalize bare domain → https://
      const normalised = /^https?:\/\//i.test(paramUrl) ? paramUrl : `https://${paramUrl}`
      setUrl(normalised)
      const extracted = extractNameFromDomain(normalised)
      if (extracted) setBusinessName(extracted)
      setSteps(STEPS_WITHOUT_URL)
      setStepIndex(0)
    } else {
      setSteps(STEPS_WITH_URL)
      setStepIndex(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount

  // Sync businessName into nameForm when it changes via URL extraction
  useEffect(() => {
    if (businessName) {
      businessNameForm.setValue('business_name', businessName)
    }
  }, [businessName, businessNameForm])

  const currentStep: WizardStep | null =
    stepIndex !== null ? (steps[stepIndex] ?? null) : null

  // Dot index: map stepIndex to visual dot position
  // When URL is pre-filled, steps = ['email','business_name','location'] → 3 dots
  // When URL is included, steps = ['url','email','business_name','location'] → 4 dots
  // But we always show 4 visible dots; if URL is skipped, we skip dot 0 visually.
  const totalDots = steps.length
  const activeDot = stepIndex ?? 0

  // Handlers

  function goBack() {
    setStepIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
  }

  function handleUrlSubmit(data: UrlFormData) {
    const normalised = /^https?:\/\//i.test(data.url) ? data.url : `https://${data.url}`
    setUrl(normalised)
    try { localStorage.setItem('beamix_pending_url', normalised) } catch { /* ignore */ }
    const extracted = extractNameFromDomain(normalised)
    if (extracted) setBusinessName(extracted)
    setStepIndex((prev) => (prev !== null ? prev + 1 : 1))
  }

  function handleEmailSubmit(data: EmailFormData) {
    setEmail(data.email)
    setStepIndex((prev) => (prev !== null ? prev + 1 : 1))
  }

  function handleBusinessNameSubmit(data: BusinessNameFormData) {
    setBusinessName(data.business_name)
    try { localStorage.setItem('beamix_onboarding_name', data.business_name) } catch { /* ignore */ }
    setStepIndex((prev) => (prev !== null ? prev + 1 : 1))
  }

  const handleLocationSubmit = useCallback(
    async (data: LocationFormData) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const res = await fetch('/api/scan/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            business_name: businessName,
            // sector is required by the API schema; default to 'general' since we no
            // longer collect industry in this wizard to keep the flow short.
            sector: 'general',
            location: data.location,
            ...(email ? { email } : {}),
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          setError(errorData.error ?? 'Something went wrong')
          return
        }

        const { scan_id } = await res.json()

        try {
          localStorage.setItem('beamix_last_scan_id', scan_id)
        } catch {
          // localStorage not available — ignore
        }

        router.push(`/scan/${scan_id}`)
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [url, businessName, email, router]
  )

  // Loading state while mount effect runs
  if (stepIndex === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#FF3C00]" />
      </div>
    )
  }

  // Display hostname badge
  let displayedUrl = ''
  try {
    if (url) displayedUrl = new URL(url).hostname.replace('www.', '')
  } catch {
    displayedUrl = url
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 font-sans">
      {/* Logo */}
      <div className="mb-10">
        <span className="font-bold text-2xl text-black">
          Beam<span className="text-[#FF3C00]">ix</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <ProgressDots total={totalDots} active={activeDot} />
          <p className="text-xs text-black/40">
            Step {activeDot + 1} of {totalDots}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* URL Step */}
          {currentStep === 'url' && (
            <motion.div
              key="step-url"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3C00]/10">
                  <Globe className="h-7 w-7 text-[#FF3C00]" />
                </div>
                <h1 className="text-2xl font-medium text-black">
                  What&apos;s your website URL?
                </h1>
                <p className="mt-2 text-sm text-black/50">
                  We&apos;ll check how AI engines see your business.
                </p>
              </div>

              <form onSubmit={urlForm.handleSubmit(handleUrlSubmit)} className="space-y-4">
                <Input
                  type="text"
                  placeholder="yourbusiness.com"
                  className="h-12 rounded-xl border-black/15 text-base placeholder:text-black/30 focus-visible:ring-[#FF3C00]"
                  {...urlForm.register('url')}
                />
                {urlForm.formState.errors.url && (
                  <p className="text-xs text-red-500">{urlForm.formState.errors.url.message}</p>
                )}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#FF3C00] text-white hover:bg-[#FF3C00]/90 text-base font-medium"
                >
                  Continue
                  <ArrowRight className="ms-1.5 h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          )}

          {/* Email Step */}
          {currentStep === 'email' && (
            <motion.div
              key="step-email"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3C00]/10">
                  <Mail className="h-7 w-7 text-[#FF3C00]" />
                </div>
                <h1 className="text-2xl font-medium text-black">
                  What&apos;s your email?
                </h1>
                <p className="mt-2 text-sm text-black/50">
                  We&apos;ll send your results there and make signup seamless.
                </p>
              </div>

              {displayedUrl && (
                <div className="mb-6 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF3C00]/10 px-3 py-1 text-xs font-medium text-[#FF3C00]">
                    <CheckCircle2 className="h-3 w-3" />
                    Scanning: {displayedUrl}
                  </span>
                </div>
              )}

              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  className="h-12 rounded-xl border-black/15 text-base placeholder:text-black/30 focus-visible:ring-[#FF3C00]"
                  {...emailForm.register('email')}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
                <div className="flex gap-3">
                  {stepIndex > 0 && (
                    <Button type="button" variant="outline" onClick={goBack} className="h-12 rounded-full border-black/15 text-black/60 hover:text-black">
                      Back
                    </Button>
                  )}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#FF3C00] text-white hover:bg-[#FF3C00]/90 text-base font-medium"
                >
                  Continue
                  <ArrowRight className="ms-1.5 h-4 w-4" />
                </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Business Name Step */}
          {currentStep === 'business_name' && (
            <motion.div
              key="step-business_name"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3C00]/10">
                  <Building2 className="h-7 w-7 text-[#FF3C00]" />
                </div>
                <h1 className="text-2xl font-medium text-black">
                  What&apos;s your business name?
                </h1>
                <p className="mt-2 text-sm text-black/50">
                  Exactly as customers would search for it.
                </p>
              </div>

              <form onSubmit={businessNameForm.handleSubmit(handleBusinessNameSubmit)} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Business Name"
                  defaultValue={businessName}
                  className="h-12 rounded-xl border-black/15 text-base placeholder:text-black/30 focus-visible:ring-[#FF3C00]"
                  {...businessNameForm.register('business_name')}
                />
                {businessNameForm.formState.errors.business_name && (
                  <p className="text-xs text-red-500">
                    {businessNameForm.formState.errors.business_name.message}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={goBack} className="h-12 rounded-full border-black/15 text-black/60 hover:text-black">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-[#FF3C00] text-white hover:bg-[#FF3C00]/90 text-base font-medium"
                  >
                    Continue
                    <ArrowRight className="ms-1.5 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Location Step */}
          {currentStep === 'location' && (
            <motion.div
              key="step-location"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3C00]/10">
                  <MapPin className="h-7 w-7 text-[#FF3C00]" />
                </div>
                <h1 className="text-2xl font-medium text-black">
                  Where are you located?
                </h1>
                <p className="mt-2 text-sm text-black/50">
                  AI searches are highly local — this shapes your results.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={locationForm.handleSubmit(handleLocationSubmit)} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Tel Aviv, Israel"
                  className="h-12 rounded-xl border-black/15 text-base placeholder:text-black/30 focus-visible:ring-[#FF3C00]"
                  {...locationForm.register('location')}
                />
                {locationForm.formState.errors.location && (
                  <p className="text-xs text-red-500">
                    {locationForm.formState.errors.location.message}
                  </p>
                )}

                {/* Global shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    locationForm.setValue('location', 'Global', { shouldValidate: true })
                  }}
                  className="w-full rounded-xl border border-black/10 py-2.5 text-sm text-black/50 transition-colors hover:border-black/20 hover:text-black/70"
                >
                  I serve customers globally
                </button>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={goBack} className="h-12 rounded-full border-black/15 text-black/60 hover:text-black">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-full bg-[#FF3C00] text-white hover:bg-[#FF3C00]/90 text-base font-medium disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        Starting scan...
                      </>
                    ) : (
                      <>
                        Scan my business
                        <ArrowRight className="ms-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="mt-4 text-center text-xs text-black/35">
                Free &bull; ~60 seconds &bull; No account needed
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
