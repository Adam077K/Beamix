'use client';

import { motion } from 'framer-motion';
import { Bot, Headphones, BarChart3 } from 'lucide-react';
import { fadeInUp, staggerContainer } from './shared';

// Feature cards data
const features = [
    {
        icon: Bot,
        title: 'AI-powered resolution',
        description: 'Fin AI Agent handles 50%+ of queries instantly with accurate, contextual answers.',
        color: 'green',
        dotPosition: { top: '30%', left: '70%' },
    },
    {
        icon: Headphones,
        title: 'Human expertise',
        description: 'Complex issues flow seamlessly to your team with full context and AI assist.',
        color: 'magenta',
        dotPosition: { top: '50%', left: '85%' },
    },
    {
        icon: BarChart3,
        title: 'Continuous improvement',
        description: 'Analytics and insights help you optimize both AI and human performance.',
        color: 'blue',
        dotPosition: { top: '70%', left: '70%' },
    },
];

const colorClasses = {
    green: 'intercom-icon-badge-green',
    magenta: 'intercom-icon-badge-magenta',
    blue: 'intercom-icon-badge-blue',
};

const dotColors = {
    green: '#00C853',
    magenta: '#E91EFF',
    blue: '#2952CC',
};

export default function ValueProposition() {
    return (
        <section className="intercom-section intercom-bg-gray py-20 lg:py-32">
            <div className="intercom-container">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={fadeInUp} className="intercom-h2 text-gray-900 mb-4">
                        Built to work together as one
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Fin AI Agent and Helpdesk create a unified system that delivers exceptional service at every step.
                    </motion.p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                    {/* Left: Flow Diagram (60%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-3 relative"
                    >
                        {/* Flow diagram SVG */}
                        <div className="relative bg-white rounded-2xl p-8 shadow-lg">
                            <svg
                                viewBox="0 0 500 300"
                                className="w-full h-auto"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Main path */}
                                <motion.path
                                    d="M50 150 Q150 50 250 150 Q350 250 450 150"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                    strokeDasharray="8 4"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                                />

                                {/* Customer node */}
                                <circle cx="50" cy="150" r="24" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
                                <text x="50" y="155" textAnchor="middle" fill="#6B7280" fontSize="10" fontWeight="500">Customer</text>

                                {/* Fin AI node */}
                                <circle cx="250" cy="100" r="32" fill="#00C853" fillOpacity="0.15" stroke="#00C853" strokeWidth="2" />
                                <text x="250" y="95" textAnchor="middle" fill="#00C853" fontSize="12" fontWeight="600">Fin AI</text>
                                <text x="250" y="110" textAnchor="middle" fill="#00C853" fontSize="9">50% resolved</text>

                                {/* Human node */}
                                <circle cx="350" cy="200" r="28" fill="#E91EFF" fillOpacity="0.15" stroke="#E91EFF" strokeWidth="2" />
                                <text x="350" y="205" textAnchor="middle" fill="#E91EFF" fontSize="11" fontWeight="600">Human</text>

                                {/* Resolution node */}
                                <circle cx="450" cy="150" r="24" fill="#2952CC" fillOpacity="0.15" stroke="#2952CC" strokeWidth="2" />
                                <text x="450" y="155" textAnchor="middle" fill="#2952CC" fontSize="10" fontWeight="500">Resolved</text>

                                {/* Animated dots */}
                                <motion.circle
                                    cx="0"
                                    cy="0"
                                    r="6"
                                    fill="#00C853"
                                    initial={{ offsetDistance: '0%' }}
                                    animate={{ offsetDistance: '100%' }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    style={{ offsetPath: 'path("M50 150 Q150 50 250 150 Q350 250 450 150")' }}
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Right: Feature Cards (40%) */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="lg:col-span-2 space-y-4"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                custom={index}
                                className="intercom-card flex items-start gap-4 p-5"
                            >
                                <div className={`intercom-icon-badge ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
