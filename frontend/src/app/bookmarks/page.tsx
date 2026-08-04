"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Bookmark, ExternalLink } from 'lucide-react';

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-cyan-400" /> Bookmarks & Saved Results
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your saved web search results and bookmarked links.
            </p>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
              <Bookmark className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">No saved bookmarks yet. Click "Save" on search result cards.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
