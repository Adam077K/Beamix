'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp } from './shared';

export default function FinFeaturesCTA() {
    return (
        <section className="relative overflow-hidden">
            {/* Gradient transition from dark to illustrated sky */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E2A47] via-[#3A5A8A] to-[#87CEEB]" />

            {/* Decorative clouds */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[40%] left-[10%] w-48 h-16 bg-white/20 rounded-full blur-xl" />
                <div className="absolute top-[50%] right-[15%] w-64 h-20 bg-white/15 rounded-full blur-xl" />
                <div className="absolute top-[60%] left-[30%] w-40 h-14 bg-white/20 rounded-full blur-xl" />
            </div>

            <div className="relative z-10 py-24 lg:py-32">
                <div className="intercom-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="intercom-h2 text-white mb-6">
                            See all Fin's features
                        </h2>
                        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                            Explore the complete suite of AI capabilities that make Fin the most advanced customer service agent.
                        </p>
                        <Link
                            href="#fin-features"
                            className="intercom-btn intercom-btn-white"
                        >
                            Explore Fin
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
