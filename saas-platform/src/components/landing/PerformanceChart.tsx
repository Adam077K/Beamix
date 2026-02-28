'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

// Sample data for the performance chart
const chartData = [
    { month: 'Jan', resolution: 35 },
    { month: 'Feb', resolution: 42 },
    { month: 'Mar', resolution: 48 },
    { month: 'Apr', resolution: 52 },
    { month: 'May', resolution: 58 },
    { month: 'Jun', resolution: 65 },
    { month: 'Jul', resolution: 72 },
    { month: 'Aug', resolution: 78 },
    { month: 'Sep', resolution: 82 },
    { month: 'Oct', resolution: 86 },
    { month: 'Nov', resolution: 89 },
    { month: 'Dec', resolution: 92 },
];

export default function PerformanceChart() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [animatedData, setAnimatedData] = useState(chartData.map(d => ({ ...d, resolution: 0 })));

    useEffect(() => {
        if (isInView) {
            // Animate data points
            const timer = setTimeout(() => {
                setAnimatedData(chartData);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isInView]);

    return (
        <section ref={ref} className="intercom-bg-dark py-20 lg:py-32">
            <div className="intercom-container">
                <div className="grid lg:grid-cols-5 gap-12 items-center">
                    {/* Left: Text (30%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2"
                    >
                        <p className="intercom-label text-white/60 mb-4">PERFORMANCE</p>
                        <h2 className="intercom-h2 text-white mb-6">
                            Resolution rates that
                            <br />
                            keep climbing
                        </h2>
                        <p className="text-lg text-white/70 mb-8">
                            Fin gets smarter over time. Watch your AI resolution rates grow as it learns from every interaction.
                        </p>
                        <Link
                            href="#performance"
                            className="inline-flex items-center gap-2 text-white font-medium hover:underline underline-offset-4"
                        >
                            View performance metrics
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Right: Chart (70%) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <div className="intercom-card-dark p-6 relative overflow-hidden">
                            {/* Dotted pattern overlay */}
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                }}
                            />

                            {/* Chart Header */}
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <p className="text-white/60 text-sm">AI Resolution Rate</p>
                                    <p className="text-3xl font-bold text-white">
                                        {isInView ? '92' : '0'}
                                        <span className="text-[#FF6B2C]">%</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#00C853]">
                                    <span>+57% this year</span>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-64 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={animatedData}>
                                        <defs>
                                            <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#FF6B2C" stopOpacity={0.6} />
                                                <stop offset="100%" stopColor="#FF6B2C" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="month"
                                            stroke="rgba(255,255,255,0.3)"
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.3)"
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1E2A47',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                color: 'white',
                                            }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="resolution"
                                            stroke="#FF6B2C"
                                            strokeWidth={3}
                                            fill="url(#orangeGradient)"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
