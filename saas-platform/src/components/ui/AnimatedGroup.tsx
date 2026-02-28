"use client";

import React from "react";
import { motion, Variants, HTMLMotionProps } from "framer-motion";

// Preset animation variants for common use cases
const presetVariants = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    fadeUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    },
    fadeDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
    },
    fadeLeft: {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
    },
    fadeRight: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    },
    blur: {
        hidden: { opacity: 0, filter: "blur(12px)" },
        visible: { opacity: 1, filter: "blur(0px)" },
    },
    blurUp: {
        hidden: { opacity: 0, filter: "blur(12px)", y: 20 },
        visible: { opacity: 1, filter: "blur(0px)", y: 0 },
    },
};

type PresetVariant = keyof typeof presetVariants;

interface AnimatedGroupProps extends Omit<HTMLMotionProps<"div">, "variants"> {
    children: React.ReactNode;
    className?: string;
    variants?: Variants | PresetVariant;
    staggerChildren?: number;
    delayChildren?: number;
}

interface AnimatedItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {
    children: React.ReactNode;
    className?: string;
    variants?: Variants | PresetVariant;
}

/**
 * AnimatedGroup - A container component for staggered entrance animations
 * 
 * @example
 * <AnimatedGroup variants="fadeUp" staggerChildren={0.1}>
 *   <AnimatedItem>First</AnimatedItem>
 *   <AnimatedItem>Second</AnimatedItem>
 * </AnimatedGroup>
 */
export function AnimatedGroup({
    children,
    className,
    variants = "fadeUp",
    staggerChildren = 0.08,
    delayChildren = 0.1,
    ...props
}: AnimatedGroupProps) {
    const resolvedVariants: Variants =
        typeof variants === "string" ? presetVariants[variants] : variants;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren,
                delayChildren,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={className}
            {...props}
        >
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;

                // If child is already an AnimatedItem, pass variants
                if ((child.type as React.ComponentType)?.displayName === "AnimatedItem") {
                    return React.cloneElement(child as React.ReactElement<AnimatedItemProps>, {
                        variants: (child.props as AnimatedItemProps).variants || resolvedVariants,
                    });
                }

                // Wrap non-AnimatedItem children
                return (
                    <motion.div variants={resolvedVariants}>
                        {child}
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

/**
 * AnimatedItem - Individual animatable item within AnimatedGroup
 */
export function AnimatedItem({
    children,
    className,
    variants = "fadeUp",
    ...props
}: AnimatedItemProps) {
    const resolvedVariants: Variants =
        typeof variants === "string" ? presetVariants[variants] : variants;

    return (
        <motion.div
            variants={resolvedVariants}
            className={className}
            transition={{
                type: "spring",
                bounce: 0.3,
                duration: 0.8,
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

AnimatedItem.displayName = "AnimatedItem";

export { presetVariants };
