"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, Image, Sparkles, ArrowRight, TrendingUp, Clock, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-background text-foreground transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Sarath
                    </h1>
                    <p className="text-lg text-muted-foreground mt-4 font-medium tracking-wide opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        The next generation of local intelligence.
                    </p>
                </motion.div>

                {/* Search Bar Section */}
                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleSearch}
                    className="w-full max-w-3xl relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-[9999px] blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-[9999px] px-6 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/20">
                        <Search className="w-5 h-5 text-muted-foreground mr-3" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search the web locally..."
                            className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground/60"
                        />
                        <div className="flex items-center gap-3 ml-4">
                            <button type="button" className="p-2 hover:bg-background dark:hover:bg-zinc-800 rounded-full transition-colors text-muted-foreground hover:text-foreground" title="Voice Search">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button type="button" className="p-2 hover:bg-background dark:hover:bg-zinc-800 rounded-full transition-colors text-muted-foreground hover:text-foreground" title="Image Search">
                                <Image className="w-5 h-5" />
                            </button>
                            <button type="submit" className="bg-primary hover:bg-primary-dark text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg shadow-primary/30">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.form>

                {/* Quick Actions / Trending */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-12 flex flex-wrap justify-center gap-4 max-w-4xl"
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer group">
                        <TrendingUp className="w-4 h-4 group-hover:text-primary transition-colors" />
                        <span>Trending Searches</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer group">
                        <Clock className="w-4 h-4 group-hover:text-primary transition-colors" />
                        <span>Recent Activity</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer group">
                        <LayoutGrid className="w-4 h-4 group-hover:text-primary transition-colors" />
                        <span>Explore Categories</span>
                    </div>
                </motion.div>

                {/* Footer-like bottom sections */}
                <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-center text-xs text-muted-foreground font-medium tracking-wider">
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-foreground transition-colors">About</a>
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    </div>
                    <div className="flex gap-6 items-center">
                        <span>v1.0.0-beta</span>
                        <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
