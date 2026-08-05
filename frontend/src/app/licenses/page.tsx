"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Code, Shield } from 'lucide-react';

export default function LicensesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-400" /> Open Source Licenses
            </h1>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="font-bold text-white">Next.js 15</span> — MIT License
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="font-bold text-white">Supabase Client</span> — MIT License
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="font-bold text-white">Framer Motion</span> — MIT License
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="font-bold text-white">Lucide React Icons</span> — ISC License
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
