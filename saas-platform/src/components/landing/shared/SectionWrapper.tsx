'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type BackgroundVariant = 'dark' | 'white' | 'gray' | 'hero' | 'navy';

interface SectionWrapperProps {
    children: ReactNode;
    background?: BackgroundVariant;
    className?: string;
    id?: string;
    fullWidth?: boolean;
}

const bgStyles: Record<BackgroundVariant, string> = {
    dark: 'bg-[var(--intercom-bg-dark)]',
    white: 'bg-[var(--intercom-bg-white)]',
    gray: 'bg-[var(--intercom-bg-gray)]',
    hero: 'bg-[var(--intercom-bg-hero)]',
    navy: 'bg-[var(--intercom-bg-dark)]',
};

const textStyles: Record<BackgroundVariant, string> = {
    dark: 'text-white',
    white: 'text-[var(--intercom-text-black)]',
    gray: 'text-[var(--intercom-text-black)]',
    hero: 'text-white',
    navy: 'text-white',
};

export default function SectionWrapper({
    children,
    background = 'white',
    className = '',
    id,
    fullWidth = false,
}: SectionWrapperProps) {
    return (
        <motion.section
            id={id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className={`
        ${bgStyles[background]}
        ${textStyles[background]}
        py-[var(--intercom-section-py)]
        ${className}
      `}
        >
            <div
                className={
                    fullWidth
                        ? 'w-full'
                        : 'max-w-[var(--intercom-container-max)] mx-auto px-6 lg:px-20'
                }
            >
                {children}
            </div>
        </motion.section>
    );
}
