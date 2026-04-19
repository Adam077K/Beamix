import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F7F7F7] px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="https://beamix.tech" aria-label="Beamix home">
            <Image
              src="/logo/beamix_logo_blue_Primary.png"
              alt="Beamix"
              width={120}
              height={32}
              className="shrink-0 h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-[#6B7280]">
          <Link
            href="https://beamix.tech"
            className="hover:text-[#0A0A0A] transition-colors duration-150"
          >
            ← Back to beamix.tech
          </Link>
        </p>
      </div>
    </div>
  )
}
