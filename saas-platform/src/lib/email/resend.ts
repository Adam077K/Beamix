import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// For backwards compat — returns null if no API key
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const instance = getResend()
    if (!instance) return undefined
    return (instance as unknown as Record<string | symbol, unknown>)[prop]
  },
})
