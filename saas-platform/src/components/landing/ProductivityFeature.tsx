'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { getPlaceholderImage, fadeInUp } from './shared';

export default function ProductivityFeature() {
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
                            <div className="intercom-icon-badge-orange w-8 h-8">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="intercom-label text-gray-500">PRODUCTIVITY</span>
                        </div>

                        <h2 className="intercom-h2 text-gray-900 mb-6">
                            Supercharge your
                            <br />
                            team's efficiency
                        </h2>

                        <p className="text-lg text-gray-600 mb-8">
                            AI Copilot drafts responses, suggests actions, and handles repetitive tasks so your team can focus on complex issues that need a human touch.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                'AI-generated response drafts',
                                'Smart action suggestions',
                                'Automated workflows',
                                'Keyboard shortcuts for power users',
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
                            href="#productivity"
                            className="inline-flex items-center gap-2 text-[#2952CC] font-semibold hover:underline underline-offset-4"
                        >
                            See productivity features
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Right: Dual Mockups */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        {/* Main mockup */}
                        <div className="intercom-mockup">
                            <img
                                src={getPlaceholderImage(500, 350, 'Chat+Inbox', 'FFFFFF', '1E2A47')}
                                alt="Chat inbox interface"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Copilot panel mockup (overlapping) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="absolute -bottom-8 -right-8 w-3/5 intercom-mockup shadow-2xl"
                        >
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded bg-[#FF6B2C]/20 flex items-center justify-center">
                                        <span className="text-[#FF6B2C] text-xs">✨</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">AI Copilot</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                                    <div className="h-3 bg-gray-100 rounded w-3/5" />
                                </div>
                                <button className="mt-3 w-full py-2 bg-[#2952CC] text-white text-xs font-medium rounded-lg">
                                    Use suggestion
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
