/**
 * Locale detection utility.
 *
 * Resolution order (first match wins):
 * 1. `?lang=he` query param — explicit override, works in all environments
 * 2. Accept-Language header — browser preference
 * 3. Default: 'en'
 *
 * MVP approach: lightweight, no next-intl routing middleware required.
 * next-intl is used for message lookup only (useTranslations / getTranslations).
 */

export type SupportedLocale = 'en' | 'he'

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'he']
export const DEFAULT_LOCALE: SupportedLocale = 'en'

/**
 * Detect locale from a URL search params string (server-side).
 * Pass `request.url` or the `searchParams` from the page props.
 */
export function detectLocaleFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): SupportedLocale {
  const lang = searchParams['lang']
  const langStr = Array.isArray(lang) ? lang[0] : lang
  if (langStr && SUPPORTED_LOCALES.includes(langStr as SupportedLocale)) {
    return langStr as SupportedLocale
  }
  return DEFAULT_LOCALE
}

/**
 * Detect locale from Accept-Language header value.
 * Parses the header and returns the best matching supported locale.
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  // Parse the q-value weighted list
  const languages = acceptLanguage
    .split(',')
    .map((entry) => {
      const [lang, q] = entry.trim().split(';q=')
      return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1.0 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of languages) {
    // Match 'he', 'he-IL', 'iw' (old Hebrew code)
    if (lang === 'he' || lang.startsWith('he-') || lang === 'iw') {
      return 'he'
    }
    if (lang === 'en' || lang.startsWith('en-')) {
      return 'en'
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Server-side locale detection combining both signals.
 * Query param takes precedence over Accept-Language header.
 */
export function detectLocale(
  searchParams: Record<string, string | string[] | undefined>,
  acceptLanguage: string | null
): SupportedLocale {
  // 1. Query param override
  const fromParam = detectLocaleFromSearchParams(searchParams)
  if (fromParam !== DEFAULT_LOCALE) return fromParam

  // 2. Accept-Language header
  return detectLocaleFromHeader(acceptLanguage)
}

/** Returns true when locale is a RTL language */
export function isRTL(locale: SupportedLocale): boolean {
  return locale === 'he'
}
