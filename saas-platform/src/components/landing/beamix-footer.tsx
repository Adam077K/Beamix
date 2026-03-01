import Link from 'next/link'

export function BeamixFooter() {
  return (
    <footer className="bg-[#141310] border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <div className="font-[family-name:var(--font-outfit)] font-bold text-2xl mb-2">
              <span className="text-white">BEAM</span><span className="text-[#06B6D4]">IX</span>
            </div>
            <p className="text-stone-500 text-sm">AI visibility for your business.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-stone-400 font-semibold mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-stone-500 hover:text-white transition-colors">Pricing</Link>
                <Link href="/blog" className="block text-stone-500 hover:text-white transition-colors">Blog</Link>
                <Link href="#how-it-works" className="block text-stone-500 hover:text-white transition-colors">How It Works</Link>
              </div>
            </div>
            <div>
              <p className="text-stone-400 font-semibold mb-3">Legal</p>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-stone-500 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="block text-stone-500 hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
            <div>
              <p className="text-stone-400 font-semibold mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/about" className="block text-stone-500 hover:text-white transition-colors">About</Link>
                <Link href="mailto:hello@beamix.io" className="block text-stone-500 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex justify-between items-center text-xs text-stone-600">
          <p>&copy; 2026 Beamix. All rights reserved.</p>
          <div className="flex gap-2">
            <button className="text-stone-500 hover:text-white transition-colors">EN</button>
            <span>|</span>
            <button className="text-stone-500 hover:text-white transition-colors">HE</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
