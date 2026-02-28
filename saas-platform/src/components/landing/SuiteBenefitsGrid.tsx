'use client';

import { motion } from 'framer-motion';
import { suiteBenefits, fadeInUp, staggerContainer } from './shared';

export default function SuiteBenefitsGrid() {
    return (
        <section className="intercom-section intercom-bg-gray py-20 lg:py-32">
            <div className="intercom-container">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid md:grid-cols-2 gap-6 lg:gap-8"
                >
                    {suiteBenefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            variants={fadeInUp}
                            custom={index}
                            className="intercom-card p-6 lg:p-8"
                        >
                            {/* Illustration */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6">
                                <img
                                    src={benefit.illustrationUrl}
                                    alt={benefit.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <h3 className="intercom-h3 text-gray-900 mb-3">{benefit.title}</h3>
                            <p className="text-gray-600">{benefit.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
