"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { FileText, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" /> Terms of Service
            </h1>
            <p className="text-xs text-zinc-400">Effective Date: August 5, 2026</p>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">1. Acceptance of Terms</h3>
                <p>By accessing or using Sarath Search Engine, you agree to comply with and be bound by these Terms of Service.</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">2. Privacy & Data Handling</h3>
                <p>Sarath Search prioritizes user privacy. We do not track, profile, or sell personal query records to third-party advertisers.</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">3. Search Console & Crawling Rules</h3>
                <p>Domain owners utilizing Sarath Search Console must adhere to standard web crawling practices and robots.txt directives.</p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
