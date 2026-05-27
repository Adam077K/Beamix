import 'server-only'

import { inngest } from '@/inngest/client'
import { sendEmail } from './client'
import { WelcomeEmail } from './templates/welcome'
import * as React from 'react'

// ---------------------------------------------------------------------------
// sendWelcomeEmail — direct send (callable from server actions / API routes)
// ---------------------------------------------------------------------------
export interface SendWelcomeEmailInput {
  to: string
  firstName: string
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const { to, firstName } = input

  return sendEmail({
    to,
    subject: 'Welcome to Beamix',
    react: React.createElement(WelcomeEmail, { firstName }),
    text: `Welcome to Beamix, ${firstName}.\n\nYour team is preparing your brand brief. Head to https://app.beamixai.com/home to see your results.`,
  })
}

// ---------------------------------------------------------------------------
// Inngest event handler stub — fires on `discovery/completed`
//
// Wave 1 scope: function is registered but only sends the welcome email.
// Wave 2 will enrich the payload (scan summary, score, recommended actions).
// ---------------------------------------------------------------------------
export const onDiscoveryCompleted = inngest.createFunction(
  {
    id: 'send-welcome-on-discovery',
    retries: 3,
  },
  { event: 'discovery/completed' },
  async ({ event, step }) => {
    const { userId, userEmail, firstName } = event.data

    const result = await step.run('send-welcome-email', async () => {
      return sendWelcomeEmail({ to: userEmail, firstName })
    })

    if (!result.ok) {
      // Propagate so Inngest retries with backoff
      throw new Error(`[send-welcome] Email send failed: ${result.error}`)
    }

    return { messageId: result.messageId, userId }
  }
)
