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
  AlertTriangle,
  WifiOff,
  ServerCrash,
  RefreshCw,
  History,
  Info
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AiAnswerCard } from '@/components/AiAnswerCard';
import { recordSearchHistory } from '@/lib/search-history';
import { KnowledgeCard } from '@/components/KnowledgeCard';
import { LensSearchModal } from '@/components/LensSearchModal';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { SearchResultItem, AiAnswerData } from '@/types';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export type SearchStatusState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'no_results'
  | 'provider_unavailable'
  | 'network_error'
  | 'server_error';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [aiAnswer, setAiAnswer] = useState<AiAnswerData | null>(null);
  const [searchProvider, setSearchProvider] = useState<string>('Sarath Search');
  const [loading, setLoading] = useState(true);
  const [searchStatus, setSearchStatus] = useState<SearchStatusState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Spell Correction State
  const [spellInfo, setSpellInfo] = useState<{ isCorrected: boolean; correctedQuery: string | null; originalQuery: string }>({
    isCorrected: false,
    correctedQuery: null,
    originalQuery: '',
  });

  // Settings & Toggles
  const [aiMode, setAiMode] = useState(true);
  const [targetLang, setTargetLang] = useState('auto');
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Suggestions State
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Copy & Bookmark Feedback
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    setQuery(queryParam);
    setCategory(categoryParam);

    if (!queryParam.trim()) {
      setSearchStatus('idle');
      setLoading(false);
      return;
    }

    fetchSearchResults();
  }, [queryParam, categoryParam, targetLang, page, pageSize]);

  async function fetchSearchResults() {
    setLoading(true);
    setSearchStatus('loading');
    setErrorMessage(null);

    const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('sarath_ai_model') || '' : '';

    try {
      recordSearchHistory({ query: queryParam, search_type: categoryParam, ai_mode: aiMode });

      const res = await fetch(
        `/api/search?q=${encodeURIComponent(queryParam)}&category=${encodeURIComponent(categoryParam)}&aiModel=${encodeURIComponent(selectedModel)}&lang=${encodeURIComponent(targetLang)}&page=${page}&pageSize=${pageSize}`
      );

      if (!res.ok) {
        if (res.status >= 500) {
          setSearchStatus('server_error');
          setErrorMessage('Something went wrong on our side. Please try again.');
        } else {
          setSearchStatus('provider_unavailable');
          setErrorMessage("We couldn't retrieve live search results right now. Please try again in a few moments.");
        }
        setResults([]);
        setAiAnswer(null);
        return;
      }

      const data = await res.json();
      const fetchedResults: SearchResultItem[] = data.results || [];
      setSearchProvider(data.provider || 'Sarath Search');
      setSpellInfo({
        isCorrected: data.is_corrected || false,
        correctedQuery: data.corrected_query || null,
        originalQuery: data.original_query || queryParam,
      });

      if (fetchedResults.length > 0) {
        setResults(fetchedResults);
        setAiAnswer(data.ai_answer || null);
        setTotalResults(data.total || fetchedResults.length);
        setSearchStatus('success');
      } else {
        setResults([]);
        setAiAnswer(null);
        setTotalResults(0);
        setSearchStatus('no_results');
      }
    } catch (err: any) {
      console.warn('Search network or fetch exception:', err);
      if (typeof window !== 'undefined' && !navigator.onLine) {
        setSearchStatus('network_error');
        setErrorMessage("You're currently offline or your network connection is unavailable.");
      } else {
        setSearchStatus('provider_unavailable');
        setErrorMessage("We couldn't retrieve live search results right now. Please try again in a few moments.");
      }
      setResults([]);
      setAiAnswer(null);
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
        <Sidebar
          currentCategory={category}
          onSelectCategory={(cat) => {
            setCategory(cat);
            setPage(1);
            router.push(`/search?q=${encodeURIComponent(queryParam)}&category=${cat}`);
          }}
        />

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
                  <button
                    type="button"
                    onClick={() => setVoiceOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    title="Voice Search"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLensOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    title="Sarath Lens Visual Search"
                  >
                    <Camera className="w-4 h-4 text-purple-400" />
                  </button>
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

              <button
                type="submit"
                className="px-5 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center"
              >
                Search
              </button>

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
          </div>

          {/* Main Results & Status Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Skeleton Loader */}
              {loading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-44 rounded-3xl bg-white/5 border border-white/10" />
                  <div className="h-32 rounded-3xl bg-white/5 border border-white/10" />
                  <div className="h-32 rounded-3xl bg-white/5 border border-white/10" />
                </div>
              )}

              {/* STATE 1 - SUCCESS */}
              {!loading && searchStatus === 'success' && results.length > 0 && (
                <div className="space-y-4">
                  {/* Spell Correction Notice Banner */}
                  {spellInfo.isCorrected && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/40 text-xs text-purple-200 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                        <span>
                          Showing results for <strong className="text-white font-bold font-outfit text-sm">{spellInfo.correctedQuery}</strong>.
                          Search instead for{' '}
                          <button
                            type="button"
                            onClick={() => handleSearchSubmit(undefined, spellInfo.originalQuery)}
                            className="text-cyan-400 hover:underline font-mono underline-offset-2"
                          >
                            {spellInfo.originalQuery}
                          </button>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cached Results Notice Badge */}
                  {searchProvider.includes('Cache') && (
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 font-medium">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Showing cached results while live search is temporarily unavailable.</span>
                    </div>
                  )}

                  {/* AI Overview Component (Renders First if AI Mode is ON) */}
                  {aiMode && aiAnswer && (
                    <AiAnswerCard
                      data={aiAnswer}
                      onSelectQuery={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
                      onLanguageChange={(lang) => setTargetLang(lang)}
                      onRegenerate={() => fetchSearchResults()}
                    />
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-2 py-1">
                    <span>{results.length} search results</span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      {searchProvider}
                    </span>
                  </div>

                  {results.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-6 rounded-3xl bg-glass-card hover:bg-glass border border-white/10 hover:border-purple-400/40 shadow-xl transition-all group space-y-3 relative overflow-hidden"
                    >
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
                            <ShieldCheck className="w-3 h-3 text-purple-400" /> Verified Domain
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-lg font-bold text-white hover:text-purple-300 font-outfit transition-colors leading-snug"
                          >
                            {item.title}
                          </a>

                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {item.meta_description}
                          </p>
                        </div>

                        {item.og_image && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-2xl overflow-hidden border border-white/10 w-full md:w-36 h-24 bg-black/40 hover:opacity-90 transition-opacity">
                            <img
                              src={item.og_image}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </a>
                        )}
                      </div>

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

                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({ title: item.title, url: item.url }).catch(() => {});
                              } else {
                                handleCopyLink(item.url);
                              }
                            }}
                            className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                            title="Share Link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {item.reading_time_min ? `${item.reading_time_min} min read` : '2 min read'}
                          </span>
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

                  <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none border border-white/10 text-white font-bold transition-all"
                    >
                      ← Previous Page
                    </button>
                    <span className="font-mono text-zinc-400 font-bold">Page {page}</span>
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

              {/* STATE 2 - NO MATCHING RESULTS */}
              {!loading && searchStatus === 'no_results' && (
                <div className="p-10 rounded-3xl bg-glass-card border border-white/10 text-center space-y-4">
                  <Search className="w-12 h-12 text-zinc-500 mx-auto" />
                  <h3 className="text-xl font-bold text-white font-outfit">No matching results found.</h3>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-300 max-w-md mx-auto text-left space-y-2">
                    <p className="font-bold text-purple-300">Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-400">
                      <li>Check your spelling for typos</li>
                      <li>Try different or broader search keywords</li>
                      <li>Try searching without specific filters</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* STATE 3 - LIVE SEARCH UNAVAILABLE */}
              {!loading && searchStatus === 'provider_unavailable' && (
                <div className="p-10 rounded-3xl bg-glass-card border border-amber-500/30 text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white font-outfit">We couldn't retrieve live search results right now.</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">Please try again in a few moments.</p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => fetchSearchResults()}
                      className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Search
                    </button>
                    <button
                      onClick={() => router.push('/history')}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
                    >
                      <History className="w-3.5 h-3.5 text-cyan-400" /> View Recent Searches
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 4 - NETWORK ERROR */}
              {!loading && searchStatus === 'network_error' && (
                <div className="p-10 rounded-3xl bg-glass-card border border-rose-500/30 text-center space-y-4">
                  <WifiOff className="w-12 h-12 text-rose-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white font-outfit">You're currently offline or your network connection is unavailable.</h3>
                  <button
                    onClick={() => fetchSearchResults()}
                    className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Search
                  </button>
                </div>
              )}

              {/* STATE 5 - INTERNAL SERVER ERROR */}
              {!loading && searchStatus === 'server_error' && (
                <div className="p-10 rounded-3xl bg-glass-card border border-rose-500/30 text-center space-y-4">
                  <ServerCrash className="w-12 h-12 text-rose-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white font-outfit">Something went wrong on our side.</h3>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => fetchSearchResults()}
                      className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Search
                    </button>
                    <button
                      onClick={() => router.push('/contact')}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Knowledge Column (Renders ONLY WHEN search results exist) */}
            {!loading && searchStatus === 'success' && results.length > 0 && (
              <div className="space-y-6">
                <KnowledgeCard query={queryParam} hasResults={results.length > 0} />

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
            )}
          </div>
        </main>
      </div>

      <LensSearchModal isOpen={lensOpen} onClose={() => setLensOpen(false)} />
      <VoiceSearchModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={(text) => {
          setQuery(text);
          handleSearchSubmit(undefined, text);
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
