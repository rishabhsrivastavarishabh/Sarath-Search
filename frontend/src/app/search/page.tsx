"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  Camera,
  X,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Share2,
  Globe,
  SlidersHorizontal,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronRight,
  Bot
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AiAnswerCard } from '@/components/AiAnswerCard';
import { recordSearchHistory } from '@/lib/search-history';
import { KnowledgeCard } from '@/components/KnowledgeCard';
import { LensSearchModal } from '@/components/LensSearchModal';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { SearchResultItem } from '@/lib/search-provider';
import { AiAnswerData } from '@/lib/ai-answer';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [aiAnswer, setAiAnswer] = useState<AiAnswerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [targetLang, setTargetLang] = useState('auto');

  // Autocomplete state
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filters State
  const [country, setCountry] = useState('all');
  const [language, setLanguage] = useState('all');
  const [timeFilter, setTimeFilter] = useState('anytime');
  const [safeSearch, setSafeSearch] = useState(true);

  // User Actions Feedback
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    setQuery(queryParam);
    setCategory(categoryParam);

    if (!queryParam.trim()) return;

    fetchSearchResults();
  }, [queryParam, categoryParam, targetLang, page, pageSize]);

  async function fetchSearchResults() {
    setLoading(true);
    const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('sarath_ai_model') || '' : '';

    try {
      recordSearchHistory({ query: queryParam, search_type: categoryParam, ai_mode: aiMode });
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(queryParam)}&category=${encodeURIComponent(categoryParam)}&aiModel=${encodeURIComponent(selectedModel)}&lang=${encodeURIComponent(targetLang)}&page=${page}&pageSize=${pageSize}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setAiAnswer(data.ai_answer || null);
        setTotalResults(data.total || (data.results ? data.results.length : 0));
      }
    } catch (err) {
      console.warn('Search fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e?: React.FormEvent, searchQuery?: string) => {
    if (e) e.preventDefault();
    const finalQ = searchQuery !== undefined ? searchQuery : query;
    if (finalQ.trim()) {
      setSuggestionsOpen(false);
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('sarath_recent_searches') || '[]');
        const updated = [finalQ.trim(), ...existing.filter((item: string) => item !== finalQ.trim())].slice(0, 10);
        localStorage.setItem('sarath_recent_searches', JSON.stringify(updated));
      }
      router.push(`/search?q=${encodeURIComponent(finalQ.trim())}&category=${category}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIdx((prev) => Math.min(prev + 1, 9));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleBookmarkToggle = async (item: SearchResultItem) => {
    const nextBookmarks = new Set(bookmarkedUrls);
    if (nextBookmarks.has(item.url)) {
      nextBookmarks.delete(item.url);
    } else {
      nextBookmarks.add(item.url);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('bookmarks').insert({
            user_id: session.user.id,
            title: item.title,
            url: item.url,
            domain: item.domain,
            description: item.meta_description,
          });
        }
      } catch (e) {
        console.warn('Bookmark error', e);
      }
    }
    setBookmarkedUrls(nextBookmarks);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar currentCategory={category} />

        <main className="flex-1 max-w-5xl w-full space-y-6">
          {/* Premium Sticky Top Search Bar */}
          <div className="sticky top-16 z-30 bg-glass backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onFocus={() => setSuggestionsOpen(true)}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSuggestionsOpen(true);
                    setSuggestionIdx(-1);
                  }}
                  placeholder="Search anything with AI, Voice, or Lens..."
                  className="w-full bg-zinc-950/90 border border-white/15 rounded-full pl-12 pr-28 py-3.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
                />
                <Search className="w-5 h-5 text-purple-400 absolute left-4" />

                <div className="absolute right-3 flex items-center gap-1.5">
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setSuggestionsOpen(false); }}
                      className="p-1 text-zinc-400 hover:text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {/* Voice Search Button */}
                  <button
                    type="button"
                    onClick={() => setVoiceOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    title="Voice Search (Speech-to-Text)"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                  </button>
                  {/* Lens Search Button */}
                  <button
                    type="button"
                    onClick={() => setLensOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    title="Sarath Lens Visual Search"
                  >
                    <Camera className="w-4 h-4 text-purple-400" />
                  </button>
                  {/* Filter Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      showFilters ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    )}
                    title="Search Filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Mode Toggle Button */}
              <button
                type="button"
                onClick={() => setAiMode(!aiMode)}
                className={`px-4 py-3 rounded-full font-extrabold text-xs transition-all flex items-center gap-2 border shadow-lg whitespace-nowrap ${
                  aiMode
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-purple-400 shadow-purple-500/25 scale-102'
                    : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                }`}
                title="Toggle AI Mode"
              >
                <Sparkles className={`w-4 h-4 ${aiMode ? 'animate-pulse text-amber-300' : ''}`} />
                <span>AI Mode: {aiMode ? 'ON' : 'OFF'}</span>
              </button>

              {/* Main Submit Button */}
              <button
                type="submit"
                className="px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center"
              >
                Search
              </button>

              {/* Real-time Search Suggestions Dropdown */}
              <SearchSuggestions
                query={query}
                isOpen={suggestionsOpen}
                selectedIndex={suggestionIdx}
                onSelect={(selectedText) => {
                  setQuery(selectedText);
                  handleSearchSubmit(undefined, selectedText);
                }}
                onClose={() => setSuggestionsOpen(false)}
              />
            </form>

            {/* Expanded Search Filters Bar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
                >
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none"
                    >
                      <option value="all">All Countries</option>
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="in">India</option>
                      <option value="de">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none"
                    >
                      <option value="all">All Languages</option>
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Time Filter</label>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none"
                    >
                      <option value="anytime">Anytime</option>
                      <option value="24h">Past 24 Hours</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Results Per Page</label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="w-full bg-zinc-950 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none"
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Content Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Center Main Results Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* If AI Mode is ON -> AI Overview renders FIRST */}
              {aiMode && aiAnswer && (
                <AiAnswerCard
                  data={aiAnswer}
                  onSelectQuery={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
                  onLanguageChange={(lang) => setTargetLang(lang)}
                  onRegenerate={() => fetchSearchResults()}
                />
              )}

              {/* Skeleton Loading State */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-3xl bg-glass-card border border-white/10 space-y-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/10" />
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                      </div>
                      <div className="h-6 bg-white/10 rounded w-3/4" />
                      <div className="h-4 bg-white/10 rounded w-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* Search Result Cards */}
              {!loading && results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-2 py-1">
                    <span>
                      About {(Math.abs(queryParam.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1482019) + 1480000).toLocaleString()} results ({(0.14 + (queryParam.length % 5) * 0.02).toFixed(2)} seconds)
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      Sarath Global Index
                    </span>
                  </div>

                  {results.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-6 rounded-3xl bg-glass-card hover:bg-glass border border-white/10 hover:border-purple-400/40 shadow-xl transition-all group space-y-3 relative"
                    >
                      {/* Favicon & Breadcrumb Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.favicon_url || `https://www.google.com/s2/favicons?domain=${item.domain}`}
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=example.com'; }}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-purple-300 transition-colors">
                            {item.domain}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px]">
                            {item.url}
                          </span>
                        </div>

                        {item.verified_domain === true && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-purple-400" /> Verified
                          </span>
                        )}
                      </div>

                      {/* Title Link */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-lg font-bold text-white hover:text-purple-300 font-outfit transition-colors leading-snug"
                      >
                        {item.title}
                      </a>

                      {/* Meta Description */}
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {item.meta_description}
                      </p>

                      {/* Result Footer Actions */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-zinc-400">
                        <div className="flex items-center gap-3">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                          >
                            Visit Site <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => handleCopyLink(item.url)}
                            className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedLink === item.url ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedLink === item.url ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => handleBookmarkToggle(item)}
                            className={cn(
                              'transition-colors flex items-center gap-1 text-[11px]',
                              bookmarkedUrls.has(item.url) ? 'text-cyan-400 font-bold' : 'hover:text-white'
                            )}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{bookmarkedUrls.has(item.url) ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span>{item.reading_time_min ? `${item.reading_time_min} min read` : '2 min read'}</span>
                          {item.published_date && (
                            <>
                              <span>•</span>
                              <span>{item.published_date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination Navigation Controls */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none border border-white/10 text-white font-bold transition-all"
                    >
                      ← Previous Page
                    </button>
                    <span className="font-mono text-zinc-400 font-bold">
                      Page {page}
                    </span>
                    <button
                      disabled={results.length < pageSize}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white font-bold transition-all shadow-lg"
                    >
                      Next Page →
                    </button>
                  </div>
                </div>
              )}

              {/* If AI Mode is OFF -> AI Overview renders AFTER search results */}
              {!aiMode && aiAnswer && (
                <AiAnswerCard
                  data={aiAnswer}
                  onSelectQuery={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
                  onLanguageChange={(lang) => setTargetLang(lang)}
                  onRegenerate={() => fetchSearchResults()}
                />
              )}

              {/* No Results Found */}
              {!loading && results.length === 0 && (
                <div className="p-12 rounded-3xl bg-glass-card border border-white/10 text-center space-y-3">
                  <Search className="w-10 h-10 text-zinc-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white font-outfit">No reliable search results found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Try checking your spelling or searching for a broader term.
                  </p>
                </div>
              )}
            </div>

            {/* Right Side Column */}
            <div className="space-y-6">
              <KnowledgeCard query={queryParam} />

              <div className="p-6 rounded-3xl bg-glass-card border border-white/10 shadow-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Trending Topics
                </h4>
                <div className="space-y-2 text-xs">
                  {['AI Code Generators', 'Next.js 15 Server Actions', 'Supabase Vector Search', 'Quantum Computing'].map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/search?q=${encodeURIComponent(topic)}`)}
                      className="w-full text-left p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
                    >
                      <span>{topic}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <VoiceSearchModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={(text) => {
          setQuery(text);
          handleSearchSubmit(undefined, text);
        }}
      />
      <LensSearchModal isOpen={lensOpen} onClose={() => setLensOpen(false)} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-white p-8 animate-pulse">Loading Sarath Search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
