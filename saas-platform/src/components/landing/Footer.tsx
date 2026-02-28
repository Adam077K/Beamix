'use client';

import Link from 'next/link';
import { footerLinks } from './shared';

export default function Footer() {
    const socialLinks = [
        { name: 'Twitter', href: '#twitter' },
        { name: 'LinkedIn', href: '#linkedin' },
        { name: 'YouTube', href: '#youtube' },
        { name: 'Instagram', href: '#instagram' },
    ];

    return (
        <footer className="intercom-footer">
            <div className="intercom-container">
                {/* Main Footer Grid */}
                <div className="intercom-footer-grid mb-12">
                    {/* Logo & Social */}
                    <div className="col-span-full lg:col-span-1 mb-8 lg:mb-0">
                        <Link href="/" className="flex items-center gap-2 text-white mb-6">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                <span className="text-[#1E2A47] font-bold text-lg">I</span>
                            </div>
                            <span className="font-semibold text-lg">intercom</span>
                        </Link>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                    aria-label={social.name}
                                >
                                    <span className="text-xs text-white">{social.name[0]}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="intercom-footer-title">{category}</h4>
                            <ul className="space-y-1">
                                {links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="intercom-footer-link">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Legal Bar */}
                <div className="intercom-legal-bar">
                    <p>© 2025 Intercom, Inc. All rights reserved.</p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="#terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#security" className="hover:text-white transition-colors">Security</Link>
                        <Link href="#cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
