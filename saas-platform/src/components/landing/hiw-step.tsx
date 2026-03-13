import Image from 'next/image'
import { ReactNode } from 'react'

interface HiwStepProps {
  stepNumber: string
  label: string
  headline: string
  body: ReactNode
  imageSrc: string
  imageAlt: string
  imagePosition?: 'left' | 'right' | 'none'
  glassBadge?: ReactNode
  scoreCard?: ReactNode
}

export function HiwStep({
  stepNumber: _stepNumber,
  label,
  headline,
  body,
  imageSrc,
  imageAlt,
  imagePosition = 'right',
  glassBadge,
  scoreCard,
}: HiwStepProps) {
  const textCol = (
    <div className="flex flex-col justify-center">
      <p
        className="text-xs font-semibold uppercase tracking-[0.1em] text-[#023c65] mb-4"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {label}
      </p>
      <h2
        className="text-4xl md:text-5xl font-semibold text-[#141310] leading-tight mb-6"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {headline}
      </h2>
      <div
        className="text-[15px] text-[#78716C] leading-relaxed space-y-4"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {body}
      </div>
    </div>
  )

  if (imagePosition === 'none') {
    return (
      <section className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6 xl:px-12">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {textCol}
          {scoreCard && (
            <div className="rounded-[20px] bg-white border border-[#F9FAFB] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {scoreCard}
            </div>
          )}
        </div>
      </section>
    )
  }

  const imageCol = (
    <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      {glassBadge && (
        <div className="absolute top-6 left-6 backdrop-blur-xl bg-white/60 border border-white/50 rounded-2xl shadow-xl p-4">
          {glassBadge}
        </div>
      )}
    </div>
  )

  return (
    <section className="pt-[120px] pb-[120px] xl:pt-[200px] xl:pb-[200px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {imagePosition === 'left' ? (
          <>
            {imageCol}
            {textCol}
          </>
        ) : (
          <>
            {textCol}
            {imageCol}
          </>
        )}
      </div>
    </section>
  )
}
