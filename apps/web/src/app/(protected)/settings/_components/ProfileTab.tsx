'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

type SaveState = 'idle' | 'saving' | 'success' | 'error'

interface FieldRowProps {
  label: string
  helper?: string
  children: React.ReactNode
  htmlFor?: string
}

function FieldRow({ label, helper, children, htmlFor }: FieldRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[1fr_1.4fr] sm:gap-6 sm:items-start">
      <div className="pt-0.5">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-[#0A0A0A]">
          {label}
        </Label>
        {helper && (
          <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">{helper}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-6 pt-6 pb-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {title}
      </h3>
    </div>
  )
}

interface ProfileState {
  firstName: string
  lastName: string
  email: string
  language: string
}

interface PasswordState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  showCurrent: boolean
  showNew: boolean
}

export function ProfileTab() {
  const [profile, setProfile] = useState<ProfileState>({
    firstName: 'Sarah',
    lastName: 'Cohen',
    email: 'sarah@cohenlaw.co.il',
    language: 'en',
  })
  const [profileSave, setProfileSave] = useState<SaveState>('idle')

  const [password, setPassword] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
  })
  const [passwordSave, setPasswordSave] = useState<SaveState>('idle')
  const [passwordError, setPasswordError] = useState('')

  async function handleSaveProfile() {
    setProfileSave('saving')
    // Stub: simulate network latency
    await new Promise((r) => setTimeout(r, 900))
    setProfileSave('success')
    setTimeout(() => setProfileSave('idle'), 3000)
  }

  async function handleSavePassword() {
    setPasswordError('')
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (password.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    setPasswordSave('saving')
    await new Promise((r) => setTimeout(r, 1000))
    // Stub: 10% error simulation removed — always succeed for demo
    setPasswordSave('success')
    setPassword((p) => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }))
    setTimeout(() => setPasswordSave('idle'), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Personal information panel */}
      <div className="card-console overflow-hidden">
        <SectionHeader title="Personal information" />

        <div className="divide-y divide-[#F3F4F6] px-6">
          <FieldRow label="First name" htmlFor="first-name">
            <Input
              id="first-name"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              autoComplete="given-name"
            />
          </FieldRow>

          <FieldRow label="Last name" htmlFor="last-name">
            <Input
              id="last-name"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              autoComplete="family-name"
            />
          </FieldRow>

          <FieldRow
            label="Email address"
            helper="Used for login and notifications. Changing this requires re-verification."
            htmlFor="email"
          >
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
          </FieldRow>

          <FieldRow
            label="Language"
            helper="Interface language for the Beamix console."
          >
            <Select
              value={profile.language}
              onValueChange={(v) => setProfile((p) => ({ ...p, language: v }))}
            >
              <SelectTrigger aria-label="Select interface language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </div>

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-6 py-4">
          <SaveFeedback state={profileSave} />
          <Button
            onClick={handleSaveProfile}
            disabled={profileSave === 'saving'}
            className="min-w-[120px]"
          >
            {profileSave === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </div>

      {/* Password panel */}
      <div className="card-console overflow-hidden">
        <SectionHeader title="Password" />

        <div className="divide-y divide-[#F3F4F6] px-6">
          <FieldRow
            label="Current password"
            htmlFor="current-password"
          >
            <div className="relative">
              <Input
                id="current-password"
                type={password.showCurrent ? 'text' : 'password'}
                value={password.currentPassword}
                onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setPassword((p) => ({ ...p, showCurrent: !p.showCurrent }))}
                aria-label={password.showCurrent ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
              >
                {password.showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldRow>

          <FieldRow
            label="New password"
            helper="Minimum 8 characters."
            htmlFor="new-password"
          >
            <div className="relative">
              <Input
                id="new-password"
                type={password.showNew ? 'text' : 'password'}
                value={password.newPassword}
                onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
                autoComplete="new-password"
                className="pr-10"
                aria-invalid={passwordError !== '' ? true : undefined}
              />
              <button
                type="button"
                onClick={() => setPassword((p) => ({ ...p, showNew: !p.showNew }))}
                aria-label={password.showNew ? 'Hide new password' : 'Show new password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 rounded"
              >
                {password.showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldRow>

          <FieldRow
            label="Confirm new password"
            htmlFor="confirm-password"
          >
            <Input
              id="confirm-password"
              type="password"
              value={password.confirmPassword}
              onChange={(e) => setPassword((p) => ({ ...p, confirmPassword: e.target.value }))}
              autoComplete="new-password"
              aria-invalid={passwordError !== '' ? true : undefined}
            />
          </FieldRow>
        </div>

        {passwordError && (
          <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg bg-[#FDECEC] px-4 py-3 text-[13px] text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {passwordError}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#F3F4F6] px-6 py-4">
          <SaveFeedback state={passwordSave} />
          <Button
            onClick={handleSavePassword}
            disabled={
              passwordSave === 'saving' ||
              !password.currentPassword ||
              !password.newPassword ||
              !password.confirmPassword
            }
            className="min-w-[128px]"
          >
            {passwordSave === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SaveFeedback({ state }: { state: SaveState }) {
  if (state === 'success') {
    return (
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#0E9E6E]">
        <CheckCircle2 className="h-4 w-4" />
        Saved
      </span>
    )
  }
  if (state === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#DC2626]">
        <AlertCircle className="h-4 w-4" />
        Failed to save
      </span>
    )
  }
  return <span />
}

export { FieldRow, SectionHeader, SaveFeedback }
export type { SaveState }
