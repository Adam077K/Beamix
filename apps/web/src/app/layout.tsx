import type { Metadata } from 'next'
import { Inter, Heebo } from 'next/font/google'
import { headers } from 'next/headers'
import { cn } from '@/lib/utils'
import { detectLocale } from '@/lib/i18n/locale'
import { getMessages } from '@/lib/i18n/get-messages'
import { IntlProvider } from '@/lib/i18n/provider'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Beamix — AI Search Visibility',
  description: 'Scan, diagnose, and fix your AI search visibility.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()

  // Detect locale: query param not available at layout level, use Accept-Language
  // Pages that need ?lang= param can pass it down via searchParams
  const acceptLanguage = headersList.get('accept-language')

  // Check for NEXT_LOCALE cookie (set by client-side locale switcher or query param middleware)
  const cookieHeader = headersList.get('cookie') ?? ''
  const localeCookieMatch = cookieHeader.match(/NEXT_LOCALE=([^;]+)/)
  const cookieLocale = localeCookieMatch?.[1]

  // Resolution: cookie > Accept-Language > default 'en'
  const locale = detectLocale(
    cookieLocale ? { lang: cookieLocale } : {},
    acceptLanguage,
  )

  const dir = locale === 'he' ? 'rtl' : 'ltr'
  const messages = await getMessages(locale)

  return (
    <html
      lang={locale}
      dir={dir}
      className={cn(inter.variable, heebo.variable)}
    >
      <body>
        <IntlProvider locale={locale} messages={messages}>
          {children}
        </IntlProvider>
      </body>
    </html>
  )
}
