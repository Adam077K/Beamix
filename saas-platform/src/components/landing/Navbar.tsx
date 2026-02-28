'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';

interface NavLink {
    label: string;
    href: string;
    hasDropdown: boolean;
}

const navLinks: NavLink[] = [
    { label: 'Platform', href: '#platform', hasDropdown: true },
    { label: 'Resources', href: '#resources', hasDropdown: true },
    { label: 'Pricing', href: '#pricing', hasDropdown: false },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-black/60 backdrop-blur-xl border-b border-white/10'
                    : 'bg-transparent'
            }`}
        >
            <nav className="max-w-[1400px] mx-auto px-6">
                <div className="flex items-center h-16">
                    {/* Logo and Brand */}
                    <Link href="/" className="flex items-center gap-2">
                        <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.0883 0.0120844C21.2293 0.111436 21.438 0.201389 21.438 0.567917L21.4298 7.39903C17.1094 7.38829 12.8311 7.37218 8.5947 7.35069C7.83308 7.34532 7.45091 7.68232 7.4482 8.36167C7.42109 14.0301 7.41703 18.2485 7.436 21.0169C7.43653 21.0439 7.44242 21.0705 7.45333 21.0953C7.46424 21.12 7.47996 21.1423 7.4996 21.161C7.51923 21.1797 7.54239 21.1944 7.56775 21.2042C7.59311 21.2141 7.62018 21.2189 7.64741 21.2183C15.5347 21.1499 21.2103 15.1324 21.4298 7.39903L28.5446 7.39097C28.6334 7.39097 28.7187 7.42563 28.7818 7.48746C28.845 7.54929 28.881 7.63329 28.8821 7.72125L29 20.884V29H24.5969H21.3445V20.9732C21.3445 20.9732 21.0484 24.5079 17.6854 26.3819C14.3224 28.256 11.7903 28.3958 11.7903 28.3958L10.5706 28.6294L9.3509 28.6738C9.1151 28.7194 7.78429 28.6831 7.61895 28.6294C7.55457 28.6086 7.49876 28.5678 7.45991 28.5133C7.42105 28.4589 7.40125 28.3936 7.40348 28.3274C7.47666 26.104 7.46852 23.874 7.37908 21.6372C7.37366 21.4681 7.30861 21.358 7.18393 21.3069C7.05925 21.2559 6.91154 21.1821 6.50498 21.1458C6.09842 21.1096 6.16353 21.1096 5.85448 21.1096C3.93822 21.1552 1.98673 21.1619 0 21.1297L0.0040657 7.8582C0.0040657 7.62105 0.0987284 7.39361 0.26723 7.22592C0.435731 7.05823 0.664268 6.96403 0.902565 6.96403C2.50442 6.95866 4.18758 6.95195 5.95205 6.94389C6.61068 6.9412 6.9549 6.53171 6.98472 5.71542C6.99827 5.33144 7.00776 3.72972 7.01318 0.910279C7.01318 0.303427 7.37366 0 8.09463 0C12.4204 0.00268519 16.7517 0.00671401 21.0883 0.0120844Z" fill="#FCF9E8"/>
                        </svg>
                        <span className="text-white font-bold text-sm tracking-widest uppercase">
                            QULEEX
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-1 ml-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                {link.label}
                                {link.hasDropdown && (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden lg:flex items-center gap-5 ml-auto">
                        <Link
                            href="#demo"
                            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                        >
                            Request a Demo
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm font-medium text-white border border-emerald-500/70 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all px-5 py-2 rounded-full"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 text-white"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden overflow-hidden bg-black/80 backdrop-blur-xl border-t border-white/10 rounded-b-2xl"
                        >
                            <div className="py-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="flex items-center gap-1 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                        {link.hasDropdown && (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </Link>
                                ))}
                                <div className="pt-4 px-4 space-y-3 border-t border-white/10 mt-4">
                                    <Link
                                        href="#demo"
                                        className="block text-center text-white/80 hover:text-white transition-colors py-3"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Request a Demo
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="block text-center text-white/80 hover:text-white transition-colors py-3"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="block text-center text-white border border-emerald-500/70 hover:border-emerald-400 transition-colors py-3 rounded-full"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}
