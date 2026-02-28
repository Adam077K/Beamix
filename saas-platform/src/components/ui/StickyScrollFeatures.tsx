"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface FeatureItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    image?: string;
    gradient?: "primary" | "accent" | "purple";
}

interface StickyScrollFeaturesProps {
    features: FeatureItem[];
}

export function StickyScrollFeatures({ features }: StickyScrollFeaturesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <div ref={containerRef} className="relative">
            <div className="sticky-scroll-container grid lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Left Side - Scrolling Content */}
                <div className="space-y-32 py-20">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            feature={feature}
                            index={index}
                            total={features.length}
                            scrollProgress={scrollYProgress}
                        />
                    ))}
                </div>

                {/* Right Side - Sticky Visual */}
                <div className="hidden lg:block">
                    <div className="sticky-scroll-content">
                        <StickyVisual
                            features={features}
                            scrollProgress={scrollYProgress}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface FeatureCardProps {
    feature: FeatureItem;
    index: number;
    total: number;
    scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function FeatureCard({ feature, index, total, scrollProgress }: FeatureCardProps) {
    const gradientClasses = {
        primary: "icon-container-primary",
        accent: "icon-container-accent",
        purple: "icon-container-purple",
    };

    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            {/* Step indicator */}
            <div className="absolute -right-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary to-primary/50 hidden lg:block" />
            <motion.div
                className="absolute -right-6 top-8 w-5 h-5 rounded-full bg-primary border-4 border-background hidden lg:block"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />

            {/* Content */}
            <div className="card pr-8">
                <div
                    className={`icon-container ${gradientClasses[feature.gradient || "primary"]
                        } w-14 h-14 mb-6`}
                >
                    {feature.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-foreground-secondary leading-relaxed text-lg">
                    {feature.description}
                </p>

                {/* Mobile Image */}
                {feature.image && (
                    <div className="mt-6 lg:hidden">
                        <div className="dashboard-preview">
                            <div className="dashboard-preview-header">
                                <div className="dashboard-preview-dot bg-danger" />
                                <div className="dashboard-preview-dot bg-warning" />
                                <div className="dashboard-preview-dot bg-success" />
                            </div>
                            <div className="p-4 bg-background-secondary min-h-[200px] flex items-center justify-center">
                                <span className="text-foreground-muted">{feature.title}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface StickyVisualProps {
    features: FeatureItem[];
    scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function StickyVisual({ features, scrollProgress }: StickyVisualProps) {
    // Transform scroll progress to active index
    const activeIndex = useTransform(
        scrollProgress,
        [0, 1],
        [0, features.length - 1]
    );

    return (
        <motion.div
            className="dashboard-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            {/* Browser Header */}
            <div className="dashboard-preview-header">
                <div className="dashboard-preview-dot bg-danger" />
                <div className="dashboard-preview-dot bg-warning" />
                <div className="dashboard-preview-dot bg-success" />
                <div className="flex-1 mx-4">
                    <div className="bg-background-tertiary rounded-md px-3 py-1 text-xs text-foreground-muted">
                        app.quleex.com
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 bg-background-secondary min-h-[500px] relative overflow-hidden">
                {/* Animated Feature Visuals */}
                {features.map((feature, index) => (
                    <FeatureVisual
                        key={index}
                        feature={feature}
                        index={index}
                        scrollProgress={scrollProgress}
                        total={features.length}
                    />
                ))}

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 grid-pattern pointer-events-none opacity-50" />
            </div>
        </motion.div>
    );
}

interface FeatureVisualProps {
    feature: FeatureItem;
    index: number;
    scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
    total: number;
}

function FeatureVisual({ feature, index, scrollProgress, total }: FeatureVisualProps) {
    const segmentSize = 1 / total;
    const start = index * segmentSize;
    const end = (index + 1) * segmentSize;

    const opacity = useTransform(
        scrollProgress,
        [start, start + 0.1, end - 0.1, end],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollProgress,
        [start, start + 0.1, end - 0.1, end],
        [30, 0, 0, -30]
    );

    const gradientColors = {
        primary: "from-primary/20 to-primary/5",
        accent: "from-accent/20 to-accent/5",
        purple: "from-purple/20 to-purple/5",
    };

    return (
        <motion.div
            className="absolute inset-6 flex flex-col items-center justify-center"
            style={{ opacity, y }}
        >
            {/* Mock Dashboard UI */}
            <div className="w-full space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColors[feature.gradient || "primary"]
                                } flex items-center justify-center`}
                        >
                            {feature.icon}
                        </div>
                        <div>
                            <p className="font-semibold">{feature.title}</p>
                            <p className="text-xs text-foreground-muted">Quleex Dashboard</p>
                        </div>
                    </div>
                    <div className="badge badge-success">פעיל</div>
                </div>

                {/* Mock Chart/Content Area */}
                <div className="card-solid rounded-xl p-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientColors[feature.gradient || "primary"]
                                } mx-auto mb-4 flex items-center justify-center`}
                        >
                            <div className="w-10 h-10">{feature.icon}</div>
                        </div>
                        <p className="text-foreground-secondary text-sm">{feature.title}</p>
                    </div>
                </div>

                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card-solid rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-primary">{95 + i}%</p>
                            <p className="text-xs text-foreground-muted">מדד {i}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Simple Feature List Alternative
interface SimpleFeatureProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient?: "primary" | "accent" | "purple";
}

export function SimpleFeature({
    icon,
    title,
    description,
    gradient = "primary",
}: SimpleFeatureProps) {
    const gradientClasses = {
        primary: "icon-container-primary",
        accent: "icon-container-accent",
        purple: "icon-container-purple",
    };

    return (
        <motion.div
            className="card text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, borderColor: "var(--primary)" }}
            transition={{ duration: 0.3 }}
        >
            <div
                className={`icon-container ${gradientClasses[gradient]} w-16 h-16 mx-auto mb-6`}
            >
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-foreground-secondary">{description}</p>
        </motion.div>
    );
}
