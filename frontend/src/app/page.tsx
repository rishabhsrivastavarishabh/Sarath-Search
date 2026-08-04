"use client";

import React, { useState } from 'react';
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

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'voice' | 'image' | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

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

        {/* Modern Search Box */}
        <motion.form
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSearch}
          className="w-full max-w-2xl relative group mb-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-[9999px] blur-xl opacity-35 group-hover:opacity-75 transition-opacity duration-500" />
          
          <div className="relative flex items-center bg-zinc-900/90 border border-white/15 rounded-[9999px] px-6 py-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-500/25">
            <Search className="w-5 h-5 text-muted-foreground mr-3 group-hover:text-purple-400 transition-colors" />
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
        </motion.form>

        {/* Popular / Trending Pills */}
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

      {/* Voice / Image Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {activeModal === 'voice' ? (
                <div>
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-4 animate-pulse">
                    <Mic className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit">Voice Search</h3>
                  <p className="text-xs text-zinc-400 mb-6">Speak clearly to search with Sarath AI.</p>
                  <button
                    onClick={() => {
                      setQuery('artificial intelligence research');
                      setActiveModal(null);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-full hover:brightness-110 transition-all"
                  >
                    Sample Search Query
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-outfit">Visual Search</h3>
                  <p className="text-xs text-zinc-400 mb-6">Drag & drop image or upload file to search.</p>
                  <button
                    onClick={() => {
                      setQuery('visual data recognition');
                      setActiveModal(null);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-full hover:brightness-110 transition-all"
                  >
                    Select Demo Image
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full bg-glass border-t border-white/10 py-4 px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 font-medium tracking-wide gap-2">
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Search Terms</a>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono text-[10px]">
            v2.0
          </span>
          <span>© 2026 Sarath Search Engine</span>
        </div>
      </footer>
    </div>
  );
}
