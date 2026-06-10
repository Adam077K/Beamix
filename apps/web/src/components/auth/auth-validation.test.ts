import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword } from './auth-validation'

describe('validateEmail', () => {
  it('returns error when empty', () => {
    expect(validateEmail('')).toBe('Email is required.')
  })

  it('returns error for invalid format — missing @', () => {
    expect(validateEmail('notanemail')).toBe('Enter a valid email address.')
  })

  it('returns error for invalid format — missing domain', () => {
    expect(validateEmail('user@')).toBe('Enter a valid email address.')
  })

  it('returns undefined for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeUndefined()
  })

  it('returns undefined for a valid email with subdomain', () => {
    expect(validateEmail('name@mail.company.io')).toBeUndefined()
  })
})

describe('validatePassword', () => {
  it('returns error when empty', () => {
    expect(validatePassword('')).toBe('Password is required.')
  })

  it('returns error when fewer than 8 characters', () => {
    expect(validatePassword('short')).toBe('Password must be at least 8 characters.')
    expect(validatePassword('1234567')).toBe('Password must be at least 8 characters.')
  })

  it('returns undefined when exactly 8 characters', () => {
    expect(validatePassword('12345678')).toBeUndefined()
  })

  it('returns undefined when more than 8 characters', () => {
    expect(validatePassword('longenoughpassword')).toBeUndefined()
  })
})
