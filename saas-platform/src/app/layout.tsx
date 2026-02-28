import type { Metadata } from "next";
import { Inter, Outfit, IBM_Plex_Mono } from "next/font/google";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Quleex - AI Visibility Intelligence",
    template: "%s | Quleex",
  },
  description:
    "Monitor and optimize your company's visibility in AI-powered search results like ChatGPT, Claude, and Perplexity. Get actionable insights to improve your ranking.",
  keywords: [
    "LLM visibility",
    "AI search optimization",
    "ChatGPT ranking",
    "AI SEO",
    "business visibility",
    "Claude search",
    "Perplexity ranking",
  ],
  openGraph: {
    title: "Quleex - AI Visibility Intelligence",
    description:
      "Monitor and optimize your company's visibility in AI-powered search results.",
    type: "website",
    locale: "he_IL",
    siteName: "Quleex",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${ibmPlexMono.variable} antialiased min-h-screen`}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
