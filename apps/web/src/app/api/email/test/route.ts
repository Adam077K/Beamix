/**
 * POST /api/email/test
 *
 * Development-only endpoint for sending a transactional template to an
 * arbitrary recipient so we can iterate on layout + copy without driving
 * the real triggers. Returns 404 in production to keep the path dark.
 *
 * Body (Zod-validated):
 *   { template: 'welcome' | 'approval-pending', to: string (email) }
 *
 * Renders the selected React Email template with stub props and sends via
 * the Resend client wrapper.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/client'
import WelcomeEmail from '@/lib/email/templates/welcome'
import ApprovalPendingEmail from '@/lib/email/templates/approval-pending'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BodySchema = z.object({
  template: z.enum(['welcome', 'approval-pending']),
  to: z.string().email(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(null, { status: 404 })
  }

  let parsed: z.infer<typeof BodySchema>
  try {
    parsed = BodySchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { template, to } = parsed

  const reactNode =
    template === 'welcome'
      ? WelcomeEmail({ firstName: 'Adam' })
      : ApprovalPendingEmail({
          firstName: 'Adam',
          signedToken: 'dev-stub-token-not-for-production',
          approvalDescription: 'A pending publish action for testing.',
        })

  try {
    await sendEmail({
      to,
      subject: `[dev] ${template}`,
      react: reactNode,
    })
    return NextResponse.json({ ok: true, template, to })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'send_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
