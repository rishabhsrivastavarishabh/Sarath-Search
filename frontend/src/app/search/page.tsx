"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ExternalLink,
  Bookmark,
  Share2,
  Clock,
  Copy,
  Check,
  Globe,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchResultItem } from '@/lib/search-provider';
import { AiAnswerData } from '@/lib/ai-answer';
import { AiAnswerCard } from '@/components/AiAnswerCard';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { TRENDING_TOPICS, RELATED_SEARCHES } from '@/lib/mock-data';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [aiAnswer, setAiAnswer] = useState<AiAnswerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [navQuery, setNavQuery] = useState(query);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setNavQuery(query);
    async function fetchResults() {
      if (!query.trim()) {
        setResults([]);
        setAiAnswer(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(activeCategory)}`);
        if (!res.ok) throw new Error('Search API request failed');
        const data = await res.json();
        setResults(data.results || []);
        setAiAnswer(data.ai_answer || null);
      } catch (e) {
        console.warn('Search error', e);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query, activeCategory]);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(navQuery)}&category=${encodeURIComponent(activeCategory)}`);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSave = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((i) => i !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    router.push(`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col bg-mesh-pattern font-sans">
      <Header />

      {/* Category Filter & Search Bar */}
      <div className="bg-glass border-b border-white/10 px-6 py-2.5 backdrop-blur-md sticky top-[61px] z-30 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <form onSubmit={handleNavSearch} className="relative w-full max-w-xl mr-4 group">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-white/15 rounded-full py-2 pl-10 pr-10 text-xs text-white placeholder:text-zinc-500 focus:border-purple-400 outline-none transition-all"
              placeholder="Search anything..."
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-white">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'images', 'videos', 'news', 'docs', 'maps', 'shopping'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap',
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        {/* Left Sidebar */}
        <Sidebar currentCategory={activeCategory} onSelectCategory={handleCategoryChange} />

        {/* Main Search Results Area */}
        <main className="flex-1 max-w-3xl w-full">
          <header className="mb-6 flex justify-between items-end border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-outfit text-white">
                Results for <span className="text-gradient">"{query || 'all'}"</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                <span>Found about {results.length} results</span>
                <span>•</span>
                <span className="text-purple-400 font-semibold">Sarath Search</span>
              </p>
            </div>
          </header>

          {/* AI Answer Synthesis Card */}
          {aiAnswer && !loading && (
            <AiAnswerCard
              data={aiAnswer}
              onSelectQuery={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
            />
          )}

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-glass-card border border-white/5 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10" />
                    <div className="h-4 w-1/4 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-white/15 rounded" />
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-6 rounded-3xl bg-glass-card hover:bg-glass border border-white/10 hover:border-purple-400/40 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Real Favicon */}
                      <img
                        src={result.favicon_url}
                        alt={result.domain}
                        className="w-9 h-9 rounded-xl border border-white/10 bg-zinc-950 p-1 object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=google.com&sz=64';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        {/* Domain & Published Badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-xs text-purple-300 font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                            {result.domain}
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-cyan-400" /> {result.reading_time_min} min read
                          </span>
                          {result.published_date && (
                            <>
                              <span className="text-xs text-zinc-500">•</span>
                              <span className="text-xs text-zinc-400">{result.published_date}</span>
                            </>
                          )}
                        </div>

                        {/* Result Title */}
                        <h3 className="text-lg font-bold text-white hover:text-purple-400 transition-colors font-outfit mb-2 flex items-center gap-2">
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {result.title}
                          </a>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                        </h3>

                        {/* Description */}
                        <p className="text-xs md:text-sm text-zinc-300 line-clamp-2 leading-relaxed mb-4">
                          {result.meta_description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all font-semibold"
                          >
                            <Globe className="w-3.5 h-3.5" /> Visit Site
                          </a>

                          <button
                            onClick={() => toggleSave(result.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all',
                              savedIds.includes(result.id)
                                ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:text-white'
                            )}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            {savedIds.includes(result.id) ? 'Saved' : 'Save'}
                          </button>

                          <button
                            onClick={() => handleCopyUrl(result.id, result.url)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                          >
                            {copiedId === result.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === result.id ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-glass-card border border-white/10 text-center">
              <Search className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 font-outfit">No search results found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                Try searching for different keywords or select another category filter above.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-full text-xs font-semibold transition-all shadow-lg shadow-purple-500/25"
              >
                Return to Home
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:flex flex-col w-72 gap-6 sticky top-20 h-[calc(100vh-110px)]">
          <section className="p-5 rounded-3xl bg-glass-card border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" /> Related Searches
            </h3>
            <div className="flex flex-col gap-2">
              {RELATED_SEARCHES.map((s) => (
                <div
                  key={s}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-300 cursor-pointer hover:border-purple-400/50 hover:text-purple-300 transition-all flex justify-between items-center group"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                </div>
              ))}
            </div>
          </section>

          <section className="p-5 rounded-3xl bg-glass-card border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TOPICS.map((t) => (
                <span
                  key={t}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(t.replace('#', ''))}`)}
                  className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-zinc-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all cursor-pointer border border-white/5 hover:scale-105"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="animate-pulse text-purple-400 font-medium text-xs">Loading Sarath Search...</div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
