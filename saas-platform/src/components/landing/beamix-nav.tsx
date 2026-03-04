'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function BeamixNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || mobileOpen
        ? 'glass-nav'
        : 'bg-white/[0.06] backdrop-blur-xl border-b border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-[family-name:var(--font-outfit)] font-bold text-2xl tracking-tight">
          <span className={scrolled ? 'text-[#141310]' : 'text-white'}>BEAM</span>
          <span className="text-[#06B6D4]">IX</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/#product" className={`transition-colors ${scrolled ? 'text-stone-600 hover:text-[#141310]' : 'text-white/80 hover:text-white'}`}>
            Product
          </Link>
          <Link href="/#how-it-works" className={`transition-colors ${scrolled ? 'text-stone-600 hover:text-[#141310]' : 'text-white/80 hover:text-white'}`}>
            How it works
          </Link>
          <Link href="/#resources" className={`transition-colors ${scrolled ? 'text-stone-600 hover:text-[#141310]' : 'text-white/80 hover:text-white'}`}>
            Resources
          </Link>
          <Link href="/pricing" className={`transition-colors ${scrolled ? 'text-stone-600 hover:text-[#141310]' : 'text-white/80 hover:text-white'}`}>
            Pricing
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className={`text-sm font-medium transition-colors ${scrolled ? 'text-stone-600 hover:text-[#141310]' : 'text-white/80 hover:text-white'}`}>
            Request a Demo
          </Link>
          <Link href="/scan" className="bg-[#06B6D4] hover:bg-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
            Start Free Trial
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden rounded-lg p-2 transition-colors ${scrolled ? 'text-stone-600 hover:bg-stone-100' : 'text-white hover:bg-white/10'}`}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/60 bg-white/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            <Link href="/#product" onClick={closeMobile} className="text-sm font-medium text-stone-600 hover:text-[#141310] py-2 transition-colors">
              Product
            </Link>
            <Link href="/#how-it-works" onClick={closeMobile} className="text-sm font-medium text-stone-600 hover:text-[#141310] py-2 transition-colors">
              How it works
            </Link>
            <Link href="/#resources" onClick={closeMobile} className="text-sm font-medium text-stone-600 hover:text-[#141310] py-2 transition-colors">
              Resources
            </Link>
            <Link href="/pricing" onClick={closeMobile} className="text-sm font-medium text-stone-600 hover:text-[#141310] py-2 transition-colors">
              Pricing
            </Link>
            <div className="border-t border-stone-200 pt-3 mt-1 flex flex-col gap-3">
              <Link href="/login" onClick={closeMobile} className="text-sm font-medium text-stone-600 hover:text-[#141310] py-2 transition-colors">
                Request a Demo
              </Link>
              <Link href="/scan" onClick={closeMobile} className="bg-[#06B6D4] hover:bg-cyan-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors text-center">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
