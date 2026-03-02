'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <section className="py-24 px-6 bg-[#141310]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-white mb-4">
          Ready to rank on AI?
        </h2>
        <p className="text-stone-400 mb-10">Join thousands of businesses that found out where they stand &mdash; and fixed it.</p>
        <form onSubmit={handleSubmit} className="bg-white/10 border border-white/20 rounded-[20px] p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter your website URL"
              className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder-stone-500 outline-none"
            />
            <button type="submit" className="bg-[#06B6D4] hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-[14px] text-sm transition-colors whitespace-nowrap">
              Scan for Free &rarr;
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-stone-500">
          <span>Free scan</span><span>&middot;</span><span>No account needed</span><span>&middot;</span><span>60 seconds</span>
        </div>
      </div>
    </section>
  )
}
