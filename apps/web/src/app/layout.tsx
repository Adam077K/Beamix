import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Beamix — AI Search Visibility',
    template: '%s | Beamix',
  },
  description:
    'Beamix scans your business for AI search visibility, diagnoses ranking gaps, and uses AI agents to fix them.',
  metadataBase: new URL('https://app.beamixai.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
