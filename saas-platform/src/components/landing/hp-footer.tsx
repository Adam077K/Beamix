import Link from 'next/link'

const links: Record<string, string[]> = {
  Product: ['Features', 'How it Works', 'Pricing', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'API', 'Status', 'Support'],
}

export function HpFooter() {
  return (
    <footer className="bg-[#FAFAF7] border-t border-[#E8E6E1] pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A17] flex items-center justify-center">
                <span
                  className="text-white text-sm font-bold"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  B
                </span>
              </div>
              <span
                className="text-[#1A1A17] font-semibold text-lg"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Beamix
              </span>
            </div>
            <p
              className="text-sm text-[#9C9C94] leading-relaxed"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              AI visibility for businesses that want to be found — not just ranked.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4
                className="text-xs font-semibold text-[#1A1A17] uppercase tracking-wider mb-4"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-[#6B6B63] hover:text-[#1A1A17] transition-colors"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-[#E8E6E1] mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9C9C94]" style={{ fontFamily: 'var(--font-inter)' }}>
            © 2026 Beamix Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-[#9C9C94] hover:text-[#1A1A17] transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
