'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

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
      setError('Enter a valid URL, e.g. rivalco.com')
      return
    }

    console.log('Add competitor:', parsed)
    setSubmitted(true)
    setTimeout(() => {
      setUrl('')
      setSubmitted(false)
      onOpenChange(false)
    }, 800)
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl bg-white shadow-lg border border-gray-200',
            'p-6',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200'
          )}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <Dialog.Title className="text-base font-semibold text-gray-900">
                Add competitor
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-gray-500">
                Track a competitor&apos;s AI search visibility alongside yours.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="competitor-url" className="text-sm font-medium text-gray-700">
                Website URL
              </Label>
              <Input
                id="competitor-url"
                type="url"
                placeholder="e.g. rivalco.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError(null)
                }}
                aria-describedby={error ? 'competitor-url-error' : undefined}
                aria-invalid={error ? 'true' : undefined}
                className={cn(
                  'transition-colors duration-150',
                  error && 'border-red-400 focus-visible:ring-red-400'
                )}
                autoFocus
              />
              {error && (
                <p id="competitor-url-error" className="text-xs text-red-500" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                size="sm"
                type="submit"
                disabled={submitted}
                className="min-w-[110px]"
              >
                {submitted ? 'Added!' : 'Add competitor'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
