"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BounceCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverScale?: number;
    hoverRotation?: number;
}

/**
 * BounceCard - Interactive card with bouncy hover animation
 * 
 * @example
 * <BounceCard className="p-6 bg-card">
 *   <h3>Feature Title</h3>
 *   <p>Description</p>
 * </BounceCard>
 */
export function BounceCard({
    children,
    className,
    hoverScale = 1.02,
    hoverRotation = 1,
    ...props
}: BounceCardProps) {
    return (
        <motion.div
            whileHover={{
                scale: hoverScale,
                rotate: hoverRotation,
                y: -8,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
            }}
            className={cn(
                "relative overflow-hidden rounded-2xl cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface FeatureCardProps extends HTMLMotionProps<"div"> {
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient?: "primary" | "accent" | "purple";
    className?: string;
}

/**
 * FeatureCard - Premium feature card with gradient icon container
 */
export function FeatureCard({
    title,
    description,
    icon,
    gradient = "primary",
    className,
    ...props
}: FeatureCardProps) {
    const gradientClasses = {
        primary: "from-primary/20 via-primary/10 to-transparent",
        accent: "from-accent/20 via-accent/10 to-transparent",
        purple: "from-purple/20 via-purple/10 to-transparent",
    };

    const iconClasses = {
        primary: "bg-primary/15 text-primary border-primary/20",
        accent: "bg-accent/15 text-accent border-accent/20",
        purple: "bg-purple/15 text-purple border-purple/20",
    };

    return (
        <BounceCard
            className={cn(
                "card card-glow p-8 group",
                className
            )}
            {...props}
        >
            {/* Gradient overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    gradientClasses[gradient]
                )}
            />

            {/* Content */}
            <div className="relative z-10">
                <motion.div
                    className={cn(
                        "h-14 w-14 rounded-xl flex items-center justify-center mb-6 border",
                        iconClasses[gradient]
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    {icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-foreground-secondary leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Hover glow effect */}
            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, var(--${gradient === "primary" ? "primary" : gradient}-glow) 0%, transparent 50%)`,
                }}
            />
        </BounceCard>
    );
}
