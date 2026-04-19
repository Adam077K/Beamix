'use client'

import { NextIntlClientProvider } from 'next-intl'
import type { Messages } from './messages/en'
import type { SupportedLocale } from './locale'

interface IntlProviderProps {
  locale: SupportedLocale
  messages: Messages
  children: React.ReactNode
}

export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
