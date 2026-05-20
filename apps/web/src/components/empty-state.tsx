import type { ReactNode } from 'react'

type IllustrationType =
  | 'workspace'
  | 'inbox'
  | 'scan'
  | 'automation'
  | 'archive'
  | 'competitors'
  | 'settings'
  | 'auth'
  | 'error'

interface EmptyStateProps {
  illustration: IllustrationType
  title: string
  description?: string
  action?: ReactNode
}

const illustrations: Record<IllustrationType, ReactNode> = {
  workspace: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="12" width="48" height="36" rx="4" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="14" y="20" width="20" height="3" rx="1.5" fill="#D1D5DB" />
      <rect x="14" y="27" width="36" height="2" rx="1" fill="#E5E7EB" />
      <rect x="14" y="32" width="28" height="2" rx="1" fill="#E5E7EB" />
      <rect x="14" y="37" width="32" height="2" rx="1" fill="#E5E7EB" />
      <circle cx="46" cy="21" r="6" fill="#3370FF" fillOpacity="0.12" />
      <circle cx="46" cy="21" r="3" fill="#3370FF" fillOpacity="0.4" />
    </svg>
  ),
  inbox: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="16" width="48" height="32" rx="4" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M8 22 L32 34 L56 22" stroke="#D1D5DB" strokeWidth="2" fill="none" />
      <rect x="20" y="36" width="24" height="2" rx="1" fill="#E5E7EB" />
      <rect x="24" y="41" width="16" height="2" rx="1" fill="#E5E7EB" />
    </svg>
  ),
  scan: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="28" cy="28" r="16" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <circle cx="28" cy="28" r="10" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
      <line x1="40" y1="40" x2="54" y2="54" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="28" r="3" fill="#3370FF" fillOpacity="0.5" />
    </svg>
  ),
  automation: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="10" width="16" height="12" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="38" y="10" width="16" height="12" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="24" y="42" width="16" height="12" rx="3" stroke="#3370FF" strokeWidth="2" fill="#3370FF" fillOpacity="0.08" />
      <path d="M18 22 L18 32 Q18 36 22 36 L32 36" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M46 22 L46 32 Q46 36 42 36 L32 36" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="32" y1="36" x2="32" y2="42" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  archive: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="20" width="48" height="32" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <rect x="8" y="12" width="48" height="10" rx="3" stroke="#E5E7EB" strokeWidth="2" fill="#F0F0F0" />
      <rect x="24" y="15" width="16" height="4" rx="2" fill="#D1D5DB" />
      <rect x="14" y="30" width="36" height="2" rx="1" fill="#E5E7EB" />
      <rect x="14" y="36" width="28" height="2" rx="1" fill="#E5E7EB" />
    </svg>
  ),
  competitors: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="32" r="10" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <circle cx="44" cy="32" r="10" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M30 26 Q32 32 30 38" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
      <path d="M34 26 Q32 32 34 38" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="32" r="3" fill="#D1D5DB" />
      <circle cx="44" cy="32" r="3" fill="#3370FF" fillOpacity="0.5" />
    </svg>
  ),
  settings: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="8" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M32 10 L32 16 M32 48 L32 54 M10 32 L16 32 M48 32 L54 32 M16.7 16.7 L21 21 M43 43 L47.3 47.3 M47.3 16.7 L43 21 M21 43 L16.7 47.3" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#D1D5DB" />
    </svg>
  ),
  auth: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="28" width="28" height="22" rx="4" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB" />
      <path d="M22 28 L22 22 C22 14.3 42 14.3 42 22 L42 28" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="38" r="3" fill="#3370FF" fillOpacity="0.5" />
      <rect x="31" y="38" width="2" height="5" rx="1" fill="#D1D5DB" />
    </svg>
  ),
  error: (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="22" stroke="#FCA5A5" strokeWidth="2" fill="#FEF2F2" />
      <line x1="32" y1="20" x2="32" y2="34" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="41" r="2" fill="#EF4444" />
    </svg>
  ),
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 opacity-80">{illustrations[illustration]}</div>
      <h3 className="text-base font-medium text-[#0A0A0A] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
