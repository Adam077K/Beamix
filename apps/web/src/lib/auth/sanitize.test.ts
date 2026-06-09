import { describe, it, expect } from 'vitest'
import { sanitizeOAuthErrorForLog } from './sanitize'

describe('sanitizeOAuthErrorForLog', () => {
  it('strips newlines + injected control chars (log injection)', () => {
    expect(sanitizeOAuthErrorForLog('access_denied\nX-Injected: evil')).toBe(
      'access_deniedX-Injectedevil',
    )
  })
  it('keeps a clean provider error code intact', () => {
    expect(sanitizeOAuthErrorForLog('access_denied')).toBe('access_denied')
  })
  it('caps length at 64', () => {
    expect(sanitizeOAuthErrorForLog('a'.repeat(100))).toHaveLength(64)
  })
})
