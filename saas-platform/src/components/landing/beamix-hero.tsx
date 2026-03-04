'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function BeamixHero() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
    localStorage.setItem('beamix_pending_url', normalizedUrl)
    router.push(`/scan?url=${encodeURIComponent(normalizedUrl)}`)
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/home_page/Hero.png"
        alt=""
        fill
        className="object-cover"
        priority
      />
      {/* Light gradient overlay — lets the beam image show through, white fade only at very bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(20,19,16,0.25) 0%, rgba(20,19,16,0.06) 25%, transparent 60%, rgba(20,19,16,0.3) 93%, #FAFAF8 100%)',
        }}
      />

      {/* Left-aligned text column */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-20 pt-20 pb-16 -mt-[105px]">
        <div className="max-w-[540px] flex flex-col items-start gap-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#06B6D4]/25 text-white/80 text-sm font-medium px-5 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Now scanning across all major AI engines
          </div>

          {/* Headline */}
          <h1 className="heading-display text-4xl md:text-5xl text-white text-left">
            Stop Being Invisible
            <br />
            <span className="text-[#06B6D4]">to AI Search.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-white/80 max-w-[440px] leading-relaxed">
            Beamix scans your business across ChatGPT, Gemini, and Perplexity — then AI agents write the content that gets you ranked. Free scan in 60 seconds.
          </p>

          {/* Glass URL input card */}
          <form onSubmit={handleSubmit} className="w-full max-w-[460px] bg-white/[0.12] backdrop-blur-xl border border-white/25 rounded-[20px] p-2 pl-6">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Enter your website URL..."
                className="flex-1 py-3 text-sm outline-none bg-transparent text-white placeholder-white/50"
              />
              <button
                type="submit"
                className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-semibold px-6 py-3.5 rounded-[14px] text-sm transition-colors whitespace-nowrap"
              >
                Scan for Free &rarr;
              </button>
            </div>
          </form>

          {/* Trust pills */}
          <div className="flex items-center gap-4 text-sm text-white/55">
            <span>Free scan</span>
            <span>&middot;</span>
            <span>No account needed</span>
            <span>&middot;</span>
            <span>Results in 60 seconds</span>
          </div>
        </div>
      </div>
    </section>
  )
}
