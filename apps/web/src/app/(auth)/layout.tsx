import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(51,112,255,0.06) 0%, transparent 70%), #F7F7F7',
      }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <Link href="https://beamix.tech" aria-label="Beamix home">
            <Image
              src="/logo/beamix_logo_blue_Primary.png"
              alt="Beamix"
              width={36}
              height={36}
              className="shrink-0"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center mt-5 text-xs text-gray-400">
          <Link
            href="https://beamix.tech"
            className="hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            &larr; Back to beamix.tech
          </Link>
        </p>
      </div>
    </div>
  )
}
