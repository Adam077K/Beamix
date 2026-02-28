'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpdeskCTA() {
    return (
        <section className="relative overflow-hidden">
            {/* Gradient transition to underwater section */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F5] via-[#C5D8E8] to-[#1A365D]" />

            {/* Decorative wave elements */}
            <div className="absolute inset-0 pointer-events-none">
                <svg
                    className="absolute bottom-0 left-0 right-0 w-full h-48 text-[#1A365D]"
                    viewBox="0 0 1440 200"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="currentColor"
                        fillOpacity="0.3"
                        d="M0,100 C360,200 1080,0 1440,100 L1440,200 L0,200 Z"
                    />
                </svg>
            </div>

            <div className="relative z-10 py-24 lg:py-32">
                <div className="intercom-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="intercom-h2 text-gray-900 mb-6">
                            See all Helpdesk features
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                            Discover every tool your team needs to deliver exceptional customer support.
                        </p>
                        <Link
                            href="#helpdesk-features"
                            className="intercom-btn intercom-btn-primary"
                        >
                            Explore Helpdesk
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
