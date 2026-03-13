'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function HpNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAFAF9]/90 backdrop-blur-md shadow-sm border-b border-[#F9FAFB]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — icon + wordmark */}
        <Link href="/" className="flex items-center">
          <div className="relative overflow-hidden" style={{ width: 116, height: 38 }}>
            <Image
              src="/logo/Beamix_logo_with_name_blue.svg"
              alt="Beamix"
              width={135}
              height={135}
              style={{ position: 'absolute', top: -36, left: -4 }}
            />
          </div>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Product', href: '#' },
            { label: 'How it works', href: '/how-it-works' },
            { label: 'Why Beamix', href: '/why-beamix' },
            { label: 'Pricing', href: '/pricing' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#78716C] text-sm hover:text-[#141310] transition-colors"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="hidden md:block text-sm text-[#78716C] hover:text-[#141310] transition-colors px-3 py-2"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Request a Demo
          </Link>
          <Link
            href="/signup"
            className="text-sm text-white bg-[#023c65] rounded-lg px-4 py-2 hover:bg-[#013f6c] transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
