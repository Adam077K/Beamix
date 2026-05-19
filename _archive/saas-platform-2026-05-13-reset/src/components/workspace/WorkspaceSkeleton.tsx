'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface WorkspaceSkeletonProps {
  jobId: string
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  queued: 'Queued — waiting to start',
  running: 'Agent is working',
  failed: 'Run failed',
}

export default function WorkspaceSkeleton({ jobId, status }: WorkspaceSkeletonProps) {
  const router = useRouter()

  // Poll every 4 seconds while running/queued
  useEffect(() => {
    if (status === 'failed') return
    const id = setInterval(() => {
      router.refresh()
    }, 4000)
    return () => clearInterval(id)
  }, [router, status])

  const isFailed = status === 'failed'

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-gray-100 px-6">
        <Link
          href="/inbox"
          className="flex items-center gap-1.5 text-[12px] text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Inbox
        </Link>
      </div>

      {/* Main skeleton content */}
      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[260px_1fr_300px]">
        {/* Left col skeleton */}
        <div className="hidden border-r border-gray-100 p-5 lg:block">
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            <div className="space-y-2">
              {[80, 60, 70, 50].map((w, i) => (
                <div key={i} className="h-2.5 animate-pulse rounded bg-gray-100" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Center col */}
        <div className="flex flex-col items-center justify-center p-8">
          {isFailed ? (
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-red-50">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 6v4M10 14h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="10" cy="10" r="8" stroke="#EF4444" strokeWidth="1.4" />
                </svg>
              </div>
              <h2 className="mb-2 text-[15px] font-medium text-gray-900">Agent run failed</h2>
              <p className="mb-5 text-[13px] text-gray-500">
                The agent encountered an error. No credits were charged.
              </p>
              <Link
                href="/inbox"
                className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-4 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Return to Inbox
              </Link>
            </div>
          ) : (
            <div className="max-w-xs text-center">
              {/* Animated ring */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                <svg
                  viewBox="0 0 56 56"
                  fill="none"
                  className="h-14 w-14 animate-spin"
                  style={{ animationDuration: '1.4s', animationTimingFunction: 'linear' }}
                  aria-hidden="true"
                >
                  <circle cx="28" cy="28" r="24" stroke="#E5E7EB" strokeWidth="3" />
                  <path
                    d="M28 4a24 24 0 0 1 24 24"
                    stroke="#3370FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="mb-1.5 text-[15px] font-medium text-gray-900">
                {STATUS_LABEL[status] ?? 'Agent is running'}
              </h2>
              <p className="text-[13px] text-gray-500">
                This page refreshes automatically. Usually takes 30–90 seconds.
              </p>
              <p className="mt-3 font-mono text-[11px] text-gray-300">
                job:{jobId.slice(0, 8)}
              </p>
            </div>
          )}
        </div>

        {/* Right col skeleton */}
        <div className="hidden border-l border-gray-100 p-5 lg:block">
          <div className="space-y-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            <div className="space-y-2">
              {[90, 70, 55].map((w, i) => (
                <div key={i} className="h-2.5 animate-pulse rounded bg-gray-100" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
