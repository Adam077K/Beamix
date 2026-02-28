'use client';

import { motion } from 'framer-motion';
import { fadeInUp } from './shared';

interface TestimonialCardProps {
    quote: string;
    name: string;
    title: string;
    company: string;
    avatarUrl?: string;
    logoUrl?: string;
    variant?: 'dark' | 'light';
}

export default function TestimonialCard({
    quote,
    name,
    title,
    company,
    avatarUrl,
    logoUrl,
    variant = 'dark',
}: TestimonialCardProps) {
    const isDark = variant === 'dark';

    if (isDark) {
        // Dark variant (no photo, just quote and attribution)
        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="intercom-testimonial-dark"
            >
                <blockquote className="intercom-quote text-white mb-8">
                    "{quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt={`${company} logo`}
                            className="h-6 w-auto opacity-60"
                        />
                    )}
                    <div>
                        <p className="font-semibold text-white">{name}</p>
                        <p className="text-sm text-white/60">
                            {title}, {company}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Light variant (with photo, 2-column layout)
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="intercom-testimonial-light"
        >
            <div className="grid md:grid-cols-5 gap-8 items-center">
                {/* Photo */}
                {avatarUrl && (
                    <div className="md:col-span-2">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                            <img
                                src={avatarUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className={avatarUrl ? 'md:col-span-3' : 'md:col-span-5'}>
                    <blockquote className="intercom-quote text-gray-900 mb-8">
                        "{quote}"
                    </blockquote>

                    <div className="flex items-center gap-4">
                        {logoUrl && (
                            <img
                                src={logoUrl}
                                alt={`${company} logo`}
                                className="h-8 w-auto opacity-60"
                            />
                        )}
                        <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            <p className="text-sm text-gray-500">
                                {title}, {company}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
