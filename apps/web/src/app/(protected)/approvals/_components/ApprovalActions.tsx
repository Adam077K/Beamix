'use client'

import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { approveApprovalItem, rejectApprovalItem } from '../_actions'
import type { ApprovalQueueItem } from '../_data'
import { PUBLISH_KINDS } from '../_logic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionResolved = { state: 'approved' | 'rejected' }

interface ApprovalActionsProps {
  itemId: string
  kind: ApprovalQueueItem['kind']
  /** Called when approve/reject completes successfully (in-session resolved state) */
  onResolved?: (resolved: ActionResolved) => void
}

type ActionState = 'idle' | 'approving' | 'rejecting'

interface ToastPayload {
  open: boolean
  message: string
  variant: 'success' | 'error'
}

// ---------------------------------------------------------------------------
// Spinner — accessible, reduced-motion respecting
// ---------------------------------------------------------------------------

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin motion-reduce:animate-none', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ApprovalActions — Client Component
// Calls Server Actions; disables both buttons during in-flight actions;
// shows toast feedback; calls onResolved for in-session muted state.
// ---------------------------------------------------------------------------

export function ApprovalActions({ itemId, kind, onResolved }: ApprovalActionsProps) {
  const [actionState, setActionState] = React.useState<ActionState>('idle')
  const [toast, setToast] = React.useState<ToastPayload>({
    open: false,
    message: '',
    variant: 'success',
  })
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = React.useCallback(
    (message: string, variant: 'success' | 'error') => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setToast({ open: true, message, variant })
      toastTimerRef.current = setTimeout(() => {
        setToast((t) => ({ ...t, open: false }))
      }, 4000)
    },
    [],
  )

  React.useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    },
    [],
  )

  const handleApprove = React.useCallback(async () => {
    setActionState('approving')
    try {
      const result = await approveApprovalItem(itemId)
      if (result.ok) {
        showToast('Item approved.', 'success')
        onResolved?.({ state: 'approved' })
      } else {
        setActionState('idle')
        showToast(result.error, 'error')
      }
    } catch {
      setActionState('idle')
      showToast('Something went wrong. Please try again.', 'error')
    }
  }, [itemId, showToast, onResolved])

  const handleReject = React.useCallback(async () => {
    setActionState('rejecting')
    try {
      const result = await rejectApprovalItem(itemId)
      if (result.ok) {
        showToast('Item rejected.', 'success')
        onResolved?.({ state: 'rejected' })
      } else {
        setActionState('idle')
        showToast(result.error, 'error')
      }
    } catch {
      setActionState('idle')
      showToast('Something went wrong. Please try again.', 'error')
    }
  }, [itemId, showToast, onResolved])

  const isBusy = actionState === 'approving' || actionState === 'rejecting'
  const approveLabel = PUBLISH_KINDS.includes(kind) ? 'Approve & publish' : 'Approve'

  return (
    <>
      {/* Action buttons — right-aligned flex gap-2 */}
      <div className="flex items-center justify-end gap-2 pt-1" role="group" aria-label="Approval actions">
        {/* Approve — hero blue/filled, the ONLY filled button on this surface */}
        <Button
          type="button"
          variant="default"
          size="default"
          onClick={handleApprove}
          disabled={isBusy}
          aria-label={`${approveLabel} this item`}
          aria-busy={actionState === 'approving'}
        >
          {actionState === 'approving' ? (
            <>
              <Spinner />
              <span>Approving…</span>
            </>
          ) : (
            approveLabel
          )}
        </Button>

        {/* Reject — neutral outline */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleReject}
          disabled={isBusy}
          aria-label="Reject this item"
          aria-busy={actionState === 'rejecting'}
        >
          {actionState === 'rejecting' ? (
            <>
              <Spinner />
              <span>Rejecting…</span>
            </>
          ) : (
            'Reject'
          )}
        </Button>
      </div>

      {/* Per-row toast — local to this component */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toast.open}
          onOpenChange={(open) => {
            if (!open) setToast((t) => ({ ...t, open: false }))
          }}
          className={cn(
            'pointer-events-auto w-full max-w-xs rounded-xl border bg-white shadow-lg p-4 flex flex-col gap-0.5',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
            'data-[state=open]:slide-in-from-bottom-2',
            'border-[#E5E7EB]',
          )}
        >
          <Toast.Title
            className={cn(
              'text-sm font-semibold',
              toast.variant === 'error' ? 'text-[#DC2626]' : 'text-[#0A0A0A]',
            )}
          >
            {toast.variant === 'error' ? 'Action failed' : 'Done'}
          </Toast.Title>
          <Toast.Description className="text-xs text-[#6B7280]">
            {toast.message}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[100vw] outline-none" />
      </Toast.Provider>
    </>
  )
}
