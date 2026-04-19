'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { X, Globe, CheckCircle2 } from 'lucide-react'

interface AddCompetitorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function parseUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const parsed = new URL(withProtocol)
    return parsed.hostname
  } catch {
    return null
  }
}

export function AddCompetitorModal({ open, onOpenChange }: AddCompetitorModalProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = parseUrl(url)
    if (!parsed) {
      setError('Enter a valid URL — e.g. rivalco.com')
      return
    }

    setSubmitted(true)
    setTimeout(() => {
      setUrl('')
      setSubmitted(false)
      onOpenChange(false)
    }, 900)
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      setUrl('')
      setError(null)
      setSubmitted(false)
    }
    onOpenChange(val)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] border border-gray-200/80',
            'p-6',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200'
          )}
          aria-describedby="add-competitor-desc"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <Globe size={16} className="text-gray-500" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-gray-900 leading-tight">
                  Track a competitor
                </Dialog.Title>
                <Dialog.Description
                  id="add-competitor-desc"
                  className="mt-0.5 text-xs text-gray-500"
                >
                  Compare their AI search visibility to yours.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
                aria-label="Close dialog"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="competitor-url"
                className="text-xs font-semibold text-gray-700"
              >
                Website URL
              </Label>
              <Input
                id="competitor-url"
                type="url"
                placeholder="rivalco.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError(null)
                }}
                aria-describedby={error ? 'competitor-url-error' : 'competitor-url-hint'}
                aria-invalid={error ? 'true' : undefined}
                className={cn(
                  'h-9 text-sm transition-colors duration-150',
                  error && 'border-red-400 focus-visible:ring-red-400'
                )}
                autoFocus
                disabled={submitted}
              />
              {error ? (
                <p
                  id="competitor-url-error"
                  className="text-xs text-red-500 leading-tight"
                  role="alert"
                >
                  {error}
                </p>
              ) : (
                <p
                  id="competitor-url-hint"
                  className="text-xs text-gray-400 leading-tight"
                >
                  Enter a domain — no need for https://
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={submitted}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                size="sm"
                type="submit"
                disabled={submitted}
                className={cn(
                  'h-9 min-w-[120px] text-xs transition-all duration-200',
                  submitted && 'bg-emerald-600 hover:bg-emerald-600'
                )}
              >
                {submitted ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} aria-hidden="true" />
                    Added
                  </span>
                ) : (
                  'Add competitor'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
