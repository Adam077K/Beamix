'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getPlaceholderImage } from './shared';

export default function HelpdeskIntro() {
    return (
        <section className="relative overflow-hidden">
            {/* Background: Illustrated sky with clouds */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F2FF]" />

            {/* Decorative clouds */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-64 h-20 bg-white/50 rounded-full blur-lg" />
                <div className="absolute top-[15%] right-[10%] w-48 h-16 bg-white/40 rounded-full blur-lg" />
                <div className="absolute top-[25%] left-[25%] w-56 h-18 bg-white/45 rounded-full blur-lg" />
                <div className="absolute top-[20%] right-[30%] w-40 h-14 bg-white/50 rounded-full blur-md" />
            </div>

            {/* Decorative planet/orb element */}
            <motion.div
                className="absolute top-[10%] right-[8%] w-32 h-32 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 30% 30%, #FF6B2C 0%, #E91EFF 100%)',
                    boxShadow: '0 0 60px rgba(255, 107, 44, 0.4), 0 0 120px rgba(233, 30, 255, 0.2)',
                }}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 py-24 lg:py-32">
                <div className="intercom-container">
                    {/* Centered headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-[#1E2A47] text-sm font-medium mb-6 shadow-sm">
                            <Sparkles className="w-4 h-4 text-[#2952CC]" />
                            HELPDESK
                        </span>
                        <h2 className="intercom-h2 text-[#1E2A47] mb-6">
                            The next-gen Helpdesk
                            <br />
                            designed for efficiency
                        </h2>
                        <p className="text-lg text-[#4B5563] max-w-2xl mx-auto mb-8">
                            A helpdesk built for speed. AI-assisted workflows, smart routing, and powerful automation help your team deliver faster resolutions.
                        </p>
                        <Link
                            href="#helpdesk"
                            className="inline-flex items-center gap-2 text-[#2952CC] font-semibold hover:underline underline-offset-4"
                        >
                            Learn more
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Helpdesk mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="intercom-mockup shadow-2xl">
                            <img
                                src={getPlaceholderImage(900, 550, 'Helpdesk+Dashboard', 'FFFFFF', '1E2A47')}
                                alt="Helpdesk interface"
                                className="w-full h-auto"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
