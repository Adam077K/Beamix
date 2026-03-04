'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function BeamixFinalCTA() {
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
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background image */}
      <Image
        src="/home_page/Final_CTA.png"
        alt=""
        fill
        className="object-cover"
      />
      {/* Warm radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_#141310_60%)]" />
      <div className="absolute inset-0 bg-[#141310]/70" />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
          Stop being invisible.
          <br />
          Start being recommended.
        </h2>
        <p className="text-white/60 mb-10 text-lg">
          Enter your website and see how AI engines see your business — in 60 seconds.
        </p>

        <form onSubmit={handleSubmit} className="glass-card-dark p-3 max-w-xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter your website URL..."
              className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder-white/40 outline-none"
            />
            <button type="submit" className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-[14px] text-sm transition-colors whitespace-nowrap">
              Scan Now &rarr;
            </button>
          </div>
        </form>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mt-6 text-sm text-white/50 flex-wrap">
          <span className="flex items-center gap-2">
            <span>&#128274;</span> No credit card required
          </span>
          <span className="flex items-center gap-2">
            <span>&#9889;</span> Results in 60 seconds
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">&#10003;</span> Free forever plan
          </span>
        </div>
      </div>
    </section>
  )
}
