'use client';

interface LogoItem {
    name: string;
    style?: string;
}

const logos: LogoItem[] = [
    { name: 'JAVA', style: 'font-bold italic' },
    { name: 'Nintendo', style: 'font-semibold' },
    { name: 'jQuery', style: 'font-bold italic' },
    { name: 'PRADA', style: 'font-light tracking-[0.3em] uppercase' },
    { name: 'MUSIC', style: 'font-medium tracking-wide' },
    { name: 'chrome', style: 'font-medium' },
    { name: 'STRAVA', style: 'font-bold tracking-widest uppercase' },
];

export default function CustomerLogos() {
    return (
        <section className="relative py-10 overflow-hidden">
            {/* Marquee Container */}
            <div className="relative flex overflow-hidden">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/70 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

                {/* First track */}
                <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-12 md:gap-16">
                    {logos.map((logo, i) => (
                        <span
                            key={`a-${i}`}
                            className={`text-white/50 text-lg md:text-xl whitespace-nowrap ${logo.style ?? ''}`}
                        >
                            {logo.name}
                        </span>
                    ))}
                </div>
                {/* Duplicate track for seamless loop */}
                <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-12 md:gap-16 ml-12 md:ml-16">
                    {logos.map((logo, i) => (
                        <span
                            key={`b-${i}`}
                            className={`text-white/50 text-lg md:text-xl whitespace-nowrap ${logo.style ?? ''}`}
                        >
                            {logo.name}
                        </span>
                    ))}
                </div>
            </div>

        </section>
    );
}
