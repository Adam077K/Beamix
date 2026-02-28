'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials, getRandomImage, getPlaceholderImage } from './shared';

const companies = [
    { id: 'travelperk', name: 'TravelPerk', gradient: 'from-blue-600 to-indigo-700' },
    { id: 'coda', name: 'Coda', gradient: 'from-orange-500 to-red-600' },
    { id: 'mony', name: 'Mony Group', gradient: 'from-green-500 to-teal-600' },
];

const carouselTestimonials = [
    {
        company: 'travelperk',
        quote: 'Intercom transformed our support. Resolution times dropped 60% while CSAT scores hit all-time highs.',
        name: 'Maria Garcia',
        title: 'Head of Customer Experience',
        avatarUrl: getRandomImage(300, 400, 101),
    },
    {
        company: 'coda',
        quote: 'Fin AI handles 55% of our volume automatically. It\'s like having an entire team that never sleeps.',
        name: 'James Wilson',
        title: 'VP of Support',
        avatarUrl: getRandomImage(300, 400, 202),
    },
    {
        company: 'mony',
        quote: 'The unified platform means our team has full context on every customer. No more silos.',
        name: 'Sophie Chen',
        title: 'Director of Operations',
        avatarUrl: getRandomImage(300, 400, 303),
    },
];

export default function TestimonialsCarousel() {
    const [activeCompany, setActiveCompany] = useState('travelperk');
    const [direction, setDirection] = useState(0);

    const currentTestimonial = carouselTestimonials.find(t => t.company === activeCompany);
    const currentCompany = companies.find(c => c.id === activeCompany);

    const navigate = (dir: number) => {
        setDirection(dir);
        const currentIndex = companies.findIndex(c => c.id === activeCompany);
        const newIndex = (currentIndex + dir + companies.length) % companies.length;
        setActiveCompany(companies[newIndex].id);
    };

    return (
        <section className="intercom-section intercom-bg-white py-20 lg:py-32">
            <div className="intercom-container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="intercom-h2 text-gray-900 mb-4">
                        Trusted by leading customer support teams
                    </h2>
                </motion.div>

                {/* Company Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    {companies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => {
                                setDirection(companies.indexOf(companies.find(c => c.id === company.id)!) > companies.indexOf(companies.find(c => c.id === activeCompany)!) ? 1 : -1);
                                setActiveCompany(company.id);
                            }}
                            className={`px-6 py-3 rounded-full font-medium transition-all ${activeCompany === company.id
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {company.name}
                        </button>
                    ))}
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Navigation Arrows */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Testimonial Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCompany}
                            initial={{ opacity: 0, x: direction * 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -100 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className={`rounded-3xl p-8 lg:p-12 bg-gradient-to-br ${currentCompany?.gradient}`}
                        >
                            <div className="grid md:grid-cols-5 gap-8 items-center">
                                {/* Portrait */}
                                <div className="md:col-span-2">
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black/20">
                                        <img
                                            src={currentTestimonial?.avatarUrl}
                                            alt={currentTestimonial?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Quote */}
                                <div className="md:col-span-3 text-white">
                                    <blockquote className="text-2xl lg:text-3xl font-medium leading-relaxed mb-8">
                                        "{currentTestimonial?.quote}"
                                    </blockquote>
                                    <div>
                                        <p className="font-semibold text-lg">{currentTestimonial?.name}</p>
                                        <p className="text-white/70">{currentTestimonial?.title}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
