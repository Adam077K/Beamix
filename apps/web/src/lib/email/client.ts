import 'server-only'

import { Resend } from 'resend'
import { z } from 'zod'
import type { ReactElement } from 'react'

// ---------------------------------------------------------------------------
// Environment validation — fail fast at startup, not at send time
// ---------------------------------------------------------------------------
function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`[email/client] Missing required env var: ${key}`)
  }
  return value.trim()
}

let _resend: Resend | null = null

function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(requireEnv('RESEND_API_KEY'))
  }
  return _resend
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
export const SendEmailSchema = z.object({
  to: z.string().email('Invalid recipient email'),
  subject: z.string().min(1, 'Subject is required'),
  react: z.custom<ReactElement>((val) => val !== null && typeof val === 'object'),
  text: z.string().optional(),
})

export type SendEmailInput = z.infer<typeof SendEmailSchema>

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string }

// ---------------------------------------------------------------------------
// sendEmail
// ---------------------------------------------------------------------------
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const parsed = SendEmailSchema.safeParse(input)
  if (!parsed.success) {
    const error = parsed.error.errors.map((e) => e.message).join(', ')
    console.error('[email/client] Validation failed', { error })
    return { ok: false, error }
  }

  const from = requireEnv('RESEND_FROM_EMAIL')
  const { to, subject, react, text } = parsed.data

  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      ...(text ? { text } : {}),
    })

    if (error) {
      console.error('[email/client] Resend API error', { error, to, subject })
      return { ok: false, error: error.message }
    }

    if (!data?.id) {
      console.error('[email/client] Resend returned no message ID', { to, subject })
      return { ok: false, error: 'Resend returned no message ID' }
    }

    return { ok: true, messageId: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email/client] Unexpected error', { message, to, subject })
    return { ok: false, error: message }
  }
}
