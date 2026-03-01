'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BeamixHero() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    localStorage.setItem('beamix_pending_url', url)
    router.push(`/scan?url=${encodeURIComponent(url)}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden bg-gradient-to-b from-[#FAFAF8] to-stone-100">
      {/* Floating LLM badges - decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-[8%] bg-white rounded-2xl shadow-lg px-4 py-2 text-sm font-semibold text-green-600 border border-green-100 rotate-[-8deg] opacity-70">
          ChatGPT
        </div>
        <div className="absolute top-48 right-[10%] bg-white rounded-2xl shadow-lg px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-100 rotate-[6deg] opacity-70">
          Gemini
        </div>
        <div className="absolute bottom-40 left-[12%] bg-white rounded-2xl shadow-lg px-4 py-2 text-sm font-semibold text-purple-600 border border-purple-100 rotate-[4deg] opacity-70">
          Perplexity
        </div>
        <div className="absolute bottom-32 right-[8%] bg-white rounded-2xl shadow-lg px-4 py-2 text-sm font-semibold text-orange-600 border border-orange-100 rotate-[-6deg] opacity-70">
          Claude
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          Now scanning across all major AI engines in real-time
        </div>

        {/* Headline */}
        <h1 className="font-[family-name:var(--font-outfit)] font-bold text-5xl md:text-6xl lg:text-7xl leading-tight text-[#141310] mb-4">
          Your competitors are showing up on ChatGPT.
          <br />
          <span className="text-[#06B6D4]">You&rsquo;re not.</span>
        </h1>

        <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10">
          Beamix scans your business across every major AI engine — then its agents write the content that gets you ranked.
        </p>

        {/* URL input card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-stone-200 p-3 max-w-xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter your website URL, e.g. mycompany.com"
              className="flex-1 px-4 py-3 text-sm outline-none bg-transparent placeholder-stone-400"
            />
            <button
              type="submit"
              className="bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-[14px] text-sm transition-colors whitespace-nowrap"
            >
              Scan for Free &rarr;
            </button>
          </div>
        </form>

        {/* Trust pills */}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-stone-400">
          <span>Free scan</span>
          <span>&middot;</span>
          <span>No account needed</span>
          <span>&middot;</span>
          <span>Results in 60 seconds</span>
        </div>
      </div>
    </section>
  )
}
