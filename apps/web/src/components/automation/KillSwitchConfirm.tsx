'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface KillSwitchConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

const CONFIRM_WORD = 'PAUSE'

export function KillSwitchConfirm({ open, onConfirm, onCancel }: KillSwitchConfirmProps) {
  const [value, setValue] = React.useState('')
  const isValid = value.trim() === CONFIRM_WORD

  React.useEffect(() => {
    if (!open) setValue('')
  }, [open])

  function handleConfirm() {
    if (!isValid) return
    onConfirm()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && isValid) handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50">
            <AlertTriangle className="size-5 text-[#EF4444]" aria-hidden="true" />
          </div>
          <DialogTitle className="text-base font-semibold text-gray-900">
            Pause all automation?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-gray-500">
            All scheduled agents will stop running until you re-enable automation. Queued runs
            will be cancelled and will not consume credits.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-2">
          <label
            htmlFor="kill-confirm-input"
            className="block text-xs font-medium text-gray-700"
          >
            Type{' '}
            <span className="font-mono font-semibold text-gray-900">{CONFIRM_WORD}</span>{' '}
            to confirm
          </label>
          <Input
            id="kill-confirm-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            aria-describedby="kill-confirm-desc"
            className={cn(
              'h-9 font-mono text-sm transition-colors duration-150',
              value.length > 0 && !isValid
                ? 'border-red-300 focus-visible:ring-red-400'
                : isValid
                  ? 'border-[#10B981] focus-visible:ring-[#10B981]'
                  : '',
            )}
          />
          <p id="kill-confirm-desc" className="sr-only">
            Type the word PAUSE in all caps to confirm pausing all automations.
          </p>
        </div>

        <DialogFooter className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isValid}
            onClick={handleConfirm}
            aria-label="Pause all automation — this will stop all scheduled agents"
            className={cn(
              'transition-all duration-150 active:scale-[0.98]',
              isValid
                ? 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-2'
                : 'cursor-not-allowed opacity-40',
            )}
          >
            Pause all automation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
