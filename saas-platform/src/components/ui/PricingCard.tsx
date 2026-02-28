"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: PricingFeature[];
    ctaText: string;
    ctaHref: string;
    featured?: boolean;
    badge?: string;
}

export function PricingCard({
    name,
    price,
    period = "/חודש",
    description,
    features,
    ctaText,
    ctaHref,
    featured = false,
    badge,
}: PricingCardProps) {
    return (
        <motion.div
            className={`relative rounded-2xl p-8 ${featured
                    ? "pricing-card-featured"
                    : "pricing-card"
                }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={featured ? undefined : { y: -8 }}
        >
            {/* Badge */}
            {badge && (
                <div className="pricing-badge">
                    {badge}
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{name}</h3>
                <p className="text-foreground-secondary text-sm">{description}</p>
            </div>

            {/* Price */}
            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{price}</span>
                    {period && price !== "חינם" && (
                        <span className="text-foreground-secondary">{period}</span>
                    )}
                </div>
            </div>

            {/* CTA */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-8"
            >
                <Link
                    href={ctaHref}
                    className={`btn w-full py-3 ${featured ? "btn-primary" : "btn-cta"
                        }`}
                >
                    {ctaText}
                </Link>
            </motion.div>

            {/* Features */}
            <ul className="space-y-3">
                {features.map((feature, index) => (
                    <motion.li
                        key={index}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {feature.included ? (
                            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-success" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-foreground-muted/20 flex items-center justify-center">
                                <X className="w-3 h-3 text-foreground-muted" />
                            </div>
                        )}
                        <span
                            className={
                                feature.included
                                    ? "text-foreground-secondary"
                                    : "text-foreground-muted"
                            }
                        >
                            {feature.text}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}

// Pricing Section with multiple cards
interface PricingPlan {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: PricingFeature[];
    ctaText: string;
    ctaHref: string;
    featured?: boolean;
    badge?: string;
}

interface PricingSectionProps {
    plans: PricingPlan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
    return (
        <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, index) => (
                <PricingCard key={index} {...plan} />
            ))}
        </div>
    );
}
