"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Search,
    FileText,
    Star,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "דשבורד", href: "/dashboard", icon: LayoutDashboard },
    { name: "שאילתות", href: "/dashboard/queries", icon: Search },
    { name: "תוכן", href: "/dashboard/content", icon: FileText },
    { name: "ביקורות", href: "/dashboard/reviews", icon: Star },
];

const secondaryNav = [
    { name: "הגדרות", href: "/settings", icon: Settings },
    { name: "חיוב", href: "/settings/billing", icon: CreditCard },
];

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const NavLink = ({
        item,
        index,
    }: {
        item: { name: string; href: string; icon: React.ElementType };
        index: number;
    }) => {
        const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
            >
                <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                        "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                        isActive
                            ? "text-white"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    {/* Active indicator gradient with animation */}
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                className="absolute inset-0 rounded-xl bg-gradient-primary opacity-90"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                layoutId="activeNavIndicator"
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative z-10 flex items-center gap-3 w-full">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                        </motion.div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <ChevronRight className="h-4 w-4 opacity-60" />
                            </motion.div>
                        )}
                    </div>
                </Link>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "fixed top-0 right-0 z-50 h-full w-72 transform lg:translate-x-0",
                    "bg-[#0a0a12] border-l border-white/5"
                )}
                initial={false}
                animate={{
                    x: sidebarOpen ? 0 : "100%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    // On large screens, always show sidebar
                    transform: undefined,
                }}
            >
                <style jsx global>{`
                    @media (min-width: 1024px) {
                        aside {
                            transform: translateX(0) !important;
                        }
                    }
                `}</style>
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <motion.div
                        className="flex h-20 items-center justify-between px-6 border-b border-white/5"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <motion.div
                                className="h-10 w-10 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path d="M21.0883 0.0120844C21.2293 0.111436 21.438 0.201389 21.438 0.567917L21.4298 7.39903C17.1094 7.38829 12.8311 7.37218 8.5947 7.35069C7.83308 7.34532 7.45091 7.68232 7.4482 8.36167C7.42109 14.0301 7.41703 18.2485 7.436 21.0169C7.43653 21.0439 7.44242 21.0705 7.45333 21.0953C7.46424 21.12 7.47996 21.1423 7.4996 21.161C7.51923 21.1797 7.54239 21.1944 7.56775 21.2042C7.59311 21.2141 7.62018 21.2189 7.64741 21.2183C15.5347 21.1499 21.2103 15.1324 21.4298 7.39903L28.5446 7.39097C28.6334 7.39097 28.7187 7.42563 28.7818 7.48746C28.845 7.54929 28.881 7.63329 28.8821 7.72125L29 20.884V29H24.5969H21.3445V20.9732C21.3445 20.9732 21.0484 24.5079 17.6854 26.3819C14.3224 28.256 11.7903 28.3958 11.7903 28.3958L10.5706 28.6294L9.3509 28.6738C9.1151 28.7194 7.78429 28.6831 7.61895 28.6294C7.55457 28.6086 7.49876 28.5678 7.45991 28.5133C7.42105 28.4589 7.40125 28.3936 7.40348 28.3274C7.47666 26.104 7.46852 23.874 7.37908 21.6372C7.37366 21.4681 7.30861 21.358 7.18393 21.3069C7.05925 21.2559 6.91154 21.1821 6.50498 21.1458C6.09842 21.1096 6.16353 21.1096 5.85448 21.1096C3.93822 21.1552 1.98673 21.1619 0 21.1297L0.0040657 7.8582C0.0040657 7.62105 0.0987284 7.39361 0.26723 7.22592C0.435731 7.05823 0.664268 6.96403 0.902565 6.96403C2.50442 6.95866 4.18758 6.95195 5.95205 6.94389C6.61068 6.9412 6.9549 6.53171 6.98472 5.71542C6.99827 5.33144 7.00776 3.72972 7.01318 0.910279C7.01318 0.303427 7.37366 0 8.09463 0C12.4204 0.00268519 16.7517 0.00671401 21.0883 0.0120844Z" fill="#FCF9E8"/>
                                </svg>
                            </motion.div>
                            <div>
                                <span className="text-xl font-bold text-white">Quleex</span>
                                <p className="text-xs text-slate-500">AI Visibility</p>
                            </div>
                        </Link>
                        <motion.button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.button>
                    </motion.div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <div className="space-y-1">
                            {navigation.map((item, index) => (
                                <NavLink key={item.href} item={item} index={index} />
                            ))}
                        </div>

                        <motion.div
                            className="pt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                                הגדרות
                            </p>
                            <div className="space-y-1">
                                {secondaryNav.map((item, index) => (
                                    <NavLink key={item.href} item={item} index={index + navigation.length} />
                                ))}
                            </div>
                        </motion.div>
                    </nav>

                    {/* Pro Badge */}
                    <motion.div
                        className="px-4 pb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.div
                            className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple/20 border border-primary/20"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-white">שדרג ל-Pro</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                                קבל גישה לכל התכונות המתקדמות
                            </p>
                            <motion.button
                                className="w-full btn btn-primary text-sm py-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                שדרג עכשיו
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* User Section */}
                    <motion.div
                        className="p-4 border-t border-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <motion.button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                            whileHover={{ x: -4 }}
                        >
                            <LogOut className="h-5 w-5" />
                            <span>התנתק</span>
                        </motion.button>
                    </motion.div>
                </div>
            </motion.aside>

            {/* Mobile header */}
            <motion.div
                className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center">
                        <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M21.0883 0.0120844C21.2293 0.111436 21.438 0.201389 21.438 0.567917L21.4298 7.39903C17.1094 7.38829 12.8311 7.37218 8.5947 7.35069C7.83308 7.34532 7.45091 7.68232 7.4482 8.36167C7.42109 14.0301 7.41703 18.2485 7.436 21.0169C7.43653 21.0439 7.44242 21.0705 7.45333 21.0953C7.46424 21.12 7.47996 21.1423 7.4996 21.161C7.51923 21.1797 7.54239 21.1944 7.56775 21.2042C7.59311 21.2141 7.62018 21.2189 7.64741 21.2183C15.5347 21.1499 21.2103 15.1324 21.4298 7.39903L28.5446 7.39097C28.6334 7.39097 28.7187 7.42563 28.7818 7.48746C28.845 7.54929 28.881 7.63329 28.8821 7.72125L29 20.884V29H24.5969H21.3445V20.9732C21.3445 20.9732 21.0484 24.5079 17.6854 26.3819C14.3224 28.256 11.7903 28.3958 11.7903 28.3958L10.5706 28.6294L9.3509 28.6738C9.1151 28.7194 7.78429 28.6831 7.61895 28.6294C7.55457 28.6086 7.49876 28.5678 7.45991 28.5133C7.42105 28.4589 7.40125 28.3936 7.40348 28.3274C7.47666 26.104 7.46852 23.874 7.37908 21.6372C7.37366 21.4681 7.30861 21.358 7.18393 21.3069C7.05925 21.2559 6.91154 21.1821 6.50498 21.1458C6.09842 21.1096 6.16353 21.1096 5.85448 21.1096C3.93822 21.1552 1.98673 21.1619 0 21.1297L0.0040657 7.8582C0.0040657 7.62105 0.0987284 7.39361 0.26723 7.22592C0.435731 7.05823 0.664268 6.96403 0.902565 6.96403C2.50442 6.95866 4.18758 6.95195 5.95205 6.94389C6.61068 6.9412 6.9549 6.53171 6.98472 5.71542C6.99827 5.33144 7.00776 3.72972 7.01318 0.910279C7.01318 0.303427 7.37366 0 8.09463 0C12.4204 0.00268519 16.7517 0.00671401 21.0883 0.0120844Z" fill="#FCF9E8"/>
                        </svg>
                    </div>
                    <span className="font-bold">Quleex</span>
                </Link>
                <motion.button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-foreground-secondary hover:text-foreground rounded-lg hover:bg-background-secondary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Menu className="h-6 w-6" />
                </motion.button>
            </motion.div>

            {/* Main content */}
            <main className="lg:mr-72 min-h-screen">
                <div className="pt-16 lg:pt-0">{children}</div>
            </main>
        </div>
    );
}
