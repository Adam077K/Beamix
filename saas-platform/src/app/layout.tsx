import type { Metadata } from 'next'
import { Outfit, Inter, Source_Serif_4, Fraunces, DM_Serif_Display, PT_Sans, Plus_Jakarta_Sans, Figtree } from 'next/font/google'
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

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['600'],
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
      <body className={`${outfit.variable} ${inter.variable} ${sourceSerif4.variable} ${fraunces.variable} ${dmSerifDisplay.variable} ${ptSans.variable} ${plusJakartaSans.variable} ${figtree.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
