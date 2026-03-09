import type { Metadata } from 'next'
import { Outfit, Inter, Source_Serif_4 } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const sourceSerif4 = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
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
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} ${sourceSerif4.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
