'use client';

import { motion } from 'framer-motion';

export default function OneSuiteHero() {
    return (
        <section className="relative overflow-hidden min-h-[70vh] flex items-center">
            {/* Background: Underwater illustration */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1A365D] via-[#0D2847] to-[#0A1929]" />

            {/* Decorative underwater elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Coral/seaweed elements */}
                <div className="absolute bottom-0 left-[5%] w-32 h-48 bg-gradient-to-t from-[#FF6B2C]/30 to-transparent rounded-t-full" />
                <div className="absolute bottom-0 left-[12%] w-24 h-36 bg-gradient-to-t from-[#E91EFF]/20 to-transparent rounded-t-full" />
                <div className="absolute bottom-0 right-[8%] w-28 h-40 bg-gradient-to-t from-[#FF6B2C]/25 to-transparent rounded-t-full" />
                <div className="absolute bottom-0 right-[18%] w-20 h-32 bg-gradient-to-t from-[#E91EFF]/20 to-transparent rounded-t-full" />

                {/* Bubbles */}
                <motion.div
                    className="absolute bottom-[20%] left-[20%] w-3 h-3 rounded-full bg-white/20"
                    animate={{ y: [-10, -60, -10], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[30%] left-[40%] w-2 h-2 rounded-full bg-white/15"
                    animate={{ y: [-5, -40, -5], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                <motion.div
                    className="absolute bottom-[25%] right-[30%] w-4 h-4 rounded-full bg-white/20"
                    animate={{ y: [-8, -50, -8], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />

                {/* Light rays from above */}
                <div className="absolute top-0 left-1/4 w-1 h-[60%] bg-gradient-to-b from-white/10 to-transparent rotate-6" />
                <div className="absolute top-0 left-1/3 w-1 h-[50%] bg-gradient-to-b from-white/5 to-transparent rotate-3" />
                <div className="absolute top-0 right-1/3 w-1 h-[55%] bg-gradient-to-b from-white/8 to-transparent -rotate-3" />
            </div>

            <div className="intercom-container relative z-10 text-center py-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="intercom-h1 text-white mb-6">
                        One Suite.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B2C] to-[#E91EFF]">
                            Superior service.
                        </span>
                    </h2>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        Fin AI Agent and Helpdesk, working as one unified platform to transform your customer experience.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
