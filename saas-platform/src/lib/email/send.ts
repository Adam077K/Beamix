import { render } from '@react-email/render'
import { getResend } from './resend'
import type { ReactElement } from 'react'

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? 'Beamix <noreply@beamix.io>'

interface SendEmailOptions {
  to: string
  subject: string
  react: ReactElement
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<SendEmailResult> {
  const resendClient = getResend()

  if (!resendClient) {
    const html = await render(react)
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(`[DEV EMAIL] HTML preview (first 500 chars): ${html.slice(0, 500)}`)
    return { success: true, id: `dev_${Date.now()}` }
  }

  const { data, error } = await resendClient.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    react,
  })

  if (error) {
    console.error(`[EMAIL ERROR] Failed to send "${subject}" to ${to}:`, error)
    return { success: false, error: error.message }
  }

  return { success: true, id: data?.id }
}
