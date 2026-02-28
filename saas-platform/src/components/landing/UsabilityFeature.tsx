'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Layout } from 'lucide-react';
import Link from 'next/link';
import { getPlaceholderImage } from './shared';

export default function UsabilityFeature() {
    return (
        <section className="intercom-section intercom-bg-gray py-20 lg:py-32">
            <div className="intercom-container">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1"
                    >
                        <div className="intercom-mockup shadow-xl">
                            <img
                                src={getPlaceholderImage(550, 400, 'Dashboard+Interface', 'FFFFFF', '1E2A47')}
                                alt="Helpdesk dashboard"
                                className="w-full h-auto"
                            />
                        </div>
                    </motion.div>

                    {/* Right: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2"
                    >
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="intercom-icon-badge-blue w-8 h-8">
                                <Layout className="w-4 h-4" />
                            </div>
                            <span className="intercom-label text-gray-500">USABILITY</span>
                        </div>

                        <h2 className="intercom-h2 text-gray-900 mb-6">
                            Intuitive design,
                            <br />
                            zero learning curve
                        </h2>

                        <p className="text-lg text-gray-600 mb-8">
                            A modern, clean interface that your team will love from day one. No complex training required – just jump in and start helping customers.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                'Clean, modern interface',
                                'Customizable workspace layouts',
                                'Quick keyboard navigation',
                                'Dark mode support',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-[#2952CC]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#2952CC] text-xs">✓</span>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="#usability"
                            className="inline-flex items-center gap-2 text-[#2952CC] font-semibold hover:underline underline-offset-4"
                        >
                            Explore the interface
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
