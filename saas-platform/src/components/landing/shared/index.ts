/**
 * Shared utilities for Intercom Landing Page components
 */

// Placeholder image helpers
export const getPlaceholderImage = (
    width: number,
    height: number,
    text?: string,
    bgColor: string = '1E2A47',
    textColor: string = 'FFFFFF'
): string => {
    const label = text ? `?text=${encodeURIComponent(text)}` : '';
    return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}${label}`;
};

export const getRandomImage = (width: number, height: number, seed?: number): string => {
    const seedParam = seed ? `?random=${seed}` : '';
    return `https://picsum.photos/${width}/${height}${seedParam}`;
};

// Logo placeholders for customer logos
export const companyLogos = [
    { name: 'Amazon', width: 100, height: 32 },
    { name: 'Atlassian', width: 120, height: 28 },
    { name: 'Microsoft', width: 110, height: 24 },
    { name: 'Shopify', width: 100, height: 28 },
    { name: 'Notion', width: 90, height: 26 },
    { name: 'Amplitude', width: 120, height: 24 },
    { name: 'Coda', width: 70, height: 28 },
    { name: 'Deel', width: 60, height: 24 },
    { name: 'Monzo', width: 90, height: 26 },
    { name: 'TravelPerk', width: 110, height: 28 },
] as const;

// Testimonials data
export interface Testimonial {
    id: string;
    quote: string;
    name: string;
    title: string;
    company: string;
    avatarUrl?: string;
    logoUrl?: string;
    variant: 'dark' | 'light';
}

export const testimonials: Testimonial[] = [
    {
        id: 'anthropic',
        quote: 'Fin is handling 50% of our support conversations, and the quality is exceptional.',
        name: 'Sarah Chen',
        title: 'Head of Customer Support',
        company: 'Anthropic',
        variant: 'dark',
    },
    {
        id: 'lightspeed',
        quote: 'The helpdesk transformed how we handle customer inquiries. Response times dropped by 60%.',
        name: 'Michael Torres',
        title: 'VP of Operations',
        company: 'Lightspeed',
        avatarUrl: getRandomImage(300, 400, 42),
        variant: 'light',
    },
    {
        id: 'travelperk',
        quote: 'One platform, complete visibility. Our team productivity increased dramatically.',
        name: 'Elena Rodriguez',
        title: 'Director of Customer Experience',
        company: 'TravelPerk',
        avatarUrl: getRandomImage(300, 400, 88),
        variant: 'light',
    },
];

// Capability tabs data
export type CapabilityTab = 'TRAIN' | 'TEST' | 'DEPLOY' | 'ANALYZE';

export interface CapabilityContent {
    headline: string;
    description: string;
    mockupUrl: string;
}

export const capabilityTabs: Record<CapabilityTab, CapabilityContent> = {
    TRAIN: {
        headline: 'Train Fin on your knowledge',
        description: 'Upload your help center, docs, and past conversations. Fin learns your unique voice and expertise.',
        mockupUrl: getPlaceholderImage(600, 400, 'Training+Interface'),
    },
    TEST: {
        headline: 'Test before you deploy',
        description: 'Preview responses in a sandbox environment. Fine-tune answers until they match your standards.',
        mockupUrl: getPlaceholderImage(600, 400, 'Testing+Sandbox'),
    },
    DEPLOY: {
        headline: 'Deploy across all channels',
        description: 'Go live on chat, email, and social media with one click. Fin adapts to each channel seamlessly.',
        mockupUrl: getPlaceholderImage(600, 400, 'Deployment+Dashboard'),
    },
    ANALYZE: {
        headline: 'Analyze and improve',
        description: 'Track resolution rates, identify gaps, and continuously improve Fin\'s performance.',
        mockupUrl: getPlaceholderImage(600, 400, 'Analytics+Charts'),
    },
};

// Feature icons mapping (using Lucide icon names)
export const featureIcons = {
    productivity: 'Zap',
    usability: 'Layout',
    optimization: 'TrendingUp',
    ai: 'Bot',
    security: 'Shield',
    integration: 'Puzzle',
} as const;

// Suite benefits data
export interface SuiteBenefit {
    title: string;
    description: string;
    illustrationUrl: string;
}

export const suiteBenefits: SuiteBenefit[] = [
    {
        title: 'Unified inbox',
        description: 'All channels, one view. Email, chat, social – handled together.',
        illustrationUrl: getPlaceholderImage(280, 180, 'Inbox', 'E8E8E8', '4B5563'),
    },
    {
        title: 'AI-first approach',
        description: 'Fin handles routine queries so your team focuses on complex issues.',
        illustrationUrl: getPlaceholderImage(280, 180, 'AI', 'E8E8E8', '4B5563'),
    },
    {
        title: 'Complete context',
        description: 'Customer history, product usage, and prior conversations at a glance.',
        illustrationUrl: getPlaceholderImage(280, 180, 'Context', 'E8E8E8', '4B5563'),
    },
    {
        title: 'Powerful reporting',
        description: 'Track performance, identify trends, and make data-driven decisions.',
        illustrationUrl: getPlaceholderImage(280, 180, 'Reports', 'E8E8E8', '4B5563'),
    },
];

// Navigation links
export const navLinks = [
    { label: 'Product', href: '#product', hasDropdown: true },
    { label: 'Solutions', href: '#solutions', hasDropdown: true },
    { label: 'Pricing', href: '#pricing', hasDropdown: false },
    { label: 'Resources', href: '#resources', hasDropdown: true },
] as const;

// Footer links organized by column
export const footerLinks = {
    'Use Cases': [
        'AI Customer Service',
        'Proactive Support',
        'Omnichannel',
        'Self-Service',
        'Reporting',
    ],
    Product: [
        'Fin AI Agent',
        'Helpdesk',
        'Messenger',
        'Outbound',
        'Mobile Apps',
    ],
    Resources: [
        'Blog',
        'Help Center',
        'Academy',
        'Community',
        'Webinars',
    ],
    Company: [
        'About',
        'Careers',
        'Press',
        'Security',
        'Contact',
    ],
} as const;

// Animation variants for Framer Motion
export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' as const }
    },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' as const }
    },
};
