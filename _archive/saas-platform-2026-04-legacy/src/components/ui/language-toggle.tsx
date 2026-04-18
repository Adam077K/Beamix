'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()

  function toggleLocale() {
    const next = locale === 'en' ? 'he' : 'en'
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`
    router.refresh()
  }

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label={locale === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
    >
      {locale === 'en' ? 'עב' : 'EN'}
    </button>
  )
}
