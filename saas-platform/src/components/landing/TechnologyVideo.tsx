'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getPlaceholderImage } from './shared';

export default function TechnologyVideo() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section className="intercom-bg-dark py-20 lg:py-32">
            <div className="intercom-container">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="intercom-label text-white/60 mb-4">TECHNOLOGY</p>
                        <h2 className="intercom-h2 text-white mb-6">
                            Built on the latest
                            <br />
                            AI breakthroughs
                        </h2>
                        <p className="text-lg text-white/70 mb-8">
                            Fin uses large language models combined with Intercom's proprietary training to deliver accurate, helpful responses that match your brand voice.
                        </p>
                        <Link
                            href="#technology"
                            className="inline-flex items-center gap-2 text-white font-medium hover:underline underline-offset-4"
                        >
                            Learn about our AI
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Right: Video Player */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="intercom-mockup-dark relative group overflow-hidden">
                            {/* Video/Placeholder */}
                            <div className="relative aspect-video">
                                {/* Placeholder image (would be replaced with actual video) */}
                                <img
                                    src={getPlaceholderImage(800, 450, 'AI+Technology+Demo', '2A3F6A', 'FFFFFF')}
                                    alt="Technology demo"
                                    className="w-full h-full object-cover"
                                />

                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                    <motion.button
                                        onClick={togglePlay}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-8 h-8 text-[#1E2A47]" />
                                        ) : (
                                            <Play className="w-8 h-8 text-[#1E2A47] ml-1" />
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Video Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <button onClick={togglePlay} className="hover:opacity-80">
                                            {isPlaying ? (
                                                <Pause className="w-5 h-5" />
                                            ) : (
                                                <Play className="w-5 h-5" />
                                            )}
                                        </button>
                                        <div className="flex-1 h-1 bg-white/30 rounded-full w-48">
                                            <div className="h-full w-1/3 bg-white rounded-full" />
                                        </div>
                                        <span className="text-xs">1:24</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsMuted(!isMuted)} className="hover:opacity-80">
                                            {isMuted ? (
                                                <VolumeX className="w-5 h-5" />
                                            ) : (
                                                <Volume2 className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button className="hover:opacity-80">
                                            <Maximize className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
