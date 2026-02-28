'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp, getPlaceholderImage } from './shared';

const sideNavItems = [
    { id: 'fin', label: 'FIN AI AGENT', active: true },
    { id: 'helpdesk', label: 'HELPDESK', active: false },
];

export default function FinAISection() {
    const [activeNav, setActiveNav] = useState('fin');

    return (
        <section className="intercom-bg-dark relative overflow-hidden">
            {/* Decorative glow/planet element */}
            <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-[5%] w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/10 blur-3xl pointer-events-none" />

            <div className="flex min-h-[80vh]">
                {/* Side Navigation */}
                <nav className="hidden lg:block w-56 flex-shrink-0 border-r border-white/10">
                    <div className="sticky top-24 p-6 space-y-2">
                        {sideNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveNav(item.id)}
                                className={`intercom-sidenav-item w-full text-left ${activeNav === item.id ? 'active' : ''
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-1 py-20 lg:py-32 px-6 lg:px-16">
                    <div className="max-w-4xl">
                        {/* Section Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-6"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/10">
                                <Sparkles className="w-4 h-4 text-[#FF6B2C]" />
                                FIN AI AGENT
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="intercom-h2 text-white mb-6"
                        >
                            AI that actually resolves
                            <br />
                            customer questions
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-white/70 mb-8 max-w-2xl"
                        >
                            Fin is an AI-first agent that resolves 50%+ of support queries instantly. It learns from your help center, previous conversations, and integrates with your existing tools.
                        </motion.p>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                href="#learn-more"
                                className="inline-flex items-center gap-2 text-white font-medium hover:underline underline-offset-4"
                            >
                                Learn more about Fin
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        {/* Hero Image/Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="mt-12"
                        >
                            <div className="intercom-mockup-dark p-6">
                                <img
                                    src={getPlaceholderImage(800, 500, 'Fin+AI+Dashboard', '2A3F6A', 'FFFFFF')}
                                    alt="Fin AI Agent interface"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
