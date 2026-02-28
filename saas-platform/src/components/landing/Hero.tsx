'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import AnimatedDashboard, { FloatingGaugeCard } from '@/components/landing/AnimatedDashboard';

export default function Hero() {
    const [url, setUrl] = useState('');

    return (
        <section className="relative overflow-hidden">
            {/* Full-bleed Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/Background_Hero.png"
                    alt=""
                    fill
                    priority
                    className="object-cover object-center"
                    quality={90}
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
            </div>

            {/* Ambient glow effects */}
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center">
                <ContainerScroll
                    titleComponent={
                        <>
                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight"
                                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                            >
                                Boost Your Brand&apos;s
                                <br />
                                <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                                    Visibility In AI Search
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                                className="mt-8 text-base sm:text-lg md:text-xl text-white/65 max-w-2xl mx-auto leading-relaxed font-light"
                            >
                                Monitor how AI platforms like ChatGPT, Claude, and Perplexity
                                recommend your brand — and get actionable steps to rank higher.
                            </motion.p>

                            {/* URL Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                                className="mt-10 max-w-md mx-auto"
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Enter your website URL to check visibility..."
                                        className="w-full px-5 py-3 pr-12 rounded-full bg-white/8 backdrop-blur-md border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/12 transition-all"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-1.5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                                        aria-label="Analyze URL"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    }
                >
                    {/* Animated Dashboard in 3D Card */}
                    <AnimatedDashboard />
                </ContainerScroll>

                {/* Floating Gauge Card Overlay */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                    className="absolute top-[65vh] md:top-[60vh] lg:top-[58vh] right-[5%] sm:right-[10%] md:right-[calc(50%-430px)] lg:right-[calc(50%-480px)] z-50 pointer-events-none"
                >
                    <FloatingGaugeCard value={65} delta="+33%" />
                </motion.div>
            </div>
        </section>
    );
}
