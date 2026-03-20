import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('NEXT_LOCALE')?.value
  const locale = raw === 'he' ? 'he' : 'en' // allowlist — prevents path traversal via cookie
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
