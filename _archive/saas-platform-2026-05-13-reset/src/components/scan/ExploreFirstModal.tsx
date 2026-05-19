'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExploreFirstModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ExploreFirstModal({ open, onOpenChange }: ExploreFirstModalProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      setEmailError('Enter your email address')
      return
    }
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address')
      return
    }

    setEmailError(null)
    setSubmitting(true)

    // Brief delay for tactile feedback, then navigate
    setTimeout(() => {
      router.push(`/signup?preview=1&email=${encodeURIComponent(email)}`)
    }, 300)
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (emailError && isValidEmail(e.target.value)) setEmailError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[460px] rounded-2xl border border-gray-100 p-8 shadow-xl">
        <div className="flex flex-col gap-6">
          <div>
            <DialogTitle className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
              Get a preview first
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-gray-500 leading-relaxed">
              We&apos;ll send you a walkthrough of what Beamix does — no pressure, no demo call.
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="explore-email" className="text-sm font-medium text-[#0A0A0A]">
                Work email
              </label>
              <input
                id="explore-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (email && !isValidEmail(email)) {
                    setEmailError('Enter a valid email address')
                  }
                }}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'explore-email-error' : undefined}
                className={cn(
                  'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-[#0A0A0A] placeholder:text-gray-400 outline-none transition-all duration-150',
                  'focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF]',
                  emailError
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              />
              {emailError && (
                <p id="explore-email-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="size-3 shrink-0" />
                  {emailError}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="h-11 w-full rounded-lg bg-[#3370FF] text-white text-sm font-medium tracking-tight cursor-pointer transition-all duration-150 hover:bg-[#2558e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Opening preview…' : 'Send me the preview'}
            </motion.button>
          </form>

          <p className="text-xs text-gray-400 text-center">
            No spam. Unsubscribe any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
