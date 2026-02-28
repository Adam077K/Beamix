'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { capabilityTabs, type CapabilityTab } from './shared';

const tabs: CapabilityTab[] = ['TRAIN', 'TEST', 'DEPLOY', 'ANALYZE'];

export default function CapabilitiesTabs() {
    const [activeTab, setActiveTab] = useState<CapabilityTab>('TRAIN');
    const content = capabilityTabs[activeTab];

    return (
        <section className="intercom-bg-dark py-20 lg:py-32">
            <div className="intercom-container">
                {/* Section Label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="intercom-label text-white/60 mb-4"
                >
                    CAPABILITIES
                </motion.p>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="intercom-h2 text-white mb-12"
                >
                    From training to production
                    <br />
                    in minutes
                </motion.h2>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="intercom-tabs inline-flex mb-12"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`intercom-tab ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </motion.div>

                {/* Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="intercom-h3 text-white mb-4">{content.headline}</h3>
                            <p className="text-lg text-white/70">{content.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Right: Mockup */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="intercom-card-dark"
                        >
                            <img
                                src={content.mockupUrl}
                                alt={`${activeTab} interface`}
                                className="w-full h-auto rounded-lg"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
