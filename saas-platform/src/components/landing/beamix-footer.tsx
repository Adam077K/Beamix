import Link from 'next/link'

export function BeamixFooter() {
  return (
    <footer className="bg-[#141310] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          <div className="max-w-xs">
            <div className="font-[family-name:var(--font-outfit)] font-bold text-xl mb-3 tracking-widest">
              <span className="text-white">BEAM</span><span className="text-[#06B6D4]">IX</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              AI Search Visibility Platform.
              <br />
              From invisible to recommended.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-12 text-sm">
            <div>
              <p className="text-white/60 font-semibold mb-4">Product</p>
              <div className="space-y-3">
                <Link href="/#how-it-works" className="block text-white/40 hover:text-white transition-colors">Features</Link>
                <Link href="/pricing" className="block text-white/40 hover:text-white transition-colors">Pricing</Link>
                <Link href="/#agents" className="block text-white/40 hover:text-white transition-colors">AI Agents</Link>
                <Link href="/scan" className="block text-white/40 hover:text-white transition-colors">Free Scan</Link>
              </div>
            </div>
            <div>
              <p className="text-white/60 font-semibold mb-4">Company</p>
              <div className="space-y-3">
                <Link href="/about" className="block text-white/40 hover:text-white transition-colors">About</Link>
                <Link href="/blog" className="block text-white/40 hover:text-white transition-colors">Blog</Link>
                <Link href="mailto:hello@beamix.io" className="block text-white/40 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-white/60 font-semibold mb-4">Legal</p>
              <div className="space-y-3">
                <Link href="/privacy" className="block text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-white/40 hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>&copy; 2026 Beamix. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white/60 cursor-pointer transition-colors">&#120143;</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors font-bold">in</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
