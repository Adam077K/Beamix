'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

// ── Shared section primitives ─────────────────────────────────────────────────

/**
 * SectionCard — wraps a group of form rows in the .card-console shell.
 * Optional header: eyebrow + heading + helper text.
 */
interface SectionCardProps {
  eyebrow?: string
  heading: string
  helper?: string
  children: React.ReactNode
  /** Footer slot — where the save-bar lives */
  footer?: React.ReactNode
  className?: string
}

export function SectionCard({ eyebrow, heading, helper, children, footer, className }: SectionCardProps) {
  return (
    <div className={cn('card-console overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 py-4">
        {eyebrow && (
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {eyebrow}
          </p>
        )}
        <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{heading}</h3>
        {helper && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">{helper}</p>
        )}
      </div>
      {/* Divider */}
      <div className="border-t border-[#F3F4F6]" />
      {/* Form rows */}
      <div className="divide-y divide-[#F3F4F6]">{children}</div>
      {/* Save-bar footer */}
      {footer && (
        <>
          <div className="border-t border-[#F3F4F6]" />
          {footer}
        </>
      )}
    </div>
  )
}

/**
 * FieldRow — label column (max ~200px) + control column, consistent 8pt rhythm.
 */
interface FieldRowProps {
  label: string
  helper?: string
  htmlFor?: string
  children: React.ReactNode
}

export function FieldRow({ label, helper, htmlFor, children }: FieldRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[200px_1fr] sm:items-start sm:gap-6">
      <div className="pt-0.5">
        <Label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </Label>
        {helper && (
          <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-muted)]">{helper}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

/**
 * SaveBar — per-section footer that is dormant when idle, wakes when dirty.
 *
 * States:
 *   idle/clean  → quiet timestamp + disabled button
 *   saving      → blue "Saving…" + 3-dot mono pulse, button disabled
 *   saved       → green Check + "Saved", auto-fades back after 2.5s
 *   error       → red AlertCircle + message + button re-enabled
 */
interface SaveBarProps {
  state: SaveState
  isDirty: boolean
  onSave: () => void
  onDiscard?: () => void
  saveLabel?: string
  errorMessage?: string
  lastSavedLabel?: string
}

export function SaveBar({
  state,
  isDirty,
  onSave,
  onDiscard,
  saveLabel = 'Save changes',
  errorMessage = "Couldn't save. Try again.",
  lastSavedLabel = 'Saved',
}: SaveBarProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      {/* Left: status feedback */}
      <div aria-live="polite" aria-atomic="true">
        {state === 'saved' && (
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-status-positive)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {lastSavedLabel}
          </span>
        )}
        {state === 'error' && (
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-status-critical)]">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {errorMessage}
          </span>
        )}
        {state === 'idle' && !isDirty && (
          <span className="text-[12px] text-[var(--color-text-muted)]">Saved</span>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {isDirty && state !== 'saving' && onDiscard && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          >
            Discard
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={state === 'saving' || (!isDirty && state !== 'error')}
          className="min-w-[120px]"
          aria-label={state === 'saving' ? 'Saving…' : saveLabel}
        >
          {state === 'saving' ? (
            <span className="flex items-center gap-1.5">
              Saving
              <SavingDots />
            </span>
          ) : (
            saveLabel
          )}
        </Button>
      </div>
    </div>
  )
}

/** 3-dot mono pulse — reuses scan-dot keyframe from globals.css */
function SavingDots() {
  return (
    <span className="flex items-center gap-px" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-current motion-safe:[animation:scan-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      {[0, 1].map((i) => (
        <div key={i} className="card-console overflow-hidden">
          <div className="px-5 py-4">
            <div className="h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="border-t border-[#F3F4F6] space-y-0 divide-y divide-[#F3F4F6]">
            {[0, 1, 2].map((j) => (
              <div key={j} className="px-5 py-4 grid grid-cols-[200px_1fr] gap-6">
                <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-9 animate-pulse rounded-lg bg-[#F3F4F6]" />
              </div>
            ))}
          </div>
          <div className="border-t border-[#F3F4F6] px-5 py-3 flex justify-end">
            <div className="h-9 w-28 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Password strength ─────────────────────────────────────────────────────────

function passwordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '#E5E7EB' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 20, label: 'Weak', color: 'var(--color-status-critical)' }
  if (score <= 2) return { score: 40, label: 'Fair', color: 'var(--color-status-warning)' }
  if (score <= 3) return { score: 65, label: 'Good', color: 'var(--color-status-positive)' }
  return { score: 100, label: 'Strong', color: 'var(--color-status-positive)' }
}

// ── Main component ────────────────────────────────────────────────────────────

interface ProfileState {
  fullName: string
  email: string
  emailVerified: boolean
  timezone: string
}

interface PasswordState {
  current: string
  next: string
  confirm: string
  showCurrent: boolean
  showNext: boolean
}

const INITIAL_PROFILE: ProfileState = {
  fullName: '',
  email: '',
  emailVerified: false,
  timezone: 'Asia/Jerusalem',
}

const INITIAL_PASSWORD: PasswordState = {
  current: '',
  next: '',
  confirm: '',
  showCurrent: false,
  showNext: false,
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Jerusalem', label: 'Israel (IST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

export function ProfileTab() {
  // Wave 2: wire to Supabase profile read
  const [isLoading] = useState(false)

  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE)
  const [profileSave, setProfileSave] = useState<SaveState>('idle')
  const [profileDirty, setProfileDirty] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [password, setPassword] = useState<PasswordState>(INITIAL_PASSWORD)
  const [passwordSave, setPasswordSave] = useState<SaveState>('idle')
  const [passwordDirty, setPasswordDirty] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  function updateProfile<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
    setProfileDirty(true)
    if (profileSave === 'saved' || profileSave === 'error') setProfileSave('idle')
  }

  function updatePassword<K extends keyof PasswordState>(key: K, value: PasswordState[K]) {
    setPassword((p) => ({ ...p, [key]: value }))
    setPasswordDirty(true)
    setPasswordError('')
    if (passwordSave === 'saved' || passwordSave === 'error') setPasswordSave('idle')
  }

  async function handleSaveProfile() {
    setProfileSave('saving')
    // Wave 2: wire to Supabase user update
    await new Promise((r) => setTimeout(r, 900))
    setProfileSave('saved')
    setProfileDirty(false)
    setTimeout(() => setProfileSave('idle'), 2500)
  }

  function handleDiscardProfile() {
    setProfile(INITIAL_PROFILE)
    setProfileDirty(false)
    setProfileSave('idle')
    setProfileError('')
  }

  async function handleSavePassword() {
    setPasswordError('')
    if (password.next !== password.confirm) {
      setPasswordError('New passwords do not match.')
      setPasswordSave('error')
      return
    }
    if (password.next.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      setPasswordSave('error')
      return
    }
    if (!password.current) {
      setPasswordError('Current password is required.')
      setPasswordSave('error')
      return
    }
    setPasswordSave('saving')
    // Wave 2: wire to Supabase auth.updateUser
    await new Promise((r) => setTimeout(r, 1000))
    setPasswordSave('saved')
    setPasswordDirty(false)
    setPassword((p) => ({ ...p, current: '', next: '', confirm: '' }))
    setTimeout(() => setPasswordSave('idle'), 2500)
  }

  function handleDiscardPassword() {
    setPassword(INITIAL_PASSWORD)
    setPasswordDirty(false)
    setPasswordSave('idle')
    setPasswordError('')
  }

  const strength = passwordStrength(password.next)
  const passwordCanSave = password.current && password.next && password.confirm

  if (isLoading) return <ProfileSkeleton />

  return (
    <div className="space-y-6">
      {/* ── Personal information ── */}
      <SectionCard
        eyebrow="Profile"
        heading="Personal information"
        footer={
          <SaveBar
            state={profileSave}
            isDirty={profileDirty}
            onSave={handleSaveProfile}
            onDiscard={handleDiscardProfile}
            errorMessage={profileError || "Couldn't save. Try again."}
          />
        }
      >
        {/* Avatar row */}
        <FieldRow label="Avatar">
          <div className="flex items-center gap-4">
            {/* Initials circle */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-lg font-semibold text-[var(--color-accent-deep)] select-none"
              aria-label="Profile avatar initials"
            >
              {profile.fullName
                ? profile.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase())
                    .join('')
                : '?'}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                aria-label="Upload profile photo"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Upload
              </Button>
              {profile.fullName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Remove profile photo"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </FieldRow>

        {/* Full name */}
        <FieldRow label="Full name" htmlFor="full-name">
          <Input
            id="full-name"
            value={profile.fullName}
            onChange={(e) => updateProfile('fullName', e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </FieldRow>

        {/* Email */}
        <FieldRow
          label="Email address"
          helper="Used for login and notifications."
          htmlFor="email"
        >
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
            />
            {/* Verification badge row */}
            {profile.email ? (
              profile.emailVerified ? (
                <p className="flex items-center gap-1.5 text-[12px]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-status-info-bg,#EEF2FF)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-status-info)]">
                    Verified
                  </span>
                </p>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-[var(--color-status-warning-bg,#FDF3E0)] px-3 py-2 text-[12px]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[var(--color-status-warning)]" aria-hidden="true" />
                  <span className="text-[var(--color-status-warning)]">
                    Email not verified.
                  </span>
                  <button
                    type="button"
                    className="ml-1 font-medium text-[var(--color-accent)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 rounded"
                  >
                    Resend
                  </button>
                </div>
              )
            ) : null}
          </div>
        </FieldRow>

        {/* Timezone */}
        <FieldRow
          label="Time zone"
          helper="When the crew surfaces time-sensitive results."
          htmlFor="timezone"
        >
          <Select
            value={profile.timezone}
            onValueChange={(v) => updateProfile('timezone', v)}
          >
            <SelectTrigger id="timezone" aria-label="Select time zone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </SectionCard>

      {/* ── Password ── */}
      <SectionCard
        eyebrow="Security"
        heading="Password"
        helper="Choose a strong password you don't use elsewhere."
        footer={
          <SaveBar
            state={passwordSave}
            isDirty={passwordDirty && !!passwordCanSave}
            onSave={handleSavePassword}
            onDiscard={handleDiscardPassword}
            saveLabel="Update password"
            errorMessage={passwordError || "Couldn't update. Try again."}
          />
        }
      >
        {/* Current password */}
        <FieldRow label="Current password" htmlFor="current-password">
          <PasswordInput
            id="current-password"
            value={password.current}
            onChange={(v) => updatePassword('current', v)}
            showToggled={password.showCurrent}
            onToggle={() => updatePassword('showCurrent', !password.showCurrent)}
            autoComplete="current-password"
          />
        </FieldRow>

        {/* New password + strength meter */}
        <FieldRow label="New password" htmlFor="new-password">
          <div className="space-y-2">
            <PasswordInput
              id="new-password"
              value={password.next}
              onChange={(v) => updatePassword('next', v)}
              showToggled={password.showNext}
              onToggle={() => updatePassword('showNext', !password.showNext)}
              autoComplete="new-password"
              aria-invalid={passwordSave === 'error' || undefined}
            />
            {password.next && (
              <div className="flex items-center gap-2">
                <Progress
                  value={strength.score}
                  className="h-1 flex-1"
                  // Tint the indicator with the strength color
                  style={{ '--progress-color': strength.color } as React.CSSProperties}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
            )}
          </div>
        </FieldRow>

        {/* Confirm */}
        <FieldRow label="Confirm password" htmlFor="confirm-password">
          <Input
            id="confirm-password"
            type="password"
            value={password.confirm}
            onChange={(e) => updatePassword('confirm', e.target.value)}
            autoComplete="new-password"
            aria-invalid={passwordSave === 'error' || undefined}
          />
        </FieldRow>

        {/* Field-level error */}
        {passwordError && (
          <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-status-critical-bg)] px-4 py-3 text-[13px] text-[var(--color-status-critical)]">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {passwordError}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ── PasswordInput ─────────────────────────────────────────────────────────────

interface PasswordInputProps {
  id: string
  value: string
  onChange: (v: string) => void
  showToggled: boolean
  onToggle: () => void
  autoComplete?: string
  'aria-invalid'?: boolean
}

function PasswordInput({
  id,
  value,
  onChange,
  showToggled,
  onToggle,
  autoComplete,
  'aria-invalid': ariaInvalid,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showToggled ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={showToggled ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#9CA3AF] transition-colors hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
      >
        {showToggled ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
