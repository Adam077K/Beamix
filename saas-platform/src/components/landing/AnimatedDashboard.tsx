'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowUp, TrendingUp } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Phase Data
   ═══════════════════════════════════════════════ */

interface PhaseInfo {
    step: string;
    title: string;
    gaugeValue: number;
    gaugeDelta?: string;
}

const phases: PhaseInfo[] = [
    { step: '01', title: 'Track AI Visibility', gaugeValue: 32 },
    { step: '02', title: 'Take Precise Actions', gaugeValue: 42, gaugeDelta: '+10%' },
    { step: '02', title: 'Take Precise Actions', gaugeValue: 65, gaugeDelta: '+33%' },
    { step: '03', title: 'Monitor Impact', gaugeValue: 65, gaugeDelta: '+33%' },
];

const PHASE_DURATION = 4500;

/* ═══════════════════════════════════════════════
   GaugeChart — Premium SVG semi-circular gauge
   ═══════════════════════════════════════════════ */

function GaugeChart({ value, delta }: { value: number; delta?: string }) {
    const prevValue = useRef(value);
    const [animatedValue, setAnimatedValue] = useState(value);

    useEffect(() => {
        const from = prevValue.current;
        const to = value;
        const duration = 900;
        const start = performance.now();

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedValue(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        prevValue.current = value;
    }, [value]);

    const cx = 70;
    const cy = 65;
    const r = 50;
    const strokeWidth = 10;

    const arcPath = (startDeg: number, endDeg: number) => {
        const s = (startDeg * Math.PI) / 180;
        const e = (endDeg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(s);
        const y1 = cy - r * Math.sin(s);
        const x2 = cx + r * Math.cos(e);
        const y2 = cy - r * Math.sin(e);
        const large = startDeg - endDeg > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
    };

    const needleAngle = 180 - (animatedValue / 100) * 180;
    const needleRad = (needleAngle * Math.PI) / 180;
    const needleLen = r - 16;
    const nx = cx + needleLen * Math.cos(needleRad);
    const ny = cy - needleLen * Math.sin(needleRad);

    const segments = [
        { d: arcPath(180, 138), color: '#ef4444' },
        { d: arcPath(138, 96), color: '#f97316' },
        { d: arcPath(96, 50), color: '#eab308' },
        { d: arcPath(50, 0), color: '#22c55e' },
    ];

    return (
        <div className="flex flex-col items-center select-none">
            <svg
                width="140"
                height="82"
                viewBox="0 0 140 82"
                className="drop-shadow-sm"
            >
                <path
                    d={arcPath(180, 0)}
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth={strokeWidth + 2}
                    strokeLinecap="round"
                />
                {segments.map((seg, i) => (
                    <path
                        key={i}
                        d={seg.d}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        opacity={0.85}
                    />
                ))}
                <line
                    x1={cx}
                    y1={cy}
                    x2={nx + 0.5}
                    y2={ny + 0.5}
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                />
                <line
                    x1={cx}
                    y1={cy}
                    x2={nx}
                    y2={ny}
                    stroke="#374151"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                />
                <circle cx={cx} cy={cy} r={6} fill="#e5e7eb" />
                <circle cx={cx} cy={cy} r={3.5} fill="white" stroke="#d1d5db" strokeWidth={0.8} />
            </svg>
            <div className="flex items-baseline gap-1 -mt-1">
                <span className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">
                    {animatedValue}%
                </span>
                {delta && (
                    <span className="text-xs md:text-sm font-semibold text-emerald-500">
                        {delta}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   CountUp Animation Hook
   ═══════════════════════════════════════════════ */

function useCountUp(target: number, duration: number = 1200) {
    const [count, setCount] = useState(0);
    const prevTarget = useRef(target);

    useEffect(() => {
        const from = prevTarget.current === target ? 0 : prevTarget.current;
        const to = target;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
            const current = Math.round(from + (to - from) * eased);

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        prevTarget.current = target;
    }, [target, duration]);

    return count;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
    const count = useCountUp(value);
    return <>{count}{suffix}</>;
}

/* ═══════════════════════════════════════════════
   Floating Gauge Card with "AI Visibility" label
   ═══════════════════════════════════════════════ */

export function FloatingGaugeCard({ value, delta }: { value: number; delta?: string }) {
    return (
        <motion.div
            layout
            className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.10)] border border-gray-100 px-4 py-3 md:px-5 md:py-4 flex flex-col items-center min-w-[160px] md:min-w-[185px]"
        >
            {/* Title with icon */}
            <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-indigo-600" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-gray-700">AI Visibility</span>
            </div>
            <GaugeChart value={value} delta={delta} />
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   AI Platform Icons — Recognizable SVG shapes
   ═══════════════════════════════════════════════ */

function GeminiIcon() {
    return (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 md:w-5 md:h-5">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="url(#gemGrad)" />
                <defs>
                    <linearGradient id="gemGrad" x1="2" y1="2" x2="22" y2="22">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="50%" stopColor="#34A853" />
                        <stop offset="100%" stopColor="#FBBC05" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

function ChatGPTIcon() {
    return (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 md:w-5 md:h-5" fill="none">
                <path
                    d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16.2c-3.97 0-7.2-3.23-7.2-7.2S8.03 4.8 12 4.8s7.2 3.23 7.2 7.2-3.23 7.2-7.2 7.2z"
                    fill="#10a37f"
                />
                <path
                    d="M15.5 9.5L12 7L8.5 9.5V14.5L12 17L15.5 14.5V9.5Z"
                    stroke="#10a37f"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        </div>
    );
}

function PerplexityIcon() {
    return (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 md:w-5 md:h-5" fill="none">
                <path d="M12 3L3 8V16L12 21L21 16V8L12 3Z" stroke="#0891b2" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M12 3V21M3 8L21 16M21 8L3 16" stroke="#0891b2" strokeWidth="1.2" opacity="0.5" />
            </svg>
        </div>
    );
}

function ClaudeIcon() {
    return (
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 md:w-5 md:h-5">
                <circle cx="12" cy="12" r="3" fill="#ea580c" />
                <line x1="12" y1="3" x2="12" y2="7" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12" y2="21" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="12" x2="7" y2="12" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="17" y1="12" x2="21" y2="12" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="5.6" y1="5.6" x2="8.5" y2="8.5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="15.5" y1="15.5" x2="18.4" y2="18.4" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="5.6" y1="18.4" x2="8.5" y2="15.5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <line x1="15.5" y1="8.5" x2="18.4" y2="5.6" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    );
}

const platformIcons: Record<string, React.FC> = {
    Gemini: GeminiIcon,
    ChatGPT: ChatGPTIcon,
    'Perplexity AI': PerplexityIcon,
    Claude: ClaudeIcon,
};

/* ═══════════════════════════════════════════════
   Phase 1 — Track AI Visibility
   ═══════════════════════════════════════════════ */

const marketPositionData = [
    { label: 'Competitor A', value: 78, segments: [{ width: 62, color: '#22c55e' }, { width: 16, color: '#86efac' }] },
    { label: 'Competitor B', value: 48, segments: [{ width: 48, color: '#60a5fa' }] },
    { label: 'Competitor C', value: 22, segments: [{ width: 22, color: '#93c5fd' }] },
    { label: 'You', value: 12, segments: [{ width: 12, color: '#fb923c' }] },
];

const aiPlatforms = [
    { name: 'Gemini', value: 28 },
    { name: 'ChatGPT', value: 45 },
    { name: 'Perplexity AI', value: 22 },
    { name: 'Claude', value: 35 },
];

function Phase1Content() {
    return (
        <div className="flex-1 flex flex-col px-4 md:px-7 pb-3">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-3 md:gap-4 flex-1">
                {/* Market Position Card */}
                <div className="bg-gray-50/80 border border-gray-200/60 rounded-2xl p-4 md:p-5">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 mb-3 text-center">
                        Market Position
                    </h4>
                    <div className="space-y-2.5 md:space-y-3">
                        {marketPositionData.map((item, idx) => (
                            <div key={item.label} className="flex items-center gap-2.5">
                                <span className={`text-[11px] md:text-xs w-20 md:w-24 shrink-0 ${item.label === 'You' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                    {item.label}
                                </span>
                                <div className="flex-1 h-5 md:h-6 bg-gray-200/60 rounded-full overflow-hidden flex">
                                    {item.segments.map((seg, si) => (
                                        <motion.div
                                            key={si}
                                            className="h-full first:rounded-l-full last:rounded-r-full"
                                            style={{ backgroundColor: seg.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${seg.width}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Platforms Stack */}
                <div className="flex flex-col gap-2">
                    {aiPlatforms.map((platform, idx) => {
                        const Icon = platformIcons[platform.name];
                        return (
                            <motion.div
                                key={platform.name}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.07, duration: 0.35 }}
                                className="flex items-center gap-2.5 bg-gray-50/80 border border-gray-200/60 rounded-xl px-3 py-2 md:py-2.5"
                            >
                                {Icon && <Icon />}
                                <span className="text-xs md:text-sm font-medium text-gray-700 flex-1">
                                    {platform.name}
                                </span>
                                <span className="text-sm md:text-base font-bold text-gray-900">
                                    {platform.value}%
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Phase 2 & 2.5 — Take Precise Actions
   ═══════════════════════════════════════════════ */

interface ActionItem {
    title: string;
    subtitle: string;
    status: 'completed' | 'creating' | 'engage' | 'update';
}

const actionItemsPhase2: ActionItem[] = [
    {
        title: 'Get mentioned on techradar.com',
        subtitle: 'Cited in 34 prompts \u00b7 25+ Competitors mentioned',
        status: 'completed',
    },
    {
        title: 'Create \u201cBest AI Content Tools 2025\u201d',
        subtitle: 'Missing topic \u00b7 5 competitors have it',
        status: 'creating',
    },
    {
        title: 'Join Reddit discussions in your niche',
        subtitle: '15 relevant threads \u00b7 Competitors getting 50+ mentions',
        status: 'engage',
    },
    {
        title: 'Refresh outdated comparison pages',
        subtitle: '10 pages need 2025 data \u00b7 High impact',
        status: 'update',
    },
];

const actionItemsPhase2_5: ActionItem[] = [
    {
        title: 'Get mentioned on techradar.com',
        subtitle: 'Cited in 34 prompts \u00b7 25+ Competitors mentioned',
        status: 'completed',
    },
    {
        title: 'Create \u201cBest AI Content Tools 2025\u201d',
        subtitle: 'Missing topic \u00b7 5 competitors have it',
        status: 'completed',
    },
    {
        title: 'Join Reddit discussions in your niche',
        subtitle: '15 relevant threads \u00b7 Competitors getting 50+ mentions',
        status: 'completed',
    },
    {
        title: 'Refresh outdated comparison pages',
        subtitle: '10 pages need 2025 data \u00b7 High impact',
        status: 'update',
    },
];

const statusConfig = {
    completed: {
        rowBg: 'bg-emerald-50/70 border-emerald-200/50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-500 text-white',
        badgeText: 'Completed',
    },
    creating: {
        rowBg: 'bg-amber-50/70 border-amber-200/50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        badgeBg: 'bg-amber-400 text-white',
        badgeText: 'Creating...',
    },
    engage: {
        rowBg: 'bg-white border-gray-200/60',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-500',
        badgeBg: 'bg-white border border-gray-300 text-gray-700',
        badgeText: 'Engage',
    },
    update: {
        rowBg: 'bg-white border-gray-200/60',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-500',
        badgeBg: 'bg-white border border-gray-300 text-gray-700',
        badgeText: 'Update',
    },
};

function Phase2Content({ items }: { items: ActionItem[] }) {
    return (
        <div className="flex-1 flex flex-col gap-2 md:gap-2.5 px-4 md:px-7 pb-3">
            {items.map((item, i) => {
                const cfg = statusConfig[item.status];
                return (
                    <motion.div
                        key={`${item.title}-${item.status}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                        className={`flex items-center gap-2.5 ${cfg.rowBg} border rounded-xl px-3 py-2.5 md:py-3`}
                    >
                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                            {item.status === 'completed' ? (
                                <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" strokeWidth={2.5} />
                            ) : item.status === 'creating' ? (
                                <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 ${cfg.iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className={`w-3.5 h-3.5 md:w-4 md:h-4 ${cfg.iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] md:text-xs font-semibold text-gray-900 truncate">
                                {item.title}
                            </p>
                            <p className="text-[9px] md:text-[11px] text-gray-500 truncate mt-0.5">
                                {item.subtitle}
                            </p>
                        </div>

                        <motion.span
                            key={`badge-${item.title}-${item.status}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.08 + 0.15 }}
                            className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-semibold whitespace-nowrap ${cfg.badgeBg}`}
                        >
                            {item.status === 'completed' && item.title.includes('Reddit') ? 'Engaged' : cfg.badgeText}
                        </motion.span>
                    </motion.div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Phase 3 — Monitor Impact
   ═══════════════════════════════════════════════ */

function Phase3Content() {
    return (
        <div className="flex-1 flex flex-col px-4 md:px-7 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1">
                {/* AI Visibility Progress Bar Chart */}
                <div className="bg-gray-50/80 border border-gray-200/60 rounded-2xl p-3.5 md:p-4 flex flex-col">
                    <h4 className="text-xs md:text-sm font-bold text-gray-900 mb-3 text-center">
                        AI Visibility Progress
                    </h4>
                    <div className="flex-1 flex items-end justify-center gap-8 md:gap-10 pb-1">
                        {/* Before */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-base md:text-lg font-bold text-gray-900 tabular-nums">
                                <AnimatedNumber value={32} suffix="%" />
                            </span>
                            <div className="relative w-12 md:w-16 rounded-lg overflow-hidden" style={{ height: '100px' }}>
                                <div className="absolute inset-0 bg-gray-200/50 rounded-lg" />
                                <div className="absolute bottom-0 left-0 right-0">
                                    <motion.div
                                        className="w-full bg-rose-400 rounded-lg"
                                        initial={{ height: 0 }}
                                        animate={{ height: '49%' }}
                                        transition={{ duration: 0.9, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] md:text-xs text-gray-500 font-medium">Before</span>
                        </div>
                        {/* After */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-base md:text-lg font-bold text-gray-900 tabular-nums">
                                <AnimatedNumber value={65} suffix="%" />
                            </span>
                            <div className="relative w-12 md:w-16 rounded-lg overflow-hidden" style={{ height: '100px' }}>
                                <div className="absolute inset-0 bg-gray-200/50 rounded-lg" />
                                <div className="absolute bottom-0 left-0 right-0">
                                    <motion.div
                                        className="w-full bg-emerald-500 rounded-lg"
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] md:text-xs text-gray-500 font-medium">After</span>
                        </div>
                    </div>
                </div>

                {/* Impact Metrics */}
                <div className="flex flex-col gap-2 md:gap-2.5">
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                        className="bg-emerald-50/80 border border-emerald-200/50 rounded-xl px-3.5 md:px-4 py-3 md:py-3.5"
                    >
                        <p className="text-[10px] md:text-xs text-gray-600 font-medium mb-0.5">Overall AI Visibility</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums">
                                <AnimatedNumber value={65} suffix="%" />
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-emerald-500">+33%</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.35 }}
                        className="bg-gray-50/80 border border-gray-200/60 rounded-xl px-3.5 md:px-4 py-3 md:py-3.5"
                    >
                        <p className="text-[10px] md:text-xs text-gray-600 font-medium mb-0.5">Market Position</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums">
                                #<AnimatedNumber value={2} />
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-emerald-500 flex items-center gap-0.5">
                                <ArrowUp className="w-3 h-3" />
                                2 Spots
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.35 }}
                        className="bg-gray-50/80 border border-gray-200/60 rounded-xl px-3.5 md:px-4 py-3 md:py-3.5"
                    >
                        <p className="text-[10px] md:text-xs text-gray-600 font-medium mb-0.5">New Citations</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums">
                                <AnimatedNumber value={127} />
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-emerald-500">+45</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Progress Dot Indicator — with timed fill
   ═══════════════════════════════════════════════ */

function ProgressDotIndicator({
    active,
    total,
    duration,
    onChange,
}: {
    active: number;
    total: number;
    duration: number;
    onChange: (i: number) => void;
}) {
    // Map 4 internal phases to 3 visible dots (0→0, 1→1, 2→1, 3→2)
    const visibleDot = active <= 1 ? active : active === 2 ? 1 : 2;

    return (
        <div className="flex items-center justify-center gap-2 pb-3 md:pb-4 pt-1">
            {Array.from({ length: total }).map((_, i) => {
                const isActive = visibleDot === i;
                return (
                    <button
                        key={i}
                        onClick={() => {
                            // Map visible dots back: 0→0, 1→1, 2→3
                            const phaseIdx = i === 2 ? 3 : i;
                            onChange(phaseIdx);
                        }}
                        className="relative rounded-full overflow-hidden transition-all duration-500 ease-out"
                        style={{
                            width: isActive ? 36 : 10,
                            height: 10,
                            backgroundColor: isActive ? 'transparent' : '#d1d5db',
                        }}
                        aria-label={`Go to step ${i + 1}`}
                    >
                        {isActive && (
                            <>
                                {/* Track */}
                                <div className="absolute inset-0 rounded-full bg-indigo-200" />
                                {/* Fill */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-indigo-500"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: duration / 1000, ease: 'linear' }}
                                    style={{ transformOrigin: 'left' }}
                                />
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Phase Transition Variants
   ═══════════════════════════════════════════════ */

const phaseVariants = {
    enter: { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
};

/* ═══════════════════════════════════════════════
   Main AnimatedDashboard Component
   ═══════════════════════════════════════════════ */

export default function AnimatedDashboard() {
    const [activePhase, setActivePhase] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const totalPhases = phases.length; // 4 internal phases

    const getPhaseDuration = useCallback((phase: number) => {
        // Phase 2 (index 1) is shorter since it transitions to 2.5
        if (phase === 1) return 3000;
        return PHASE_DURATION;
    }, []);

    const startAutoplay = useCallback((fromPhase?: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const currentPhase = fromPhase ?? 0;

        const scheduleNext = (phase: number) => {
            const dur = phase === 1 ? 3000 : PHASE_DURATION;
            intervalRef.current = setTimeout(() => {
                const next = (phase + 1) % totalPhases;
                setActivePhase(next);
                scheduleNext(next);
            }, dur) as unknown as ReturnType<typeof setInterval>;
        };

        scheduleNext(currentPhase);
    }, [totalPhases]);

    useEffect(() => {
        startAutoplay(activePhase);
        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current as unknown as number);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDotClick = (index: number) => {
        setActivePhase(index);
        if (intervalRef.current) clearTimeout(intervalRef.current as unknown as number);
        startAutoplay(index);
    };

    const phase = phases[activePhase];

    // Determine the content key for AnimatePresence
    // Phase 1→2 are different content, phase 2 and 2.5 share layout but different items
    const contentKey = activePhase === 2 ? '2.5' : String(activePhase);

    return (
        <div className="relative h-full w-full bg-white rounded-2xl overflow-hidden flex flex-col shadow-[0_2px_40px_rgba(0,0,0,0.06)]">
            {/* Header Area */}
            <div className="relative pt-4 md:pt-5 pb-1.5 px-4 md:px-7">
                {/* Step badge + Title — centered */}
                <div className="text-center">
                    <motion.span
                        key={phase.step}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-3.5 py-0.5 rounded-full bg-gray-900 text-white text-[10px] md:text-xs font-semibold tracking-wide"
                    >
                        {phase.step}
                    </motion.span>
                    <motion.h3
                        key={phase.title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm md:text-lg font-bold text-gray-900 mt-1.5"
                    >
                        {phase.title}
                    </motion.h3>
                </div>
            </div>

            {/* Phase Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={contentKey}
                    variants={phaseVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex-1 flex flex-col min-h-0 mt-1"
                >
                    {activePhase === 0 && <Phase1Content />}
                    {activePhase === 1 && <Phase2Content items={actionItemsPhase2} />}
                    {activePhase === 2 && <Phase2Content items={actionItemsPhase2_5} />}
                    {activePhase === 3 && <Phase3Content />}
                </motion.div>
            </AnimatePresence>

            {/* Progress Dot Indicator */}
            <ProgressDotIndicator
                active={activePhase}
                total={3}
                duration={getPhaseDuration(activePhase)}
                onChange={handleDotClick}
            />
        </div>
    );
}
