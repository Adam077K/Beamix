import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Beamix — Stop Being Invisible to AI Search',
  description:
    'Beamix scans your business across ChatGPT, Gemini, and Perplexity — then AI agents write the content that gets you ranked. Free scan in 60 seconds.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} ${GeistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
