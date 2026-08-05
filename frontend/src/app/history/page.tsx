"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Clock, Search, Trash2, ArrowRight, Pin, Check, X, Shield, Sparkles, Filter } from 'lucide-react';
import {
  fetchUserSearchHistory,
  deleteHistoryItem,
  deleteMultipleHistoryItems,
  clearAllSearchHistory,
  togglePinHistoryItem,
  SearchHistoryItem
} from '@/lib/search-history';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'recent'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    const data = await fetchUserSearchHistory();
    setHistory(data);
    setLoading(false);
  }

  const handleDeleteItem = async (e: React.MouseEvent, id: string, query: string) => {
    e.stopPropagation();
    await deleteHistoryItem(id, query);
    setHistory(history.filter(item => item.id !== id));
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const handleTogglePin = async (e: React.MouseEvent, item: SearchHistoryItem) => {
    e.stopPropagation();
    await togglePinHistoryItem(item.id, item.is_pinned);
    setHistory(history.map(h => h.id === item.id ? { ...h, is_pinned: !h.is_pinned } : h));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteMultipleHistoryItems(selectedIds);
    setHistory(history.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      await clearAllSearchHistory();
      setHistory([]);
      setSelectedIds([]);
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filtered List
  const filteredHistory = history.filter(item => {
    const matchesFilter = item.query.toLowerCase().includes(searchFilter.toLowerCase());
    if (activeTab === 'pinned') return matchesFilter && item.is_pinned;
    if (activeTab === 'recent') return matchesFilter && !item.is_pinned;
    return matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full space-y-6">
          <div className="p-8 rounded-3xl bg-glass border border-white/10 shadow-2xl space-y-6">
            {/* Header Title & Actions */}
            <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-400" /> Search History
                </h1>
                <p className="text-xs text-zinc-400">Synced search activity & pinned queries across your devices</p>
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                  </button>
                )}

                {history.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All History
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Bar inside History */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search in history..."
                  className="w-full bg-zinc-950/80 border border-white/15 rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full font-bold transition-all border',
                    activeTab === 'all' ? 'bg-purple-600/30 text-purple-300 border-purple-500/50' : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  All ({history.length})
                </button>
                <button
                  onClick={() => setActiveTab('pinned')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full font-bold transition-all border',
                    activeTab === 'pinned' ? 'bg-purple-600/30 text-purple-300 border-purple-500/50' : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  Pinned ({history.filter(h => h.is_pinned).length})
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full font-bold transition-all border',
                    activeTab === 'recent' ? 'bg-purple-600/30 text-purple-300 border-purple-500/50' : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* History List */}
            {loading ? (
              <div className="text-xs text-zinc-400 animate-pulse py-8 text-center">Loading search history...</div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-2.5">
                {filteredHistory.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
                      className={cn(
                        'p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer relative',
                        item.is_pinned ? 'bg-purple-950/20 border-purple-500/30' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-purple-400/40'
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectId(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                        
                        <Search className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{item.query}</span>
                            {item.is_pinned && (
                              <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                                Pinned
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                            <span className="uppercase font-semibold text-cyan-400">{item.search_type || 'all'}</span>
                            <span>•</span>
                            <span>{new Date(item.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleTogglePin(e, item)}
                          className={cn(
                            'p-1.5 rounded-full transition-colors',
                            item.is_pinned ? 'text-purple-400 hover:text-purple-300' : 'text-zinc-500 hover:text-white'
                          )}
                          title={item.is_pinned ? 'Unpin' : 'Pin Favorite'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteItem(e, item.id, item.query)}
                          className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors ml-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No search history found matching your filter.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
