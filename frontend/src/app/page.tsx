"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LANDING_TRENDS, LANDING_RECENT } from '@/lib/mock-data';
import { Logo } from '@/components/Logo';
import { Header } from '@/components/Header';
import { LensSearchModal } from '@/components/LensSearchModal';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';
import { SearchSuggestions } from '@/components/SearchSuggestions';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'voice' | 'image' | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchBoxRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickSearch = (q: string) => {
    saveRecentSearch(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const saveRecentSearch = (q: string) => {
    if (typeof window !== 'undefined') {
      try {
        const localHistory = localStorage.getItem('sarath_recent_searches');
        let historyArr: string[] = localHistory ? JSON.parse(localHistory) : [];
        historyArr = [q, ...historyArr.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 10);
        localStorage.setItem('sarath_recent_searches', JSON.stringify(historyArr));
      } catch (e) {
        // ignore
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < 9 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 9));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      {/* Header Navigation */}
      <Header />

      {/* Ambient Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-purple-600/20 rounded-full blur-[140px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-cyan-500/20 rounded-full blur-[140px] animate-float pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Main Centered Hero Layout */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full">
        
        {/* Hero Title & Logo */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <Logo size="xl" showText={false} className="mb-4 drop-shadow-[0_0_35px_rgba(168,85,247,0.35)]" />

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter font-outfit text-white">
            Sar<span className="text-purple-400">a</span>th <span className="text-gradient">Search</span>
          </h1>
          <p className="text-xs sm:text-sm text-cyan-400/90 mt-2 font-bold tracking-[0.25em] uppercase">
            Private • Fast • Intelligent
          </p>
        </motion.div>

        {/* Modern Search Box with Real-time Keyword Suggestions */}
        <motion.form
          ref={searchBoxRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSearch}
          className="w-full max-w-2xl relative group mb-8 z-30"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-[9999px] blur-xl opacity-35 group-hover:opacity-75 transition-opacity duration-500" />
          
          <div className="relative flex items-center bg-zinc-900/90 border border-white/15 rounded-[9999px] px-6 py-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-500/25">
            <Search className="w-5 h-5 text-muted-foreground mr-3 group-hover:text-purple-400 transition-colors" />
            
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search anything..."
              className="flex-1 bg-transparent outline-none text-base text-white placeholder:text-zinc-500 font-medium"
            />

            <div className="flex items-center gap-2 ml-3">
              <button
                type="button"
                onClick={() => setActiveModal('voice')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('image')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                title="Visual Search"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white p-2.5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center ml-1"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Keyword Suggestions Dropdown */}
          <SearchSuggestions
            query={query}
            isOpen={showSuggestions}
            selectedIndex={selectedIndex}
            onSelect={(suggestion) => {
              setQuery(suggestion);
              setShowSuggestions(false);
              handleQuickSearch(suggestion);
            }}
            onClose={() => setShowSuggestions(false)}
          />
        </motion.form>

        {/* Popular / Trending Keyword Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-4 w-full max-w-3xl"
        >
          <div className="flex flex-wrap justify-center items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              <TrendingUp className="w-3 h-3 text-purple-400" /> Popular
            </span>
            {LANDING_TRENDS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickSearch(item.query)}
                className="px-3.5 py-1 rounded-full bg-glass-card hover:bg-glass text-xs text-zinc-300 hover:text-white hover:border-purple-400/50 transition-all cursor-pointer border border-white/5 hover:scale-105"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              <Clock className="w-3 h-3 text-cyan-400" /> Recent
            </span>
            {LANDING_RECENT.map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickSearch(item.query)}
                className="px-3.5 py-1 rounded-full bg-glass-card hover:bg-glass text-xs text-zinc-300 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer border border-white/5 hover:scale-105"
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

      </main>

      {/* Voice / Lens Modals */}
      <VoiceSearchModal
        isOpen={activeModal === 'voice'}
        onClose={() => setActiveModal(null)}
        onTranscript={(speechQuery) => {
          setQuery(speechQuery);
          setActiveModal(null);
          handleQuickSearch(speechQuery);
        }}
      />

      <LensSearchModal isOpen={activeModal === 'image'} onClose={() => setActiveModal(null)} />

      {/* Footer */}
      <footer className="w-full bg-glass border-t border-white/10 py-4 px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 font-medium tracking-wide gap-2">
        <div className="flex gap-6">
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="/licenses" className="hover:text-white transition-colors">Licenses</a>
          <a href="/help" className="hover:text-white transition-colors">Help Center</a>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono text-[10px]">
            v7.0 Global AI Search
          </span>
          <span>© 2026 Sarath Search Engine</span>
        </div>
      </footer>
    </div>
  );
}
