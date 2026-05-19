import * as React from 'react'

export function SettingsField({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-900 mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
    </div>
  )
}
