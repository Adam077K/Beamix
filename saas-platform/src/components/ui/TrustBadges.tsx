"use client";

import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle, Award } from "lucide-react";

// Trust Badge Component
interface TrustBadgeProps {
    icon: React.ReactNode;
    text: string;
}

export function TrustBadge({ icon, text }: TrustBadgeProps) {
    return (
        <motion.div
            className="trust-badge"
            whileHover={{ scale: 1.05, borderColor: "var(--primary-glow)" }}
        >
            {icon}
            <span>{text}</span>
        </motion.div>
    );
}

// Stats Component
interface StatItemProps {
    value: string;
    label: string;
}

export function StatItem({ value, label }: StatItemProps) {
    return (
        <div className="text-center">
            <motion.p
                className="text-3xl md:text-4xl font-bold text-primary-light"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                {value}
            </motion.p>
            <p className="text-foreground-secondary text-sm mt-1">{label}</p>
        </div>
    );
}

// Logo Placeholder (for customer logos)
interface LogoPlaceholderProps {
    name: string;
}

export function LogoPlaceholder({ name }: LogoPlaceholderProps) {
    return (
        <motion.div
            className="trust-logo px-6 py-3 bg-background-tertiary/50 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
        >
            <span className="text-lg font-semibold text-foreground-muted">{name}</span>
        </motion.div>
    );
}

// Trust Badges Section
export function TrustBadgesSection() {
    const badges = [
        { icon: <Shield className="w-4 h-4 text-success" />, text: "SOC 2 Type II" },
        { icon: <Lock className="w-4 h-4 text-primary" />, text: "GDPR Compliant" },
        { icon: <CheckCircle className="w-4 h-4 text-accent" />, text: "SSL Encrypted" },
        { icon: <Award className="w-4 h-4 text-purple" />, text: "Enterprise Ready" },
    ];

    return (
        <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {badges.map((badge, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                >
                    <TrustBadge {...badge} />
                </motion.div>
            ))}
        </motion.div>
    );
}

// Stats Section
export function StatsSection() {
    const stats = [
        { value: "120M+", label: "שיחות AI מנותחות" },
        { value: "10+", label: "פלטפורמות AI" },
        { value: "99.9%", label: "זמינות המערכת" },
        { value: "24/7", label: "ניטור רציף" },
    ];

    return (
        <motion.div
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                >
                    <StatItem {...stat} />
                </motion.div>
            ))}
        </motion.div>
    );
}

// Full Social Proof Section
export function SocialProofSection() {
    const logos = [
        "חברה 1",
        "חברה 2",
        "חברה 3",
        "חברה 4",
        "חברה 5",
    ];

    return (
        <section className="py-16 px-4 border-y border-border">
            <div className="mx-auto max-w-6xl">
                {/* Headline */}
                <motion.p
                    className="text-center text-foreground-secondary mb-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <span className="text-foreground font-semibold">מסטארטאפים ועד חברות Enterprise</span>
                    {" — "}
                    הם משפרים את הנראות שלהם ב-AI עם Quleex
                </motion.p>

                {/* Customer Logos */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-6 mb-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    {logos.map((logo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <LogoPlaceholder name={logo} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust Badges */}
                <TrustBadgesSection />
            </div>
        </section>
    );
}
