import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('RESEND_API_KEY environment variable is required in production')
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null
