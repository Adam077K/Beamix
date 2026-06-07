import { describe, it, expect } from 'vitest'
import { sanitizeNext } from './next-param'

describe('sanitizeNext', () => {
  it('allows same-origin absolute paths', () => {
    expect(sanitizeNext('/settings')).toBe('/settings')
    expect(sanitizeNext('/dashboard?tab=billing')).toBe('/dashboard?tab=billing')
  })

  it('rejects absolute URLs (open redirect)', () => {
    expect(sanitizeNext('https://evil.com')).toBe('/dashboard')
    expect(sanitizeNext('http://evil.com')).toBe('/dashboard')
  })

  it('rejects protocol-relative URLs (open redirect)', () => {
    expect(sanitizeNext('//evil.com')).toBe('/dashboard')
  })

  it('rejects javascript: and other non-path schemes', () => {
    expect(sanitizeNext('javascript:alert(1)')).toBe('/dashboard')
    expect(sanitizeNext('data:text/html,<script>')).toBe('/dashboard')
    expect(sanitizeNext('mailto:x@y.com')).toBe('/dashboard')
  })

  it('falls back when empty or missing', () => {
    expect(sanitizeNext(null)).toBe('/dashboard')
    expect(sanitizeNext(undefined)).toBe('/dashboard')
    expect(sanitizeNext('')).toBe('/dashboard')
  })

  it('honors a custom fallback', () => {
    expect(sanitizeNext('https://evil.com', '/login')).toBe('/login')
  })
})
