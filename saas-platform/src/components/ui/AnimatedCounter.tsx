"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
    value: number;
    direction?: "up" | "down";
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimalPlaces?: number;
}

/**
 * AnimatedCounter - Animated number counter with spring physics
 * 
 * @example
 * <AnimatedCounter value={150} suffix="+" />
 */
export function AnimatedCounter({
    value,
    direction = "up",
    duration = 2,
    className = "",
    prefix = "",
    suffix = "",
    decimalPlaces = 0,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "up" ? 0 : value);
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
        duration: duration * 1000,
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [displayValue, setDisplayValue] = useState(direction === "up" ? 0 : value);

    useEffect(() => {
        if (isInView) {
            motionValue.set(direction === "up" ? value : 0);
        }
    }, [motionValue, isInView, value, direction]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            setDisplayValue(Number(latest.toFixed(decimalPlaces)));
        });
        return unsubscribe;
    }, [springValue, decimalPlaces]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
        </span>
    );
}

interface AnimatedPercentageProps {
    value: number;
    className?: string;
    duration?: number;
}

/**
 * AnimatedPercentage - Animated percentage display
 */
export function AnimatedPercentage({
    value,
    className = "",
    duration = 2,
}: AnimatedPercentageProps) {
    return (
        <AnimatedCounter
            value={value}
            suffix="%"
            className={className}
            duration={duration}
        />
    );
}
