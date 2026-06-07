/**
 * Sanitize a `next` redirect query param.
 *
 * Only same-origin absolute paths are allowed. Protocol-relative (`//evil.com`)
 * and absolute URLs (`https://evil.com`) are rejected to the fallback, closing
 * the open-redirect surface — both for the link rendered on the auth success
 * screen and for the real redirect once Supabase auth is wired (fast-follow).
 */
export function sanitizeNext(
  next: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!next) return fallback
  if (next.startsWith('/') && !next.startsWith('//')) return next
  return fallback
}
