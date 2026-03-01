'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function BeamixNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-outfit)] font-bold text-2xl tracking-tight">
          <span className="text-[#141310]">BEAM</span><span className="text-[#06B6D4]">IX</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link href="#how-it-works" className="hover:text-[#141310] transition-colors">How It Works</Link>
          <Link href="/pricing" className="hover:text-[#141310] transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-[#141310] transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-[#141310]">Log In</Link>
          <Link href="/scan" className="bg-[#06B6D4] hover:bg-cyan-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
            Start Free Scan
          </Link>
        </div>
      </div>
    </nav>
  )
}
