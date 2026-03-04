const ENGINES_DATA = [
  { name: 'ChatGPT', rank: '#3', mentioned: true, sentiment: 'Positive' },
  { name: 'Gemini', rank: '#5', mentioned: true, sentiment: 'Neutral' },
  { name: 'Perplexity', rank: '#2', mentioned: true, sentiment: 'Positive' },
  { name: 'Claude', rank: '—', mentioned: false, sentiment: '—' },
]

const RECS = [
  { title: 'Add structured FAQ schema', agent: 'Schema Optimizer', priority: 'High' },
  { title: 'Optimize service page meta', agent: 'Content Writer', priority: 'Medium' },
]

export function BeamixProductPreview() {
  return (
    <section className="py-24 px-6 bg-[#FAFAF8] relative">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.05)_0%,_transparent_60%)]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <p className="section-label text-stone-400 text-center mb-4">Product Preview</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-4">
          From invisible to ranked.
        </h2>
        <p className="text-center text-stone-500 mb-12 text-lg">You see everything.</p>

        {/* Browser chrome frame */}
        <div className="glass-card p-0 overflow-hidden shadow-2xl">
          {/* Chrome bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/80 border-b border-stone-200/50">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-stone-100 rounded-md px-3 py-1 text-xs text-stone-400 max-w-md">
                app.beamix.io/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="flex min-h-[400px]">
            {/* Sidebar */}
            <div className="w-52 bg-stone-50/80 border-r border-stone-200/50 p-4 hidden md:block">
              <div className="font-[family-name:var(--font-outfit)] font-bold text-sm mb-6">
                <span className="text-[#141310]">BEAM</span><span className="text-[#06B6D4]">IX</span>
              </div>
              <nav className="space-y-1 text-sm">
                {['Overview', 'Rankings', 'Agents', 'Content', 'Settings'].map((item, i) => (
                  <div
                    key={item}
                    className={`px-3 py-2 rounded-lg ${i === 0 ? 'bg-[#06B6D4]/10 text-[#06B6D4] font-medium' : 'text-stone-500'}`}
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Score card */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex flex-col items-center justify-center border border-orange-200/50">
                  <span className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-orange-500">34</span>
                  <span className="text-[10px] text-orange-400 font-medium">FAIR</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg text-[#141310]">AI Visibility Score</h3>
                  <p className="text-sm text-stone-500">Mentioned in 3 of 4 engines scanned</p>
                </div>
              </div>

              {/* Engine rankings */}
              <div>
                <h4 className="text-sm font-semibold text-stone-700 mb-3">Engine Rankings</h4>
                <div className="space-y-2">
                  {ENGINES_DATA.map(e => (
                    <div key={e.name} className="flex items-center gap-3 text-sm">
                      <span className="w-28 text-stone-600 font-medium">{e.name}</span>
                      <span className="w-10 text-center font-mono text-stone-800">{e.rank}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        e.mentioned ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {e.mentioned ? '✓ Mentioned' : '✗ Missing'}
                      </span>
                      <span className="text-stone-400 text-xs ml-auto">{e.sentiment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-stone-700 mb-3">Top Recommendations</h4>
                <div className="space-y-2">
                  {RECS.map(r => (
                    <div key={r.title} className="flex items-center gap-3 text-sm bg-stone-50 rounded-lg px-3 py-2">
                      <span className="text-stone-700">{r.title}</span>
                      <span className="text-xs text-[#06B6D4] font-medium ml-auto">{r.agent}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {r.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
