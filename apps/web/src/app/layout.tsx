import type { Metadata } from 'next'
import { Inter, Inter_Tight, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Inter Tight — used as --font-display for headings; tight tracking and
// slightly condensed proportions read as InterDisplay-equivalent on web.
// Loaded as --font-inter-display so globals.css `font-display` resolves correctly.
const interDisplay = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// Geist Mono — core to the free-scan instrument register: every count, query
// string, and score is rendered in tabular mono (DESIGN-DIRECTION §4). Loaded
// via next/font/google so no package install is required.
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
      <body className={`${inter.variable} ${interDisplay.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
