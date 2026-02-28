"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Sparkles, Bot, MessageSquare, Globe, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedGroup, AnimatedItem } from "@/components/ui/AnimatedGroup";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                throw new Error(authError.message);
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "שגיאה בהתחברות");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
                {/* Background gradient mesh */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-70 pointer-events-none" />
                <div className="absolute inset-0 grid-pattern pointer-events-none" />

                {/* Animated orbs */}
                <motion.div
                    className="absolute top-20 right-10 w-40 h-40 orb orb-primary opacity-25"
                    animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 left-10 w-32 h-32 orb orb-accent opacity-20"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                />

                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <motion.div
                        className="flex justify-center mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div
                                className="h-12 w-12 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path d="M21.0883 0.0120844C21.2293 0.111436 21.438 0.201389 21.438 0.567917L21.4298 7.39903C17.1094 7.38829 12.8311 7.37218 8.5947 7.35069C7.83308 7.34532 7.45091 7.68232 7.4482 8.36167C7.42109 14.0301 7.41703 18.2485 7.436 21.0169C7.43653 21.0439 7.44242 21.0705 7.45333 21.0953C7.46424 21.12 7.47996 21.1423 7.4996 21.161C7.51923 21.1797 7.54239 21.1944 7.56775 21.2042C7.59311 21.2141 7.62018 21.2189 7.64741 21.2183C15.5347 21.1499 21.2103 15.1324 21.4298 7.39903L28.5446 7.39097C28.6334 7.39097 28.7187 7.42563 28.7818 7.48746C28.845 7.54929 28.881 7.63329 28.8821 7.72125L29 20.884V29H24.5969H21.3445V20.9732C21.3445 20.9732 21.0484 24.5079 17.6854 26.3819C14.3224 28.256 11.7903 28.3958 11.7903 28.3958L10.5706 28.6294L9.3509 28.6738C9.1151 28.7194 7.78429 28.6831 7.61895 28.6294C7.55457 28.6086 7.49876 28.5678 7.45991 28.5133C7.42105 28.4589 7.40125 28.3936 7.40348 28.3274C7.47666 26.104 7.46852 23.874 7.37908 21.6372C7.37366 21.4681 7.30861 21.358 7.18393 21.3069C7.05925 21.2559 6.91154 21.1821 6.50498 21.1458C6.09842 21.1096 6.16353 21.1096 5.85448 21.1096C3.93822 21.1552 1.98673 21.1619 0 21.1297L0.0040657 7.8582C0.0040657 7.62105 0.0987284 7.39361 0.26723 7.22592C0.435731 7.05823 0.664268 6.96403 0.902565 6.96403C2.50442 6.95866 4.18758 6.95195 5.95205 6.94389C6.61068 6.9412 6.9549 6.53171 6.98472 5.71542C6.99827 5.33144 7.00776 3.72972 7.01318 0.910279C7.01318 0.303427 7.37366 0 8.09463 0C12.4204 0.00268519 16.7517 0.00671401 21.0883 0.0120844Z" fill="#FCF9E8"/>
                                </svg>
                            </motion.div>
                            <span className="text-2xl font-bold">Quleex</span>
                        </Link>
                    </motion.div>

                    {/* Card */}
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.1,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                        }}
                    >
                        <AnimatedGroup variants="fadeUp" staggerChildren={0.05} delayChildren={0.2}>
                            <AnimatedItem>
                                <h1 className="text-2xl font-bold text-center mb-2">
                                    ברוך הבא בחזרה
                                </h1>
                            </AnimatedItem>
                            <AnimatedItem>
                                <p className="text-foreground-secondary text-center mb-8">
                                    התחבר לחשבון שלך
                                </p>
                            </AnimatedItem>
                        </AnimatedGroup>

                        {error && (
                            <motion.div
                                className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium mb-2"
                                >
                                    אימייל
                                </label>
                                <motion.input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                    className="input"
                                    dir="ltr"
                                    autoComplete="email"
                                    whileFocus={{ scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium mb-2"
                                >
                                    סיסמה
                                </label>
                                <div className="relative">
                                    <motion.input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="input pl-12"
                                        dir="ltr"
                                        autoComplete="current-password"
                                        whileFocus={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    />
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                                        aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>

                            <motion.div
                                className="flex items-center justify-between text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    href="/forgot-password"
                                    className="text-primary hover:text-primary-hover transition-colors font-medium"
                                >
                                    שכחת סיסמה?
                                </Link>
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="btn btn-cta w-full py-3 text-base"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        מתחבר...
                                    </>
                                ) : (
                                    <>
                                        התחבר
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <motion.div
                            className="mt-8 text-center text-sm text-foreground-secondary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            אין לך חשבון?{" "}
                            <Link
                                href="/signup"
                                className="text-primary hover:text-primary-hover font-semibold transition-colors"
                            >
                                הרשם עכשיו
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Decorative (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-background-secondary overflow-hidden">
                {/* Gradient mesh background */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-80" />
                <div className="absolute inset-0 grid-pattern" />

                {/* Animated Orbs */}
                <motion.div
                    className="absolute top-20 right-20 w-96 h-96 orb orb-primary opacity-30"
                    animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-40 left-20 w-72 h-72 orb orb-accent opacity-25"
                    animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                    className="absolute top-1/2 right-1/3 w-48 h-48 orb orb-purple opacity-30"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 2 }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    <motion.div
                        className="text-center max-w-md"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <motion.div
                            className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary-bg border border-primary/30 px-5 py-2.5 text-sm font-medium text-primary-light"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>AI Visibility Intelligence</span>
                        </motion.div>
                        <h2 className="text-4xl font-bold mb-6">
                            גלה איפה העסק שלך{" "}
                            <span className="text-gradient">מופיע ב-AI</span>
                        </h2>
                        <p className="text-foreground-secondary text-lg mb-8">
                            עקוב אחרי המיקום שלך בתוצאות של ChatGPT, Claude ו-Perplexity
                        </p>

                        {/* AI Platform Icons */}
                        <motion.div
                            className="flex justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-card-border"
                                whileHover={{ scale: 1.05, y: -2 }}
                            >
                                <Bot className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">ChatGPT</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-card-border"
                                whileHover={{ scale: 1.05, y: -2 }}
                            >
                                <MessageSquare className="h-5 w-5 text-accent" />
                                <span className="text-sm font-medium">Claude</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-card-border"
                                whileHover={{ scale: 1.05, y: -2 }}
                            >
                                <Globe className="h-5 w-5 text-purple" />
                                <span className="text-sm font-medium">Perplexity</span>
                            </motion.div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            className="mt-12 grid grid-cols-3 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary-light">120M+</p>
                                <p className="text-xs text-foreground-muted">שיחות AI</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-accent">10+</p>
                                <p className="text-xs text-foreground-muted">פלטפורמות</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple">95%</p>
                                <p className="text-xs text-foreground-muted">דיוק</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
