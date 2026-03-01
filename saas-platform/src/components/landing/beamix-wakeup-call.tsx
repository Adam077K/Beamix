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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-sm font-medium text-cyan-600 uppercase tracking-widest mb-4">The Wake-Up Call</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-16">
          Right now, someone is asking AI for your service.
          <br />
          <span className="text-stone-400">Here&rsquo;s what it sees.</span>
        </h2>

        <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Prompt bubble */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-4">
            <p className="text-xs text-stone-400 mb-2">Someone in Tel Aviv just asked ChatGPT:</p>
            <p className="font-medium text-[#141310]">&ldquo;{current.query}&rdquo;</p>
          </div>

          {/* Response */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
            {current.competitors.map((name, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-stone-400 text-sm w-4">{i + 1}.</span>
                <span className="font-medium text-[#141310]">{name}</span>
                <span className="ml-auto text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">&check; mentioned</span>
              </div>
            ))}
            <div className="flex items-center gap-3 opacity-50">
              <span className="text-stone-400 text-sm w-4">&mdash;</span>
              <span className="font-medium text-stone-400 line-through">{current.yours}</span>
              <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">&times; Not mentioned</span>
            </div>
          </div>
        </div>

        <p className="text-center text-stone-500 mt-8 text-lg">
          The same thing is happening in your industry.
        </p>
        <p className="text-center mt-3 text-2xl font-[family-name:var(--font-outfit)] font-bold">
          <span className="text-[#06B6D4]">40%</span> of businesses lost leads to AI search last year.
        </p>
      </div>
    </section>
  )
}
