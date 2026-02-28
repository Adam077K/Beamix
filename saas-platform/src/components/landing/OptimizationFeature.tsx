'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getPlaceholderImage } from './shared';

export default function OptimizationFeature() {
    return (
        <section className="intercom-section intercom-bg-white py-20 lg:py-32">
            <div className="intercom-container">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="intercom-icon-badge-green w-8 h-8">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="intercom-label text-gray-500">OPTIMIZATION</span>
                        </div>

                        <h2 className="intercom-h2 text-gray-900 mb-6">
                            Data-driven insights
                            <br />
                            for continuous improvement
                        </h2>

                        <p className="text-lg text-gray-600 mb-8">
                            Understand team performance, identify bottlenecks, and uncover opportunities to deliver faster, better support.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                'Real-time performance dashboards',
                                'Conversation analytics',
                                'Team workload distribution',
                                'Customer satisfaction tracking',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-[#00C853]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#00C853] text-xs">✓</span>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="#optimization"
                            className="inline-flex items-center gap-2 text-[#2952CC] font-semibold hover:underline underline-offset-4"
                        >
                            View reporting features
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Right: Visualization Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="intercom-mockup p-6">
                            {/* Bubble chart visualization mockup */}
                            <div className="relative aspect-square max-w-md mx-auto">
                                {/* Placeholder bubbles */}
                                {[
                                    { size: 120, x: '20%', y: '30%', color: '#2952CC', label: 'Billing' },
                                    { size: 80, x: '60%', y: '20%', color: '#00C853', label: 'Features' },
                                    { size: 100, x: '70%', y: '55%', color: '#FF6B2C', label: 'Support' },
                                    { size: 60, x: '35%', y: '65%', color: '#E91EFF', label: 'Onboarding' },
                                    { size: 50, x: '85%', y: '80%', color: '#2952CC', label: 'API' },
                                ].map((bubble, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                                        className="absolute flex items-center justify-center rounded-full text-white text-xs font-medium"
                                        style={{
                                            width: bubble.size,
                                            height: bubble.size,
                                            left: bubble.x,
                                            top: bubble.y,
                                            backgroundColor: bubble.color,
                                            opacity: 0.9,
                                        }}
                                    >
                                        {bubble.label}
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Topic distribution by volume
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
