'use client';

import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: ButtonVariant;
    children: ReactNode;
    icon?: boolean;
    className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[var(--intercom-blue)] text-white hover:bg-[#1e40af] shadow-lg hover:shadow-xl',
    secondary: 'bg-transparent border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm',
    ghost: 'bg-transparent text-[var(--intercom-blue)] hover:underline underline-offset-4',
};

export default function Button({
    variant = 'primary',
    children,
    icon = false,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-lg font-semibold text-sm
        transition-all duration-200 cursor-pointer
        ${variantStyles[variant]}
        ${className}
      `}
            {...props}
        >
            {children}
            {icon && <ArrowRight className="w-4 h-4" />}
        </motion.button>
    );
}
