import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

// This page requires browser-only APIs (Supabase auth listener) — opt out of
// static prerendering so the build does not attempt to render it without env vars.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Reset password — Beamix',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
