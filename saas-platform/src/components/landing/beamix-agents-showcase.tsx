import { FileText, BookOpen, Star, Code2, Share2, Search, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const AGENTS = [
  { name: 'Content Writer', desc: 'Creates optimized blog posts and service pages', icon: FileText, color: 'text-blue-500' },
  { name: 'FAQ Generator', desc: 'Builds FAQ pages AI engines love to cite', icon: MessageSquare, color: 'text-green-500' },
  { name: 'Review Booster', desc: 'Generates review response templates', icon: Star, color: 'text-yellow-500' },
  { name: 'Schema Optimizer', desc: 'Adds structured data markup to your site', icon: Code2, color: 'text-purple-500' },
  { name: 'Citation Builder', desc: 'Gets you mentioned on directories and lists', icon: Share2, color: 'text-pink-500' },
  { name: 'Query Researcher', desc: 'Finds the queries your audience asks AI', icon: Search, color: 'text-cyan-500' },
  { name: 'Knowledge Base', desc: 'Structures your expertise for AI consumption', icon: BookOpen, color: 'text-orange-500' },
]

export function BeamixAgentsShowcase() {
  return (
    <section id="agents" className="py-24 px-6 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto">
        <p className="section-label text-stone-400 text-center mb-4">AI Agents</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-16">
          7 agents. All doing the work.
        </h2>

        {/* Dark hero statement */}
        <div className="bg-[#141310] text-white rounded-[24px] p-10 md:p-14 mb-8 text-center">
          <p className="text-2xl md:text-3xl font-[family-name:var(--font-outfit)] font-bold leading-snug max-w-2xl mx-auto">
            Your competitors show dashboards.
            <br />
            <span className="text-[#06B6D4]">We do the work.</span>
          </p>
          <p className="text-white/60 mt-4 max-w-lg mx-auto">
            Each agent specializes in one part of your AI search visibility. They research, write, optimize, and publish — you review and approve.
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {AGENTS.map(agent => {
            const Icon = agent.icon
            return (
              <div
                key={agent.name}
                className="glass-card p-6 card-hover-lift"
              >
                <Icon className={`h-8 w-8 ${agent.color} mb-4`} />
                <h3 className="font-[family-name:var(--font-outfit)] font-bold text-[#141310] mb-1">
                  {agent.name}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">{agent.desc}</p>
              </div>
            )
          })}

          {/* CTA card */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center card-hover-lift border-dashed">
            <p className="text-sm text-stone-500 mb-3">See all agents in action</p>
            <Link
              href="/scan"
              className="bg-[#06B6D4] hover:bg-cyan-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Try Free Scan &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
