"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Logo } from '@/components/Logo';
import { Sparkles, Shield, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Logo size="md" showTagline={true} />
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
              <p className="text-sm font-semibold text-white">
                Sarath Search Engine v5.0 is an Enterprise Search Platform built for speed, privacy, and intelligent Web AI answers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-white text-sm">Zero Hallucinations</h4>
                  <p className="text-[11px] text-zinc-400">All results & AI answers originate strictly from verified web references.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white text-sm">Ultra Fast Latency</h4>
                  <p className="text-[11px] text-zinc-400">Next.js 15 SSR caching & instant DuckDuckGo/Google search pipeline.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <Globe className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-white text-sm">Enterprise Console</h4>
                  <p className="text-[11px] text-zinc-400">Search Console with Domain Verification, Sitemaps, and Robots testing.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
