"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Clock, Search, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HistoryItem {
  id: string;
  query: string;
  category: string;
  searched_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('search_history')
          .select('*')
          .order('searched_at', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          setHistory(data);
        } else {
          setHistory([
            { id: '1', query: 'Sarath Search v3.1', category: 'all', searched_at: new Date().toISOString() },
            { id: '2', query: 'Next.js App Router', category: 'docs', searched_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', query: 'Supabase Database Schema', category: 'all', searched_at: new Date(Date.now() - 86400000).toISOString() },
          ]);
        }
      } catch (e) {
        console.warn('History fetch error', e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await supabase.from('search_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      setHistory([]);
    } catch (e) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-400" /> Search History
              </h1>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-xs text-zinc-400 animate-pulse">Loading search history...</div>
            ) : history.length > 0 ? (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-400/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="font-bold text-white text-sm">{item.query}</span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="uppercase px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                            {item.category || 'all'}
                          </span>
                          <span>•</span>
                          <span>{new Date(item.searched_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No search history found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
