'use client'

import { useToast } from '@/hooks/use-toast'
import * as Toast from '@radix-ui/react-toast'

interface ApprovalActionsProps {
  itemId: string
}

/**
 * Approve / Reject buttons for a single approval row.
 * Wave 2 will wire these to real server actions.
 */
export function ApprovalActions({ itemId: _itemId }: ApprovalActionsProps) {
  const { toast, state, dismiss } = useToast()

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toast({ title: 'Wave 2 will wire this', description: 'Approval action coming soon.' })}
          className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-white bg-[#3370FF] hover:bg-[#2558D4] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          aria-label="Approve this item"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => toast({ title: 'Wave 2 will wire this', description: 'Reject action coming soon.', variant: 'destructive' })}
          className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] hover:bg-[#F7F7F7] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9CA3AF] focus-visible:ring-offset-2"
          aria-label="Reject this item"
        >
          Reject
        </button>
      </div>

      {/* Local toast for this row */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={state.open}
          onOpenChange={(open) => { if (!open) dismiss() }}
          className="pointer-events-auto w-full max-w-xs rounded-xl border border-[#E5E7EB] bg-white shadow-lg p-4 flex flex-col gap-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-2"
        >
          <Toast.Title className="text-sm font-semibold text-[#0A0A0A]">
            {state.title}
          </Toast.Title>
          {state.description && (
            <Toast.Description className="text-xs text-[#6B7280]">
              {state.description}
            </Toast.Description>
          )}
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[100vw] outline-none" />
      </Toast.Provider>
    </>
  )
}
