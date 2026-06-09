/**
 * Strip an attacker-controlled OAuth `?error` value before logging it
 * (anti log-injection): keep only a safe charset and cap the length. Pure,
 * dependency-free — lives in lib/auth so server routes can import it without
 * reaching into the components/ layer.
 */
export function sanitizeOAuthErrorForLog(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
}
