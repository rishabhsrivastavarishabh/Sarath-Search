"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  selectedIndex: number;
}

const POPULAR_ENTITIES = [
  'Next.js 15 features',
  'Artificial Intelligence trends',
  'Python web scraping guide',
  'Supabase PostgreSQL database',
  'Google Search Engine API',
  'React 19 Server Components',
  'Tailwind CSS v4 setup',
  'OpenAI GPT-4.1 vs Claude 3.5',
  'Machine Learning algorithms',
  'TypeScript best practices',
];

export function SearchSuggestions({
  query,
  isOpen,
  onSelect,
  onClose,
  selectedIndex,
}: SearchSuggestionsProps) {
  const [historyItems, setHistoryItems] = useState<string[]>([]);

  useEffect(() => {
    // Load recent search history from local storage / Supabase
    if (typeof window !== 'undefined') {
      const localHistory = localStorage.getItem('sarath_recent_searches');
      if (localHistory) {
        try {
          setHistoryItems(JSON.parse(localHistory));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  // Combine history, popular entities, and autocomplete matches
  let matchedSuggestions: { text: string; type: 'history' | 'trending' | 'autocomplete' }[] = [];

  if (!cleanQ) {
    // Show recent searches + trending when query is empty
    historyItems.slice(0, 4).forEach((h) => {
      matchedSuggestions.push({ text: h, type: 'history' });
    });
    POPULAR_ENTITIES.slice(0, 6).forEach((p) => {
      if (!matchedSuggestions.some((m) => m.text.toLowerCase() === p.toLowerCase())) {
        matchedSuggestions.push({ text: p, type: 'trending' });
      }
    });
  } else {
    // Filter history matching query
    historyItems.forEach((h) => {
      if (h.toLowerCase().includes(cleanQ)) {
        matchedSuggestions.push({ text: h, type: 'history' });
      }
    });

    // Filter popular entities matching query
    POPULAR_ENTITIES.forEach((p) => {
      if (p.toLowerCase().includes(cleanQ) && !matchedSuggestions.some((m) => m.text.toLowerCase() === p.toLowerCase())) {
        matchedSuggestions.push({ text: p, type: 'autocomplete' });
      }
    });

    // Generate smart query expansions
    const expansions = [
      `${cleanQ} tutorial`,
      `${cleanQ} documentation`,
      `what is ${cleanQ}`,
      `best ${cleanQ} examples`,
    ];

    expansions.forEach((exp) => {
      if (!matchedSuggestions.some((m) => m.text.toLowerCase() === exp.toLowerCase())) {
        matchedSuggestions.push({ text: exp, type: 'autocomplete' });
      }
    });
  }

  // Limit to 10 suggestions max
  const suggestions = matchedSuggestions.slice(0, 10);

  if (suggestions.length === 0) return null;

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, idx) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={idx} className="text-purple-400 font-bold">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="absolute left-0 right-0 top-full mt-2 bg-zinc-950/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden text-xs py-2"
      >
        {suggestions.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(item.text)}
              className={`w-full px-5 py-2.5 flex items-center justify-between text-left transition-all ${
                isSelected
                  ? 'bg-purple-600/20 text-white border-l-4 border-purple-400 font-bold pl-4'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                {item.type === 'history' ? (
                  <Clock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                ) : item.type === 'trending' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                )}
                <span className="truncate">{highlightMatch(item.text, cleanQ)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 capitalize">
                  {item.type === 'history' ? 'Recent' : item.type === 'trending' ? 'Trending' : 'Suggest'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
