'use client'
import { useState, useEffect } from 'react'

const INDUSTRIES = [
  {
    query: 'What are the best insurance companies in Tel Aviv?',
    competitors: ['Migdal Insurance', 'Phoenix Group', 'Clal Insurance'],
    yours: 'Your Insurance Agency',
  },
  {
    query: 'Best moving companies in New York?',
    competitors: ['MoveCo', 'Elite Movers', 'CityMove Pro'],
    yours: 'Your Moving Company',
  },
  {
    query: 'Top law firms in London for business?',
    competitors: ['Clifford Chance', 'Linklaters', 'Allen & Overy'],
    yours: 'Your Law Firm',
  },
  {
    query: 'Best restaurants in Tel Aviv for date night?',
    competitors: ['Messa Restaurant', 'Herbert Samuel', 'Jajo'],
    yours: 'Your Restaurant',
  },
]

export function BeamixWakeupCall() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % INDUSTRIES.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const current = INDUSTRIES[index]

  return (
    <section className="py-24 px-6 bg-[#FAFAF8] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.04)_0%,_transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <p className="section-label text-cyan-600 text-center mb-4">The Wake-Up Call</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-16">
          Right now, someone is asking AI for your service.
          <br />
          <span className="text-stone-400">Here&rsquo;s what it sees.</span>
        </h2>

        <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Browser chrome mockup */}
          <div className="glass-card p-0 overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/80 border-b border-stone-200/50">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-stone-400 ml-2 font-medium">ChatGPT</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5">
                <p className="text-xs text-stone-400 mb-2">Someone just asked ChatGPT:</p>
                <p className="font-medium text-[#141310]">&ldquo;{current.query}&rdquo;</p>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3">
                {current.competitors.map((name, i) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-stone-400 text-sm w-4">{i + 1}.</span>
                    <span className="font-medium text-[#141310]">{name}</span>
                    <span className="ml-auto text-xs bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-medium">&check; mentioned</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 opacity-60">
                  <span className="text-stone-400 text-sm w-4">&mdash;</span>
                  <span className="font-medium text-stone-400 line-through">{current.yours}</span>
                  <span className="ml-auto text-xs bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-medium">&times; Not mentioned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-stone-500 text-lg mb-3">The same thing is happening in your industry.</p>
          <p className="text-5xl font-[family-name:var(--font-outfit)] font-bold text-[#06B6D4]">40%</p>
          <p className="text-stone-500 mt-2">of businesses lost leads to AI search last year.</p>
        </div>
      </div>
    </section>
  )
}
