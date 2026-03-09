'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
          ? 'bg-[#FAFAF7]/90 backdrop-blur-md shadow-sm border-b border-[#E8E6E1]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A17] flex items-center justify-center">
            <span
              className="text-white text-sm font-bold"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              B
            </span>
          </div>
          <span
            className="text-[#1A1A17] font-semibold text-lg"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Beamix
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          {['Product', 'How it works', 'Resources', 'Pricing'].map((item) => (
            <Link
              key={item}
              href={item === 'Pricing' ? '/pricing' : '#'}
              className="text-[#6B6B63] text-sm hover:text-[#1A1A17] transition-colors"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="hidden md:block text-sm text-[#6B6B63] hover:text-[#1A1A17] transition-colors px-3 py-2"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Request a Demo
          </Link>
          <Link
            href="/signup"
            className="text-sm text-white bg-[#1A1A17] rounded-lg px-4 py-2 hover:bg-[#2A2A22] transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
