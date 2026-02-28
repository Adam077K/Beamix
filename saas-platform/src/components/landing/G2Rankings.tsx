'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Score data for comparison
const scores = [
    { name: 'Intercom', score: 90, isIntercom: true },
    { name: 'Salesforce', score: 45, isIntercom: false },
    { name: 'Zendesk', score: 52, isIntercom: false },
];

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1500, isInView: boolean) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration, isInView]);

    return count;
}

export default function G2Rankings() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="intercom-section intercom-bg-gray py-20 lg:py-32">
            <div className="intercom-container">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="intercom-h2 text-gray-900 mb-6">
                            Ranked #1 on G2
                            <br />
                            in 97 categories
                        </h2>

                        <p className="text-lg text-gray-600 mb-8">
                            Real users, real reviews. See why thousands of teams choose Intercom over the alternatives.
                        </p>

                        <Link
                            href="#g2"
                            className="inline-flex items-center gap-2 text-[#2952CC] font-semibold hover:underline underline-offset-4"
                        >
                            Read G2 reviews
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Right: Score Circles */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap items-end justify-center gap-8"
                    >
                        {scores.map((item, index) => {
                            const animatedScore = useAnimatedCounter(item.score, 1500 + index * 200, isInView);

                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div
                                        className={`intercom-score-circle ${item.isIntercom ? 'intercom-score-intercom' : 'intercom-score-competitor'
                                            } ${item.isIntercom ? 'w-32 h-32 lg:w-40 lg:h-40' : 'w-24 h-24 lg:w-28 lg:h-28'}`}
                                    >
                                        <span className={item.isIntercom ? 'text-4xl lg:text-5xl' : 'text-2xl lg:text-3xl'}>
                                            {animatedScore}
                                        </span>
                                    </div>
                                    <p className={`mt-4 font-medium ${item.isIntercom ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {item.name}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
