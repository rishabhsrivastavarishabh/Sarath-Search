"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, Bell, User, Menu, ExternalLink, Bookmark, Share2, Clock, FileText, Image, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRENDING_TOPICS, RELATED_SEARCHES } from '@/lib/mock-data';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  meta_description: string;
  score: number;
}

export default function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [navQuery, setNavQuery] = useState(query);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (e) {
                console.error("Search error", e);
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
    }, [query]);

    const handleNavSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && navQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(navQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center gap-6">
                    <div
                        className="text-2xl font-bold tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push('/')}
                    >
                        Sarath
                    </div>
                    <div className="relative hidden md:flex items-center w-full max-w-2xl group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            value={navQuery}
                            onChange={(e) => setNavQuery(e.target.value)}
                            onKeyDown={handleNavSearch}
                            className="w-full bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-full py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Search again..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-card dark:hover:bg-zinc-800 rounded-full transition-colors relative">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                    </button>
                    <button className="p-2 hover:bg-card dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary cursor-pointer hover:ring-2 ring-primary/50 transition-all" />
                </div>
            </nav>

            <div className="flex flex-1">
                {/* Left Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 p-4 border-r border-border gap-2 sticky top-16 h-[calc(100vh-64px)]">
                    <SidebarItem icon={<Search className="w-4 h-4" />} label="All" active />
                    <SidebarItem icon={<Image className="w-4 h-4" />} label="Images" />
                    <SidebarItem icon={<FileText className="w-4 h-4" />} label="Documents" />
                    <SidebarItem icon={<Clock className="w-4 h-4" />} label="Recent" />
                    <div className="mt-auto p-4 bg-card dark:bg-zinc-900 rounded-2xl border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Sarath Pro</p>
                        <p className="text-xs text-muted-foreground mb-3">Get deeper local indexing and AI summaries.</p>
                        <button className="w-full py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-all">Upgrade</button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                    <header className="mb-8">
                        <h2 className="text-2xl font-medium flex items-center gap-2">
                            Search results for <span className="text-primary italic">"{query}"</span}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">About {results.length} results found in 0.04s</p>
                    </header>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse space-y-3">
                                    <div className="h-4 w-1/3 bg-muted rounded" />
                                    <div className="h-4 w-full bg-muted rounded" />
                                    <div className="h-4 w-2/3 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-8">
                            <AnimatePresence>
                                {results.map((result, index) => (
                                    <motion.div
                                        key={result.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative p-4 rounded-2xl hover:bg-card dark:hover:bg-zinc-900 border border-transparent hover:border-border transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border group-hover:border-primary/50 transition-colors">
                                                {result.url.split('/')[2]?.[0]?.toUpperCase() || 'W'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <a
                                                        href={result.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-lg font-medium text-foreground hover:text-primary transition-colors truncate"
                                                    >
                                                        {result.title || 'Untitled Page'}
                                                    </a>
                                                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 truncate">
                                                    <span className="text-primary/60 font-medium">{result.url}</span>
                                                    <span>•</span>
                                                    <span>Score: {result.score?.toFixed(2)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {result.meta_description || 'No description available for this page.'}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                                                        <Bookmark className="w-3 h-3" /> Save
                                                    </button>
                                                    <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                                                        <Share2 className="w-3 h-3" /> Share
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No results found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                We couldn't find any pages matching your search. Try different keywords or add more domains to crawl.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-all"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Sidebar */}
                <aside className="hidden xl:flex flex-col w-80 p-6 border-l border-border gap-8 sticky top-16 h-[calc(100vh-64px)]">
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Related Searches
                        </h3>
                        <div className="flex flex-col gap-2">
                            {RELATED_SEARCHES.map(s => (
                                <div
                                    key={s}
                                    onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                                    className="p-3 rounded-xl bg-card dark:bg-zinc-900 border border-border text-sm cursor-pointer hover:border-primary/50 hover:text-primary transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        {s}
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Trending Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TRENDING_TOPICS.map(t => (
                                <span
                                    key={t}
                                    onClick={() => router.push(`/search?q=${encodeURIComponent(t.replace('#', ''))}`)}
                                    className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </section>
                </aside>
            </div
        </div>
    );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm font-medium",
            active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-card dark:hover:bg-zinc-800 hover:text-foreground"
        )}>
            {icon}
            {label}
        </div>
    );
}
