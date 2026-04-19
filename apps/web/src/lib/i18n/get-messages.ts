import type { SupportedLocale } from './locale'
import type { Messages } from './messages/en'

/**
 * Server helper — dynamically imports the correct messages dict for a locale.
 * Returns the full Messages object typed against the English source of truth.
 */
export async function getMessages(locale: SupportedLocale): Promise<Messages> {
  if (locale === 'he') {
    const mod = await import('./messages/he')
    return mod.default
  }
  const mod = await import('./messages/en')
  return mod.default
}
