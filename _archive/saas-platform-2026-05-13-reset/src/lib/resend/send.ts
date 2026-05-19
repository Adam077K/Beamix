/**
 * send.ts — Unified email send helper.
 *
 * All transactional sends go through this function. Wraps Resend with:
 * - Consistent from address
 * - Error isolation (email failure NEVER throws — only console.error)
 * - Structured logging for debugging
 */

import { getResendClient, FROM_ADDRESS } from './client';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a transactional email via Resend.
 *
 * IMPORTANT: This function NEVER throws. Email failures are logged but do not
 * propagate to callers. Background jobs and webhooks must not fail because of
 * email delivery issues.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    const resend = getResendClient();
    const from = process.env['EMAIL_FROM_ADDRESS'] ?? FROM_ADDRESS;
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    if (result.error) {
      console.error('[sendEmail] Resend API error:', result.error, { to: payload.to, subject: payload.subject });
    }
  } catch (err) {
    console.error('[sendEmail] Failed to send email:', err, { to: payload.to, subject: payload.subject });
  }
}
