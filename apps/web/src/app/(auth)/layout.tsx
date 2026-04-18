import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo/beamix_logo_blue_Primary.png"
            alt="Beamix"
            width={32}
            height={32}
            className="shrink-0"
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-gray-400">
          <a
            href="https://beamix.tech"
            className="hover:text-gray-600 transition-colors"
          >
            ← Back to beamix.tech
          </a>
        </p>
      </div>
    </div>
  )
}
