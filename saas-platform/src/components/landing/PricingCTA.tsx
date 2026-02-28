'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PricingCTA() {
    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            {/* Background: Meadow illustration */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7]" />

            {/* Decorative meadow elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grass blades */}
                <div className="absolute bottom-0 left-0 right-0 h-32">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute bottom-0"
                            style={{
                                left: `${i * 5 + Math.random() * 3}%`,
                                width: '3px',
                                height: `${40 + Math.random() * 30}px`,
                                background: `linear-gradient(to top, #22C55E, #4ADE80)`,
                                borderRadius: '2px',
                                transform: `rotate(${-5 + Math.random() * 10}deg)`,
                            }}
                        />
                    ))}
                </div>

                {/* Flowers */}
                {[
                    { left: '8%', bottom: '15%', color: '#FF6B2C' },
                    { left: '22%', bottom: '8%', color: '#E91EFF' },
                    { left: '75%', bottom: '12%', color: '#FF6B2C' },
                    { left: '88%', bottom: '18%', color: '#E91EFF' },
                    { left: '45%', bottom: '6%', color: '#FF6B2C' },
                ].map((flower, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                            left: flower.left,
                            bottom: flower.bottom,
                            backgroundColor: flower.color,
                        }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                ))}

                {/* Sun glow */}
                <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-yellow-200/30 blur-3xl" />
            </div>

            <div className="intercom-container relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="intercom-h2 text-gray-900 mb-4">
                        One suite. One contract.
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Simple, transparent pricing that scales with your business.
                    </p>

                    {/* Pricing highlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-block bg-white rounded-2xl px-8 py-6 shadow-xl mb-10"
                    >
                        <div className="flex items-baseline gap-2 justify-center">
                            <span className="text-4xl lg:text-5xl font-bold text-gray-900">$0.99</span>
                            <span className="text-gray-500">per resolution</span>
                        </div>
                        <div className="text-gray-500 mt-2">
                            + <span className="font-semibold text-gray-700">$29</span>/seat/month
                        </div>
                    </motion.div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="#pricing" className="intercom-btn intercom-btn-primary">
                            View pricing
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="#trial" className="intercom-btn intercom-btn-ghost text-gray-700 border-gray-300">
                            Start free trial
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
