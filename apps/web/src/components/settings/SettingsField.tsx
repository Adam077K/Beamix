import * as React from 'react'
import { AlertCircle } from 'lucide-react'

export function SettingsField({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  help?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-900 mb-1.5"
      >
        {label}
      </label>
      {children}
      {help && !error && (
        <p className="mt-1 text-xs text-gray-500">{help}</p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
